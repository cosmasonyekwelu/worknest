import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_REFRESH_COOKIE_NAME,
  LEGACY_ADMIN_REFRESH_COOKIE_PATH,
  LEGACY_USER_REFRESH_COOKIE_PATH,
  REFRESH_COOKIE_PATH,
  USER_REFRESH_COOKIE_NAME,
  buildRefreshCookieOptions,
  clearRefreshTokenCookie,
} from "../src/lib/token.js";

test("buildRefreshCookieOptions creates a durable root-path cookie for local development", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalRefreshExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRES;

  process.env.NODE_ENV = "development";
  process.env.JWT_REFRESH_TOKEN_EXPIRES = "7d";

  const cookieOptions = buildRefreshCookieOptions({
    secure: false,
    headers: {},
  });

  assert.equal(cookieOptions.httpOnly, true);
  assert.equal(cookieOptions.secure, false);
  assert.equal(cookieOptions.sameSite, "lax");
  assert.equal(cookieOptions.path, REFRESH_COOKIE_PATH);
  assert.equal(cookieOptions.maxAge, 7 * 24 * 60 * 60 * 1000);
  assert.ok(cookieOptions.expires instanceof Date);

  process.env.NODE_ENV = originalEnv;
  process.env.JWT_REFRESH_TOKEN_EXPIRES = originalRefreshExpiry;
});

test("buildRefreshCookieOptions uses secure cross-site cookies for https requests", () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const cookieOptions = buildRefreshCookieOptions({
    secure: true,
    headers: {},
  });

  assert.equal(cookieOptions.secure, true);
  assert.equal(cookieOptions.sameSite, "none");
  assert.equal(cookieOptions.path, REFRESH_COOKIE_PATH);

  process.env.NODE_ENV = originalEnv;
});

test("clearRefreshTokenCookie clears both root and legacy user refresh cookie paths", () => {
  const recordedCookies = [];
  const response = {
    cookie(name, value, options) {
      recordedCookies.push({ name, value, options });
    },
  };

  clearRefreshTokenCookie(
    response,
    { secure: false, headers: {} },
    USER_REFRESH_COOKIE_NAME,
    [LEGACY_USER_REFRESH_COOKIE_PATH],
  );

  assert.equal(recordedCookies.length, 2);
  assert.deepEqual(
    recordedCookies.map(({ name, value, options }) => ({
      name,
      value,
      path: options.path,
      maxAge: options.maxAge,
    })),
    [
      {
        name: USER_REFRESH_COOKIE_NAME,
        value: "",
        path: REFRESH_COOKIE_PATH,
        maxAge: 0,
      },
      {
        name: USER_REFRESH_COOKIE_NAME,
        value: "",
        path: LEGACY_USER_REFRESH_COOKIE_PATH,
        maxAge: 0,
      },
    ],
  );
});

test("clearRefreshTokenCookie clears both root and legacy admin refresh cookie paths", () => {
  const recordedCookies = [];
  const response = {
    cookie(name, value, options) {
      recordedCookies.push({ name, value, options });
    },
  };

  clearRefreshTokenCookie(
    response,
    { secure: false, headers: {} },
    ADMIN_REFRESH_COOKIE_NAME,
    [LEGACY_ADMIN_REFRESH_COOKIE_PATH],
  );

  assert.equal(recordedCookies.length, 2);
  assert.deepEqual(
    recordedCookies.map(({ name, value, options }) => ({
      name,
      value,
      path: options.path,
      maxAge: options.maxAge,
    })),
    [
      {
        name: ADMIN_REFRESH_COOKIE_NAME,
        value: "",
        path: REFRESH_COOKIE_PATH,
        maxAge: 0,
      },
      {
        name: ADMIN_REFRESH_COOKIE_NAME,
        value: "",
        path: LEGACY_ADMIN_REFRESH_COOKIE_PATH,
        maxAge: 0,
      },
    ],
  );
});
