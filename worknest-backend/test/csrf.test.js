import test from "node:test";
import assert from "node:assert/strict";
import {
  CSRF_HEADER_NAME,
  CSRF_HEADER_VALUE,
  csrfProtection,
} from "../src/middleware/csrf.js";

const createRequest = (headers = {}) => ({
  get(name) {
    return headers[name.toLowerCase()] || headers[name] || "";
  },
});

test("csrfProtection allows trusted frontend requests with the csrf header", () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  let nextError = null;

  csrfProtection(
    createRequest({
      [CSRF_HEADER_NAME.toLowerCase()]: CSRF_HEADER_VALUE,
      origin: "http://localhost:5173",
    }),
    {},
    (error) => {
      nextError = error || null;
    },
  );

  assert.equal(nextError, null);
  process.env.NODE_ENV = originalEnv;
});

test("csrfProtection rejects requests without the csrf header", () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  let nextError = null;

  csrfProtection(
    createRequest({
      origin: "http://localhost:5173",
    }),
    {},
    (error) => {
      nextError = error;
    },
  );

  assert.ok(nextError);
  assert.match(nextError.message, /CSRF protection header/);
  process.env.NODE_ENV = originalEnv;
});

test("csrfProtection rejects requests from untrusted origins", () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  let nextError = null;

  csrfProtection(
    createRequest({
      [CSRF_HEADER_NAME.toLowerCase()]: CSRF_HEADER_VALUE,
      origin: "https://evil.example",
    }),
    {},
    (error) => {
      nextError = error;
    },
  );

  assert.ok(nextError);
  assert.match(nextError.message, /origin is not allowed/i);
  process.env.NODE_ENV = originalEnv;
});
