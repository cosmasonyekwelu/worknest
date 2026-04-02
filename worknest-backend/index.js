import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { helmetOptions, compressionOptions } from "./src/lib/options.js";
import logger from "./src/config/logger.js";
import {
  connectToDB,
  gracefulShutdown,
  isDatabaseReady,
} from "./src/config/db.server.js";
import { validateEnv } from "./src/config/env.js";
import { apiLimiter } from "./src/middleware/rateLimit.js";
import {
  buildCorsOptions,
  allowedOrigins,
  enforceHttpsMiddleware,
} from "./src/middleware/security.js";
import {
  requestMetricsMiddleware,
  buildPrometheusMetrics,
  getMetricsSnapshot,
} from "./src/middleware/metrics.js";
import { requestIdMiddleware } from "./src/middleware/requestId.js";
import {
  catchNotFound,
  globalErrorHandler,
} from "./src/middleware/errorHandler.js";

dotenv.config();
validateEnv();

import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import contactRoutes from "./src/routes/contactRoute.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";
import resumeRoutes from "./src/routes/resumeRoutes.js";
import docsRoutes from "./src/routes/docsRoutes.js";

const app = express();
app.set("trust proxy", 1);

app.use(cors(buildCorsOptions(allowedOrigins)));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.disable("x-powered-by");
app.use(requestIdMiddleware);
app.use(enforceHttpsMiddleware);
app.use(requestMetricsMiddleware);
app.use(helmet(helmetOptions));
app.use(compression(compressionOptions));
app.use(apiLimiter);

app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});

const buildAbsoluteUrl = (req, routePath) => {
  const host = req.get("host");
  if (!host) {
    return routePath;
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto
    ? forwardedProto.split(",")[0].trim()
    : req.protocol;

  return `${protocol}://${host}${routePath}`;
};

const baseHealthPayload = (req) => ({
  status: "success",
  message: "Welcome to Worknest Backend API",
  environment: process.env.NODE_ENV,
  timestamp: req.requestTime,
  docs: {
    swaggerUi: buildAbsoluteUrl(req, "/docs"),
    openApi: buildAbsoluteUrl(req, "/openapi.json"),
  },
});

const sendLiveHealth = (req, res) => {
  res.status(200).json({ status: "ok", timestamp: req.requestTime });
};

const sendReadyHealth = (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({
      status: "not_ready",
      database: "disconnected",
      timestamp: req.requestTime,
    });
  }

  return res.status(200).json({
    status: "ready",
    database: "connected",
    timestamp: req.requestTime,
  });
};

app.get("/", (req, res) => {
  res.status(200).json(baseHealthPayload(req));
});

app.head("/", (req, res) => {
  res.status(200).end();
});

const verifyMonitoringToken = (req, res, next) => {
  const expectedToken = process.env.MONITORING_TOKEN;
  const providedToken = req.get("x-monitoring-token");

  if (!expectedToken) {
    logger.warn(
      "Monitoring endpoint requested without MONITORING_TOKEN configured",
    );
    return res.status(503).json({ error: "Monitoring is not configured" });
  }

  if (!providedToken || providedToken !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
};

app.get("/metrics", verifyMonitoringToken, (req, res) => {
  res.set("Content-Type", "text/plain; version=0.0.4");
  res.status(200).send(buildPrometheusMetrics());
});

app.get("/metrics/snapshot", verifyMonitoringToken, (req, res) => {
  res
    .status(200)
    .json({ status: "ok", data: getMetricsSnapshot(), timestamp: req.requestTime });
});

app.get("/health", sendLiveHealth);
app.get("/ready", sendReadyHealth);
app.get("/health/live", sendLiveHealth);
app.get("/health/ready", sendReadyHealth);

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/users/me/settings", settingsRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use(docsRoutes);

app.use(catchNotFound);
app.use(globalErrorHandler);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectToDB().catch((error) => {
      logger.error(
        "Initial MongoDB connection failed. Continuing startup in degraded mode.",
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      return null;
    });

    const server = app.listen(PORT, "0.0.0.0", () => {
      const localBaseUrl = `http://localhost:${PORT}`;

      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
      );
      logger.info(`Listening on http://0.0.0.0:${PORT}`);
      logger.info(`Swagger UI available at ${localBaseUrl}/docs`);
      logger.info(`OpenAPI spec available at ${localBaseUrl}/openapi.json`);
    });

    process.once("uncaughtException", (error) => {
      logger.error("Uncaught exception. Shutting down.", {
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      gracefulShutdown(server)
        .catch(() => null)
        .finally(() => process.exit(1));
    });

    process.once("unhandledRejection", (reason) => {
      const error =
        reason instanceof Error
          ? `${reason.name}: ${reason.message}`
          : String(reason);

      logger.error("Unhandled rejection. Shutting down.", { error });

      gracefulShutdown(server)
        .catch(() => null)
        .finally(() => process.exit(1));
    });

    const handleSignal = () => {
      gracefulShutdown(server)
        .catch(() => null)
        .finally(() => process.exit(0));
    };

    process.once("SIGTERM", handleSignal);
    process.once("SIGINT", handleSignal);

    server.on("error", (error) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      switch (error.code) {
        case "EACCES":
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
};

startServer();
