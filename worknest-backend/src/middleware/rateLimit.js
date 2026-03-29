import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { getSharedRateLimitStore } from "../config/rateLimitStore.js";

const resolveAuthenticatedIdentity = (req) => {
  const userId = req.user?._id?.toString?.() || req.user?.id;
  return userId ? `user:${userId}` : "anonymous";
};

export const buildRateLimitKey = (req, scope = "global") => {
  const identity = resolveAuthenticatedIdentity(req);
  return `${scope}:${ipKeyGenerator(req.ip)}:${identity}`;
};

const defaultHandlerMessage = "Too many requests, please try again later";
const normalizeEmailKey = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

export const buildEmailRateLimitKey = (req, scope = "email") => {
  const emailKey = normalizeEmailKey(req.body?.email) || "unknown-email";
  return `${scope}:${ipKeyGenerator(req.ip)}:email:${emailKey}`;
};

const createLimiter = (scope, options) =>
  rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    store: getSharedRateLimitStore({
      scope,
      windowMs: options.windowMs,
      max: options.max,
    }),
  });

// General rate limit for authentication endpoints
export const rateLimiter = createLimiter("auth", {
  windowMs: 2 * 60 * 1000,
  max: 10,
  message: defaultHandlerMessage,
  keyGenerator: (req) => buildRateLimitKey(req, "auth"),
});

// Rate limit for refresh token endpoint
export const refreshTokenLimit = createLimiter("refresh-token", {
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: defaultHandlerMessage,
  keyGenerator: (req) => buildRateLimitKey(req, "refresh-token"),
});

export const forgotPasswordLimiter = createLimiter("forgot-password", {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset attempts for this email address. Please wait and try again.",
  keyGenerator: (req) => buildEmailRateLimitKey(req, "forgot-password"),
});

export const resetPasswordLimiter = createLimiter("reset-password", {
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many password reset attempts for this email address. Please wait and try again.",
  keyGenerator: (req) => buildEmailRateLimitKey(req, "reset-password"),
});

// Rate limit for high-write application endpoint
export const applyJobLimiter = createLimiter("apply-job", {
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many application attempts, please wait and try again",
  keyGenerator: (req) => buildRateLimitKey(req, "apply-job"),
});

export const apiLimiter = createLimiter("api", {
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: defaultHandlerMessage,
  keyGenerator: (req) => buildRateLimitKey(req, "api"),
});
