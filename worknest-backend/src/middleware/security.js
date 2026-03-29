import { ForbiddenError } from "../lib/errors.js";

export const parseAllowedOrigins = (...rawOriginGroups) =>
  Array.from(
    new Set(
      rawOriginGroups
        .flatMap((rawOrigins) => String(rawOrigins || "").split(","))
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  );

export const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin?.replace(/\/+$/, "") || "";
  }
};

export const isAllowedOrigin = (origin, allowedOrigins = []) => {
  const normalizedIncoming = normalizeOrigin(origin);
  const normalizedAllowlist = allowedOrigins.map(normalizeOrigin);

  return normalizedAllowlist.some((allowed) => {
    if (!allowed || allowed === "*") {
      return false;
    }

    return normalizedIncoming === allowed;
  });
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

      if (isAllowedOrigin(origin, allowedOrigins)) {
        return callback(null, true);
      }

      return callback(new ForbiddenError("CORS origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    optionsSuccessStatus: 200,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Id",
      "X-Requested-With",
      "X-Worknest-Csrf",
    ],
  };
};

export const getAllowedOriginsFromEnv = (env = process.env) =>
  parseAllowedOrigins(env.CLIENT_URL, env.ALLOWED_ORIGINS);

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

export const allowedOrigins = getAllowedOriginsFromEnv();
