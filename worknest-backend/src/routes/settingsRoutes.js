import express from "express";
import { authenticateUser } from "../controllers/auth.controller.js";
import {
  deleteAccount,
  updateNotificationSettings,
  updateProfilePrivacySettings,
  updateUser,
  updateUserPassword,
  uploadAvatar,
} from "../controllers/user.controller.js";
import { verifyAuth } from "../middleware/authenticate.js";
import { cacheMiddleware, clearCache } from "../middleware/cache.js";
import uploadImage from "../middleware/uploadImage.js";
import { validateFormData } from "../middleware/validateForm.js";
import {
  updatePasswordSchema,
  validateNotificationSettingsSchema,
  validateProfilePrivacySchema,
  validateUserSchema,
} from "../lib/dataSchema.js";

const router = express.Router();

router.get("/", verifyAuth, cacheMiddleware("auth_user_settings", 3600), authenticateUser);

router.patch(
  "/personal-info",
  verifyAuth,
  validateFormData(validateUserSchema),
  clearCache("auth_user"),
  clearCache("auth_user_settings"),
  updateUser,
);

router.patch(
  "/notifications",
  verifyAuth,
  validateFormData(validateNotificationSettingsSchema),
  clearCache("auth_user_settings"),
  updateNotificationSettings,
);

router.patch(
  "/profile-privacy",
  verifyAuth,
  validateFormData(validateProfilePrivacySchema),
  clearCache("auth_user_settings"),
  updateProfilePrivacySettings,
);

router.patch(
  "/password",
  verifyAuth,
  validateFormData(updatePasswordSchema),
  clearCache("auth_user"),
  clearCache("auth_user_settings"),
  updateUserPassword,
);

router.patch(
  "/avatar",
  verifyAuth,
  uploadImage.single("avatar"),
  clearCache("auth_user"),
  clearCache("auth_user_settings"),
  uploadAvatar,
);

router.delete(
  "/account",
  verifyAuth,
  clearCache("auth_user"),
  clearCache("auth_user_settings"),
  deleteAccount,
);

export default router;
