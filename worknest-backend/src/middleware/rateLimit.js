import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const buildKey = (req) => {
  const userId = req.user?._id?.toString?.() || req.user?.id || "anonymous";
  const userAgent = req.headers["user-agent"] || "unknown-user-agent";
  return `${ipKeyGenerator(req.ip)}-${userId}-${userAgent}`;
};

const defaultHandlerMessage = "Too many requests, please try again later";
const normalizeEmailKey = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

// General rate limit for authentication endpoints
export const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 10,
  message: defaultHandlerMessage,
  standardHeaders: true,
  keyGenerator: buildKey,
  legacyHeaders: false,
});

// Rate limit for refresh token endpoint
export const refreshTokenLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: defaultHandlerMessage,
  standardHeaders: true,
  keyGenerator: buildKey,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset attempts for this email address. Please wait and try again.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const emailKey = normalizeEmailKey(req.body?.email) || "unknown-email";
    return `${ipKeyGenerator(req.ip)}-${emailKey}`;
  },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many password reset attempts for this email address. Please wait and try again.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const emailKey = normalizeEmailKey(req.body?.email) || "unknown-email";
    return `${ipKeyGenerator(req.ip)}-${emailKey}`;
  },
});

// Rate limit for high-write application endpoint
export const applyJobLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many application attempts, please wait and try again",
  standardHeaders: true,
  keyGenerator: buildKey,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: defaultHandlerMessage,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: buildKey,
});
