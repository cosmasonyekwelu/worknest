import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { deleteFromCloudinary } from "../lib/cloudinary.js";
import { getJwtSecrets } from "../config/env.js";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "../lib/errors.js";
import {
  hashToken as hashRefreshToken,
  persistRefreshTokenState,
  invalidateRefreshTokenState,
} from "../lib/session.js";
import {
  ADMIN_REFRESH_COOKIE_NAME,
  clearRefreshTokenCookie,
  LEGACY_ADMIN_REFRESH_COOKIE_PATH,
} from "../lib/token.js";

export const buildUserSearchQuery = (query = "", role = "") => {
  const searchQuery = {};
  const trimmedKeyword = String(query || "").trim();
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  if (normalizedRole && normalizedRole !== "all") {
    searchQuery.role = normalizedRole;
  }

  if (trimmedKeyword) {
    searchQuery.$text = { $search: trimmedKeyword };
  }

  return searchQuery;
};

const adminService = {
  // admin login service - only admins can login
  adminLogin: async (req) => {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password +tokenVersion",
    );

    if (!user) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    // Check if user role is admin
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can access this route.");
    }

    // Handle password comparison
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    return user;
  },

  issueAndPersistRefreshToken: async (userId, refreshToken) => {
    await persistRefreshTokenState(userId, refreshToken);
  },

  // authenticate admin - verify admin status
  authenticateAdmin: async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("Admin not found");
    }

    // Verify user is still an admin
    if (user.role !== "admin") {
      throw new ForbiddenError("Your admin privileges have been revoked");
    }

    return user;
  },

  // refresh admin access token
  refreshAdminAccessToken: async (refreshToken) => {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    // Verify the refresh token
    const { refreshSecret } = getJwtSecrets();
    const decoded = jwt.verify(
      refreshToken,
      refreshSecret,
    );

    if (decoded.tokenType !== "refresh") {
      throw new UnauthorizedError("Invalid token type");
    }

    const user = await User.findById(decoded.id).select(
      "+refreshTokenHash +refreshTokenExpiresAt +tokenVersion",
    );

    if (!user) {
      throw new NotFoundError("Admin account not found");
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedError("Refresh token is no longer valid");
    }

    if (!user.refreshTokenHash || hashRefreshToken(refreshToken) !== user.refreshTokenHash) {
      // Potential reuse detected: token has correct version but wrong hash.
      // Invalidate all sessions for this user as a precaution.
      await invalidateRefreshTokenState(user._id, true);
      throw new UnauthorizedError("Refresh token reuse detected. Please log in again.");
    }

    if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
      await invalidateRefreshTokenState(user._id, true);
      throw new UnauthorizedError("Refresh token has expired");
    }

    // Verify user is still an admin
    if (user.role !== "admin") {
      throw new ForbiddenError("Your admin privileges have been revoked");
    }

    return user;
  },

  getAllUsers: async (page = 1, limit = 3, query = "", role = "") => {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 3), 100);
    const safePage = Math.max(1, Number(page) || 1);
    const searchQuery = buildUserSearchQuery(query, role);

    const userQuery = User.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit);

    if (searchQuery.$text) {
      userQuery.select({ score: { $meta: "textScore" } }).sort({
        score: { $meta: "textScore" },
        createdAt: -1,
      });
    }

    const [users, total] = await Promise.all([
      userQuery,
      User.countDocuments(searchQuery),
    ]);

    return {
      meta: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        total,
        hasMore: (safePage - 1) * safeLimit + users.length < total,
        limit: safeLimit,
      },
      users,
    };
  },

  logoutAdmin: async (req, res, userId) => {
    if (userId) {
      await invalidateRefreshTokenState(userId, true);
    }

    clearRefreshTokenCookie(res, req, ADMIN_REFRESH_COOKIE_NAME, [
      LEGACY_ADMIN_REFRESH_COOKIE_PATH,
    ]);
    return true;
  },
  deleteAccountAdmins: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Account not found");
    }
    if (user.avatarId) {
      await deleteFromCloudinary(user.avatarId);
    }
    await user.deleteOne();
    return true;
  },
};

export default adminService;
