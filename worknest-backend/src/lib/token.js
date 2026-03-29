import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getJwtSecrets } from "../config/env.js";

export const USER_REFRESH_COOKIE_NAME = "userRefreshToken";
export const ADMIN_REFRESH_COOKIE_NAME = "adminRefreshToken";
export const REFRESH_COOKIE_PATH = "/";
export const LEGACY_USER_REFRESH_COOKIE_PATH = "/api/v1/auth/refresh-token";
export const LEGACY_ADMIN_REFRESH_COOKIE_PATH = "/api/v1/admin/refresh-token";

const DEFAULT_REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DURATION_TO_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const parseDurationToMs = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value !== "string") {
    return DEFAULT_REFRESH_COOKIE_MAX_AGE_MS;
  }

  const trimmedValue = value.trim();
  const matchedDuration = /^(\d+)(ms|s|m|h|d)$/i.exec(trimmedValue);

  if (!matchedDuration) {
    return DEFAULT_REFRESH_COOKIE_MAX_AGE_MS;
  }

  const [, rawAmount, rawUnit] = matchedDuration;
  const amount = Number.parseInt(rawAmount, 10);
  const unit = rawUnit.toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0 || !DURATION_TO_MS[unit]) {
    return DEFAULT_REFRESH_COOKIE_MAX_AGE_MS;
  }

  return amount * DURATION_TO_MS[unit];
};

const isSecureRequest = (req) => {
  if (req?.secure) {
    return true;
  }

  const forwardedProto = req?.headers?.["x-forwarded-proto"];
  return (
    typeof forwardedProto === "string" &&
    forwardedProto.split(",")[0].trim().toLowerCase() === "https"
  );
};

const getRefreshCookieMaxAge = () =>
  parseDurationToMs(process.env.JWT_REFRESH_TOKEN_EXPIRES);

export const buildRefreshCookieOptions = (req, overrides = {}) => {
  const secure = isSecureRequest(req);
  const maxAge = getRefreshCookieMaxAge();

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge,
    expires: new Date(Date.now() + maxAge),
    ...overrides,
  };
};

export const clearRefreshTokenCookie = (
  res,
  req,
  cookieName,
  legacyPaths = [],
) => {
  const clearedCookieOptions = buildRefreshCookieOptions(req, {
    maxAge: 0,
    expires: new Date(0),
  });

  res.cookie(cookieName, "", clearedCookieOptions);

  legacyPaths
    .filter((path) => path && path !== clearedCookieOptions.path)
    .forEach((path) => {
      res.cookie(cookieName, "", {
        ...clearedCookieOptions,
        path,
      });
    });
};

export const setRefreshTokenCookie = (
  res,
  req,
  cookieName,
  refreshToken,
  legacyPaths = [],
) => {
  clearRefreshTokenCookie(res, req, cookieName, legacyPaths);
  res.cookie(cookieName, refreshToken, buildRefreshCookieOptions(req));
};

export const signToken = (id, tokenVersion = 0) => {
  const { accessSecret, refreshSecret } = getJwtSecrets();
  const refreshJti = crypto.randomUUID();
  const accessToken = jwt.sign(
    { id, tokenType: "access", tokenVersion },
    accessSecret,
    {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    },
  );
  const refreshToken = jwt.sign(
    { id, tokenType: "refresh", tokenVersion, jti: refreshJti },
    refreshSecret,
    {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
    },
  );
  return { accessToken, refreshToken };
};

export const createSendToken = (user, tokenVersion = 0) => {
  if (!user) return;
  const token = signToken(user._id, tokenVersion); //this is from mongodb id doc
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
  };
};

export const createAdminSendToken = (user, tokenVersion = 0) => {
  if (!user) return;
  const token = signToken(user._id, tokenVersion); //this is from mongodb id doc
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
  };
};
