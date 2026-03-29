import express from "express";
import {
  authenticateUser,
  googleLogin,
  login,
  logout,
  refreshAccessToken,
  register,
  resendVerificationToken,
  verifyUserAccount,
} from "../controllers/auth.controller.js";
import {
  forgotPasswordLimiter,
  rateLimiter,
  resetPasswordLimiter,
  refreshTokenLimit,
} from "../middleware/rateLimit.js";
import { validateFormData } from "../middleware/validateForm.js";
import {
  forgotPasswordSchema,
  googleAuthSchema,
  validateAccountSchema,
  validateResetPasswordSchema,
  validateSignInSchema,
  validateSignUpSchema,
} from "../lib/dataSchema.js";
import { optionalAuth, verifyAuth } from "../middleware/authenticate.js";
import { cacheMiddleware, clearCache } from "../middleware/cache.js";
import { forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { csrfProtection } from "../middleware/csrf.js";

const router = express.Router();

router.post(
  "/create",
  rateLimiter,
  validateFormData(validateSignUpSchema),
  register,
);
router.post(
  "/login",
  rateLimiter,
  validateFormData(validateSignInSchema),
  login,
);
router.post(
  "/google",
  rateLimiter,
  validateFormData(googleAuthSchema),
  googleLogin,
);
router.get(
  "/user",
  verifyAuth,
  cacheMiddleware("auth_user", 3600),
  authenticateUser,
);

router.post("/refresh-token", csrfProtection, refreshTokenLimit, refreshAccessToken);

router.patch(
  "/verify-account",
  rateLimiter,
  verifyAuth,
  validateFormData(validateAccountSchema),
  clearCache("auth_user"),
  verifyUserAccount,
);

router.post(
  "/resend/verify-token",
  rateLimiter,
  verifyAuth,
  resendVerificationToken,
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateFormData(forgotPasswordSchema),
  forgotPassword,
);

router.patch(
  "/reset-password",
  rateLimiter,
  resetPasswordLimiter,
  validateFormData(validateResetPasswordSchema),
  resetPassword,
);

router.post("/logout", optionalAuth, csrfProtection, clearCache("auth_user"), logout);

export default router;
