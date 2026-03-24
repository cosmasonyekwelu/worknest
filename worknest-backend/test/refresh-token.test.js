import test from 'node:test';
import assert from 'node:assert/strict';
import { getRefreshTokenFromRequest } from '../src/lib/refreshToken.js';

test('getRefreshTokenFromRequest prioritizes cookie token', () => {
  const req = {
    cookies: { userRefreshToken: 'cookie-token' },
    headers: { authorization: 'Bearer header-token' },
    body: { refreshToken: 'body-token' },
  };

  assert.equal(getRefreshTokenFromRequest(req, 'userRefreshToken'), 'cookie-token');
});

test('getRefreshTokenFromRequest falls back to authorization header', () => {
  const req = {
    cookies: {},
    headers: { authorization: 'Bearer header-token' },
    body: {},
  };

  assert.equal(getRefreshTokenFromRequest(req, 'userRefreshToken'), 'header-token');
});

test('getRefreshTokenFromRequest falls back to request body for mobile clients', () => {
  const req = {
    cookies: {},
    headers: {},
    body: { refreshToken: 'body-token' },
  };

  assert.equal(getRefreshTokenFromRequest(req, 'userRefreshToken'), 'body-token');
});

test('getRefreshTokenFromRequest throws when token is missing', () => {
  const req = { cookies: {}, headers: {}, body: {} };
  assert.throws(() => getRefreshTokenFromRequest(req, 'userRefreshToken'));
});
