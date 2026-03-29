import test from "node:test";
import assert from "node:assert/strict";
import {
  updatePasswordSchema,
  validateResetPasswordSchema,
} from "../src/lib/dataSchema.js";

test("validateResetPasswordSchema rejects mismatched confirmPassword", () => {
  const parsed = validateResetPasswordSchema.safeParse({
    email: "user@example.com",
    passwordResetToken: "123456",
    password: "Password1!",
    confirmPassword: "Password2!",
  });

  assert.equal(parsed.success, false);
  assert.equal(parsed.error.issues[0].path[0], "confirmPassword");
});

test("updatePasswordSchema rejects mismatched confirmPassword", () => {
  const parsed = updatePasswordSchema.safeParse({
    password: "Password1!",
    newPassword: "NewPassword1!",
    confirmPassword: "Mismatch1!",
  });

  assert.equal(parsed.success, false);
  assert.equal(parsed.error.issues[0].path[0], "confirmPassword");
});
