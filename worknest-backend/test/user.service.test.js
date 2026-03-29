import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import userService from "../src/services/user.service.js";
import User from "../src/models/user.js";
import mailService from "../src/services/email.service.js";
import logger from "../src/config/logger.js";
import Resume from "../src/models/resume.js";
import Application from "../src/models/application.js";
import Notification from "../src/models/notification.js";
import { ForbiddenError } from "../src/lib/errors.js";

const GENERIC_MESSAGE =
  "If an account exists, a password reset link has been sent.";

test("forgotPassword returns a generic response for unknown accounts", async () => {
  const originalFindOne = User.findOne;
  const originalWarn = logger.warn;
  let warned = false;

  User.findOne = () => ({
    select: async () => null,
  });
  logger.warn = (message, meta) => {
    warned = true;
    assert.equal(message, "Password reset requested for unknown email");
    assert.equal(meta.email, "missing@example.com");
    assert.equal(meta.ip, "127.0.0.1");
  };

  try {
    const result = await userService.forgotPassword({
      body: { email: "Missing@example.com" },
      ip: "127.0.0.1",
    });

    assert.deepEqual(result, { message: GENERIC_MESSAGE });
    assert.equal(warned, true);
  } finally {
    User.findOne = originalFindOne;
    logger.warn = originalWarn;
  }
});

test("forgotPassword returns the same generic response for existing accounts", async () => {
  const originalFindOne = User.findOne;
  const originalSendPasswordResetEmail = mailService.sendPasswordResetEmail;
  const originalError = logger.error;

  let saveCount = 0;
  const fakeUser = {
    _id: "user-1",
    email: "existing@example.com",
    save: async () => {
      saveCount += 1;
    },
  };

  User.findOne = () => ({
    select: async () => fakeUser,
  });
  mailService.sendPasswordResetEmail = async () => {};
  logger.error = () => {};

  try {
    const result = await userService.forgotPassword({
      body: { email: "existing@example.com" },
      ip: "127.0.0.1",
    });

    assert.deepEqual(result, { message: GENERIC_MESSAGE });
    assert.match(fakeUser.passwordResetToken, /^[a-f0-9]{64}$/);
    assert.ok(fakeUser.passwordResetTokenExpiry instanceof Date);
    assert.equal(saveCount, 1);
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    User.findOne = originalFindOne;
    mailService.sendPasswordResetEmail = originalSendPasswordResetEmail;
    logger.error = originalError;
  }
});

test("deleteAccount prevents deleting the last remaining admin account", async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindOne = User.findOne;
  const originalFind = User.find;

  const session = {
    async withTransaction(work) {
      return work();
    },
    async endSession() {},
  };

  mongoose.startSession = async () => session;
  User.findOne = async (filter, projection, options) => {
    assert.equal(filter._id, "admin-1");
    assert.equal(options.session, session);
    return { role: "admin", avatarId: "" };
  };
  User.find = async (filter, projection, options) => {
    assert.deepEqual(filter, { role: "admin" });
    assert.equal(options.session, session);
    return [{ _id: "admin-1" }];
  };

  try {
    await assert.rejects(
      () => userService.deleteAccount("admin-1"),
      (error) => {
        assert.ok(error instanceof ForbiddenError);
        assert.equal(
          error.message,
          "At least one admin account must remain active",
        );
        return true;
      },
    );
  } finally {
    mongoose.startSession = originalStartSession;
    User.findOne = originalFindOne;
    User.find = originalFind;
  }
});

test("deleteAccount aborts the mutation flow cleanly when a transactional step fails", async () => {
  const originalStartSession = mongoose.startSession;
  const originalUserFindOne = User.findOne;
  const originalResumeFindOne = Resume.findOne;
  const originalApplicationFind = Application.find;
  const originalNotificationDeleteMany = Notification.deleteMany;
  const originalApplicationDeleteMany = Application.deleteMany;
  const originalResumeDeleteOne = Resume.deleteOne;
  const originalUserDeleteOne = User.deleteOne;

  let endSessionCalled = false;
  let applicationDeleteCalled = false;
  let resumeDeleteCalled = false;
  let userDeleteCalled = false;

  const session = {
    async withTransaction(work) {
      return work();
    },
    async endSession() {
      endSessionCalled = true;
    },
  };

  mongoose.startSession = async () => session;
  User.findOne = async (filter, projection, options) => {
    assert.equal(options.session, session);
    return { role: "applicant", avatarId: "" };
  };
  Resume.findOne = () => ({
    lean: async () => ({
      originalFile: { publicId: "resume-public-id" },
    }),
  });
  Application.find = () => ({
    lean: async () => [{ _id: "application-1" }],
  });
  Notification.deleteMany = async (filter, options) => {
    assert.equal(options.session, session);
    assert.deepEqual(filter, {
      $or: [
        { recipient: "user-1" },
        { "data.applicationId": { $in: ["application-1"] } },
      ],
    });
    throw new Error("notification cleanup failed");
  };
  Application.deleteMany = async () => {
    applicationDeleteCalled = true;
  };
  Resume.deleteOne = async () => {
    resumeDeleteCalled = true;
  };
  User.deleteOne = async () => {
    userDeleteCalled = true;
  };

  try {
    await assert.rejects(
      () => userService.deleteAccount("user-1"),
      /notification cleanup failed/,
    );

    assert.equal(endSessionCalled, true);
    assert.equal(applicationDeleteCalled, false);
    assert.equal(resumeDeleteCalled, false);
    assert.equal(userDeleteCalled, false);
  } finally {
    mongoose.startSession = originalStartSession;
    User.findOne = originalUserFindOne;
    Resume.findOne = originalResumeFindOne;
    Application.find = originalApplicationFind;
    Notification.deleteMany = originalNotificationDeleteMany;
    Application.deleteMany = originalApplicationDeleteMany;
    Resume.deleteOne = originalResumeDeleteOne;
    User.deleteOne = originalUserDeleteOne;
  }
});
