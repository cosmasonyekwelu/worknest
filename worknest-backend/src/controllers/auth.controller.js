import tryCatchFn from "../lib/tryCatchFn.js";
import responseHandler from "../lib/responseHandler.js";
import {
  createSendToken,
  LEGACY_USER_REFRESH_COOKIE_PATH,
  setRefreshTokenCookie,
  USER_REFRESH_COOKIE_NAME,
} from "../lib/token.js";
import authService from "../services/auth.service.js";
import { getRefreshTokenFromRequest } from "../lib/refreshToken.js";

const { successResponse } = responseHandler;

export const register = tryCatchFn(async (req, res) => {
  const user = await authService.register(req);
  const { accessToken, refreshToken } = createSendToken(user, user.tokenVersion || 0);
  await authService.issueAndPersistRefreshToken(user._id, refreshToken);
  setRefreshTokenCookie(
    res,
    req,
    USER_REFRESH_COOKIE_NAME,
    refreshToken,
    [LEGACY_USER_REFRESH_COOKIE_PATH],
  );
  return successResponse(res, { accessToken }, "Registration successful", 201);
});

export const login = tryCatchFn(async (req, res) => {
  const user = await authService.login(req);
  const { accessToken, refreshToken } = createSendToken(user, user.tokenVersion || 0);
  await authService.issueAndPersistRefreshToken(user._id, refreshToken);
  setRefreshTokenCookie(
    res,
    req,
    USER_REFRESH_COOKIE_NAME,
    refreshToken,
    [LEGACY_USER_REFRESH_COOKIE_PATH],
  );
  return successResponse(res, { accessToken }, "Login successful", 200);
});

export const googleLogin = tryCatchFn(async (req, res) => {
  const user = await authService.loginWithGoogle(req.body);
  const { accessToken, refreshToken } = createSendToken(
    user,
    user.tokenVersion || 0,
  );
  await authService.issueAndPersistRefreshToken(user._id, refreshToken);
  setRefreshTokenCookie(
    res,
    req,
    USER_REFRESH_COOKIE_NAME,
    refreshToken,
    [LEGACY_USER_REFRESH_COOKIE_PATH],
  );
  return successResponse(res, { accessToken }, "Login successful", 200);
});

export const authenticateUser = tryCatchFn(async (req, res) => {
  const { id: userId } = req.user;
  const user = await authService.authenticateUser(userId);
  return successResponse(res, user, "User authenticated", 200);
});

export const refreshAccessToken = tryCatchFn(async (req, res) => {
  const incomingRefreshToken = getRefreshTokenFromRequest(
    req,
    USER_REFRESH_COOKIE_NAME,
  );
  const user = await authService.refreshAccessToken(incomingRefreshToken);
  const { accessToken, refreshToken: rotatedRefreshToken } = createSendToken(
    user,
    user.tokenVersion || 0,
  );
  await authService.issueAndPersistRefreshToken(user._id, rotatedRefreshToken);
  setRefreshTokenCookie(
    res,
    req,
    USER_REFRESH_COOKIE_NAME,
    rotatedRefreshToken,
    [LEGACY_USER_REFRESH_COOKIE_PATH],
  );
  return successResponse(
    res,
    { accessToken },
    "AccessToken refreshed successfully",
    200,
  );
});

export const verifyUserAccount = tryCatchFn(async (req, res) => {
  const { id: userId } = req.user;
  const user = await authService.verifyUserAccount({ userId, ...req.body });
  return successResponse(res, user, "Account verified successfully", 200);
});

export const resendVerificationToken = tryCatchFn(async (req, res) => {
  const { id: userId } = req.user;
  await authService.resendVerificationToken(userId);
  return successResponse(
    res,
    null,
    "Verification token has been sent to your email",
    200,
  );
});

export const logout = tryCatchFn(async (req, res) => {
  const responseData = await authService.logout(req, res, req.user?._id);
  return successResponse(res, responseData, "Logged out successfully", 200);
});
