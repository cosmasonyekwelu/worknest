import User from "../models/user.js";
import mailService from "./email.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import logger from "../config/logger.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from "../lib/errors.js";
import Application from "../models/application.js";
import Resume from "../models/resume.js";
import Notification from "../models/notification.js";
import { withMongoTransaction } from "../lib/transaction.js";

const PASSWORD_RESET_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_LOCK_WINDOW_MS = 15 * 60 * 1000;

const deleteCloudinaryAssetSafely = async (publicId, options = {}) => {
  if (!publicId) {
    return;
  }

  await deleteFromCloudinary(publicId, options).catch((error) => {
    logger.warn("Cloudinary asset cleanup failed", {
      publicId,
      error: error?.message || String(error),
    });
  });
};

const userService = {
  forgotPassword: async (req) => {
    const normalizedEmail = req.body.email?.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetToken +passwordResetTokenExpiry",
    );
    if (!user) {
      logger.warn("Password reset requested for unknown email", {
        email: normalizedEmail,
        ip: req.ip,
      });
      return {
        message: "If an account exists, a password reset link has been sent.",
      };
    }
    // generate password reset token
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    const resetCodeExpiry = new Date(Date.now() + 900000); //15minutes
    user.passwordResetToken = hashedResetCode;
    user.passwordResetTokenExpiry = resetCodeExpiry;
    await user.save();
    process.nextTick(() => {
      mailService.sendPasswordResetEmail(user, resetCode).catch(async (error) => {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        await user.save();
        logger.error("Failed to send password token", {
          error: error.message,
          userId: user._id?.toString(),
        });
      });
    });
    return {
      message: "If an account exists, a password reset link has been sent.",
    };
  },
  resetPassword: async (userData) => {
    const { email, password, confirmPassword, passwordResetToken } = userData;
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();
    if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +passwordResetToken +passwordResetTokenExpiry +passwordResetAttempts +passwordResetLockedUntil",
    );
    if (!user) {
      throw new NotFoundError("Account not found with that email");
    }

    if (user.passwordResetLockedUntil && user.passwordResetLockedUntil > now) {
      throw new ValidationError("Too many failed attempts. Try again later.");
    }

    if (user.passwordResetLockedUntil && user.passwordResetLockedUntil <= now) {
      user.passwordResetAttempts = 0;
      user.passwordResetLockedUntil = undefined;
    }

    const hashedIncomingToken = crypto
      .createHash("sha256")
      .update(passwordResetToken)
      .digest("hex");

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== hashedIncomingToken
    ) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      if (user.passwordResetAttempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
        user.passwordResetLockedUntil = new Date(
          now.getTime() + PASSWORD_RESET_LOCK_WINDOW_MS,
        );
      }
      await user.save();

      if (user.passwordResetLockedUntil && user.passwordResetLockedUntil > now) {
        throw new ValidationError("Too many failed attempts. Try again later.");
      }

      throw new ValidationError("Invalid or expired reset token");
    }
    const isPasswordSame = await bcrypt.compare(password, user.password);
    if (isPasswordSame) {
      throw new ValidationError("New password must be different from old password");
    }
    if (!user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < now) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiry = undefined;
      await user.save();
      throw new ValidationError("Invalid or expired reset token");
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.passwordResetAttempts = 0;
    user.passwordResetLockedUntil = undefined;
    await user.save();
    await User.findByIdAndUpdate(user._id, {
      refreshTokenHash: undefined,
      refreshTokenExpiresAt: undefined,
      $inc: { tokenVersion: 1 },
    });
    return user;
  },
  uploadAvatar: async (userId, avatar) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("No user found with that ID");
    }
    if (!avatar) {
      throw new ValidationError("No file uploaded");
    }
    //check if user has avatar already
    const currentAvatar = user.avatar;
    const currentAvatarId = user.avatarId;
    if (currentAvatar) {
      //if avatar exists, delete and replace with new avatar
      await deleteFromCloudinary(currentAvatarId);
    }
    const { url, public_id } = await uploadToCloudinary(avatar, {
      folder: "Worknest/avatars",
      width: 200,
      height: 200,
      crop: "fit",
      format: "webp",
    });
    user.avatar = url || user.avatar;
    user.avatarId = public_id || user.avatarId;
    await user.save();
    return user;
  },
  updateUserPassword: async (userId, userData) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new NotFoundError("No user found with that ID");
    }
    const { password, newPassword, confirmPassword } = userData;
    const [checkPassword, isPasswordSame] = await Promise.all([
      bcrypt.compare(password, user.password),
      bcrypt.compare(newPassword, user.password),
    ]);
    if (!checkPassword) {
      throw new ValidationError("Incorrect current password");
    }
    if (newPassword !== confirmPassword) {
      throw new ValidationError("New password and confirm password does not match");
    }
    if (isPasswordSame) {
      throw new ValidationError("New password must be different from old password");
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    const updatedUser = await user.save();
    await User.findByIdAndUpdate(userId, {
      refreshTokenHash: undefined,
      refreshTokenExpiresAt: undefined,
      $inc: { tokenVersion: 1 },
    });
    return updatedUser;
  },
  // update user
  updateUser: async (userId, userData) => {
    return withMongoTransaction(async (session) => {
      const user = await User.findOne({ _id: userId }, null, { session });
      if (!user) {
        throw new NotFoundError("No user found with that ID");
      }

      if (userData.email) {
        const normalizedEmail = userData.email.toLowerCase().trim();
        const emailExists = await User.findOne(
          {
            email: normalizedEmail,
            _id: { $ne: userId },
          },
          "_id",
          { session },
        );

        if (emailExists) {
          throw new ConflictError("User with email already exists");
        }

        user.email = normalizedEmail;
      }

      if (userData.phone) {
        const normalizedPhone = userData.phone.trim();
        const phoneExists = await User.findOne(
          {
            phone: normalizedPhone,
            _id: { $ne: userId },
          },
          "_id",
          { session },
        );

        if (phoneExists) {
          throw new ConflictError("User with phone already exists");
        }

        user.phone = normalizedPhone;
      }

      const allowedUpdates = [
        "fullname",
        "dateOfBirth",
        "bio",
        "country",
        "language",
        "preferredCurrency",
      ];

      for (const key of allowedUpdates) {
        if (userData[key] !== undefined && userData[key] !== null) {
          user[key] =
            typeof userData[key] === "string"
              ? userData[key].trim()
              : userData[key];
        }
      }

      const updatedUser = await user.save({ session });

      await Application.updateMany(
        { applicant: userId },
        {
          applicantName: updatedUser.fullname,
          applicantEmail: updatedUser.email,
        },
        { session },
      );

      return updatedUser;
    });
  },
  updateNotificationSettings: async (userId, settingsData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("No user found with that ID");
    }

    user.settings = {
      ...user.settings,
      notifications: {
        ...user.settings?.notifications,
        email: settingsData.email ?? user.settings?.notifications?.email,
        push: settingsData.push ?? user.settings?.notifications?.push,
        marketing:
          settingsData.marketing ?? user.settings?.notifications?.marketing,
      },
    };

    const updatedUser = await user.save();
    return updatedUser;
  },

  updateProfilePrivacySettings: async (userId, settingsData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("No user found with that ID");
    }

    user.settings = {
      ...user.settings,
      profilePrivacy: {
        ...user.settings?.profilePrivacy,
        profileVisibility:
          settingsData.profileVisibility ??
          user.settings?.profilePrivacy?.profileVisibility,
        showEmail:
          settingsData.showEmail ?? user.settings?.profilePrivacy?.showEmail,
        showPhone:
          settingsData.showPhone ?? user.settings?.profilePrivacy?.showPhone,
      },
    };

    const updatedUser = await user.save();
    return updatedUser;
  },

  // delete user account
  deleteAccount: async (userId) => {
    let avatarId = "";
    let resumePublicId = "";

    await withMongoTransaction(async (session) => {
      const user = await User.findOne(
        { _id: userId },
        "role avatarId",
        { session },
      );

      if (!user) {
        throw new NotFoundError("Account not found");
      }

      if (user.role === "admin") {
        const adminAccounts = await User.find(
          { role: "admin" },
          "_id",
          { session },
        );

        if (adminAccounts.length <= 1) {
          throw new ForbiddenError(
            "At least one admin account must remain active",
          );
        }
      }

      const [resume, applications] = await Promise.all([
        Resume.findOne(
          { user: userId },
          "originalFile.publicId",
          { session },
        ).lean(),
        Application.find(
          { applicant: userId },
          "_id",
          { session },
        ).lean(),
      ]);

      avatarId = user.avatarId || "";
      resumePublicId = resume?.originalFile?.publicId || "";

      const applicationIds = applications.map((application) => application._id);
      const notificationFilter = {
        $or: [
          { recipient: userId },
          ...(applicationIds.length
            ? [{ "data.applicationId": { $in: applicationIds } }]
            : []),
        ],
      };

      await Notification.deleteMany(notificationFilter, { session });
      await Application.deleteMany({ applicant: userId }, { session });
      await Resume.deleteOne({ user: userId }, { session });
      await User.deleteOne({ _id: userId }, { session });
    });

    await deleteCloudinaryAssetSafely(avatarId);
    await deleteCloudinaryAssetSafely(resumePublicId, {
      resource_type: "raw",
      type: "authenticated",
    });

    return true;
  },
};
export default userService;
