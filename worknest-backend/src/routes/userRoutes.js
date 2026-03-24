import express from "express";
import {
  authenticateUser,
  login,
  logout,
  refreshAccessToken,
  register,
  resendVerificationToken,
  verifyUserAccount,
} from "../controllers/auth.controller.js";
import { rateLimiter, refreshTokenLimit } from "../middleware/rateLimit.js";
import { validateFormData } from "../middleware/validateForm.js";
import {
  forgotPasswordSchema,
  validateAccountSchema,
  validateResetPasswordSchema,
  validateSignInSchema,
  validateSignUpSchema,
} from "../lib/dataSchema.js";
import { verifyAuth } from "../middleware/authenticate.js";
import { cacheMiddleware, clearCache } from "../middleware/cache.js";
import { forgotPassword, resetPassword } from "../controllers/user.controller.js";

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
router.get(
  "/user",
  verifyAuth,
  cacheMiddleware("auth_user", 3600),
  authenticateUser,
);

router.post("/refresh-token", refreshTokenLimit, refreshAccessToken);

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
  rateLimiter,
  validateFormData(forgotPasswordSchema),
  forgotPassword,
);

router.patch(
  "/reset-password",
  rateLimiter,
  validateFormData(validateResetPasswordSchema),
  resetPassword,
);

router.post("/logout", verifyAuth, clearCache("auth_user"), logout);

export default router;
