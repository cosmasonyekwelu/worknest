import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEmailRateLimitKey,
  buildRateLimitKey,
} from "../src/middleware/rateLimit.js";

test("buildRateLimitKey ignores user-agent rotation and uses authenticated identity", () => {
  const firstKey = buildRateLimitKey(
    {
      ip: "203.0.113.10",
      headers: { "user-agent": "browser-a" },
      user: { _id: { toString: () => "user-123" } },
    },
    "apply-job",
  );

  const secondKey = buildRateLimitKey(
    {
      ip: "203.0.113.10",
      headers: { "user-agent": "browser-b" },
      user: { _id: { toString: () => "user-123" } },
    },
    "apply-job",
  );

  assert.equal(firstKey, secondKey);
  assert.match(firstKey, /^apply-job:/);
  assert.match(firstKey, /user:user-123$/);
});

test("buildEmailRateLimitKey normalizes email casing and whitespace", () => {
  const firstKey = buildEmailRateLimitKey(
    {
      ip: "203.0.113.10",
      body: { email: " Ada@example.com " },
    },
    "forgot-password",
  );

  const secondKey = buildEmailRateLimitKey(
    {
      ip: "203.0.113.10",
      body: { email: "ada@example.com" },
    },
    "forgot-password",
  );

  assert.equal(firstKey, secondKey);
  assert.match(firstKey, /email:ada@example\.com$/);
});
