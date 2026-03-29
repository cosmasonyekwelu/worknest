import test from "node:test";
import assert from "node:assert/strict";
import { applicationValidation } from "../src/validation/application.validation.js";
import { APPLICATION_STATUS_VALUES } from "../src/constants/applicationStatus.js";

test("application admin query accepts only canonical shared statuses", () => {
  for (const status of APPLICATION_STATUS_VALUES) {
    const parsed = applicationValidation.adminQuery.parse({ status });
    assert.equal(parsed.status, status);
  }
});

test("application admin query rejects unsupported legacy statuses", () => {
  assert.throws(
    () => applicationValidation.adminQuery.parse({ status: "pending" }),
    /Invalid option/,
  );

  assert.throws(
    () => applicationValidation.adminQuery.parse({ status: "viewed" }),
    /Invalid option/,
  );
});

test("application counts query accepts multiple job ids", () => {
  const parsed = applicationValidation.countsQuery.parse({
    jobIds: [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
    ],
  });

  assert.deepEqual(parsed.jobIds, [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
  ]);
});
