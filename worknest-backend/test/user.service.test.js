import test from "node:test";
import assert from "node:assert/strict";
import userService from "../src/services/user.service.js";
import User from "../src/models/user.js";
import mailService from "../src/services/email.service.js";
import logger from "../src/config/logger.js";

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
