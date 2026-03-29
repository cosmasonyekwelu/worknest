import test from "node:test";
import assert from "node:assert/strict";
import {
  authorizedRoles,
  requireVerifiedUser,
} from "../src/middleware/authenticate.js";
import { ForbiddenError, UnauthorizedError } from "../src/lib/errors.js";

const runMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error ?? null));
  });

test("requireVerifiedUser rejects unverified applicants", async () => {
  const error = await runMiddleware(requireVerifiedUser, {
    user: { role: "applicant", isVerified: false },
  });

  assert.ok(error instanceof ForbiddenError);
  assert.equal(
    error.message,
    "Please verify your email to perform this action.",
  );
});

test("requireVerifiedUser allows verified applicants and admins", async () => {
  const verifiedApplicantError = await runMiddleware(requireVerifiedUser, {
    user: { role: "applicant", isVerified: true },
  });
  const adminError = await runMiddleware(requireVerifiedUser, {
    user: { role: "admin", isVerified: false },
  });

  assert.equal(verifiedApplicantError, null);
  assert.equal(adminError, null);
});

test("requireVerifiedUser rejects missing authenticated users", async () => {
  const error = await runMiddleware(requireVerifiedUser, {});

  assert.ok(error instanceof UnauthorizedError);
});

test("authorizedRoles prevents applicants from accessing admin-only actions", async () => {
  const error = await runMiddleware(authorizedRoles("admin"), {
    user: { role: "applicant" },
  });

  assert.ok(error instanceof ForbiddenError);
  assert.equal(
    error.message,
    "You do not have permission to perform this action",
  );
});
