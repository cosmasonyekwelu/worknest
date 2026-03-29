import { ForbiddenError } from "../lib/errors.js";

const parseAllowedOrigins = (rawOrigins = "") =>
  rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin?.replace(/\/+$/, "") || "";
  }
};

export const buildCorsOptions = (allowedOrigins = []) => {
  const normalizedAllowlist = allowedOrigins.map(normalizeOrigin);

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (normalizedAllowlist.length === 0 && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      const normalizedIncoming = normalizeOrigin(origin);
      const isAllowed = normalizedAllowlist.some((allowed) => {
        if (!allowed) return false;
        if (allowed === "*") return true;
        return normalizedIncoming === allowed;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new ForbiddenError("CORS origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-Requested-With"],
  };
};

export const enforceHttpsMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecureProxy = typeof forwardedProto === "string" && forwardedProto.split(",")[0].trim() === "https";

  if (req.secure || isSecureProxy) {
    return next();
  }

  return next(new ForbiddenError("HTTPS is required"));
};

export const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS || "");
