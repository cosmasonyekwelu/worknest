import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCorsOptions,
  enforceHttpsMiddleware,
  getAllowedOriginsFromEnv,
  parseAllowedOrigins,
} from '../src/middleware/security.js';

test('parseAllowedOrigins merges comma-separated origin groups without duplicates', () => {
  const origins = parseAllowedOrigins(
    'http://localhost:5173, https://worknest-silk.vercel.app',
    'https://worknest-silk.vercel.app,https://admin.worknest.com',
  );

  assert.deepEqual(origins, [
    'http://localhost:5173',
    'https://worknest-silk.vercel.app',
    'https://admin.worknest.com',
  ]);
});

test('buildCorsOptions allows configured origin', async () => {
  const options = buildCorsOptions(['https://worknest.app']);

  await new Promise((resolve, reject) => {
    options.origin('https://worknest.app', (err, allow) => {
      if (err) return reject(err);
      assert.equal(allow, true);
      resolve();
    });
  });
});

test('buildCorsOptions blocks unknown origin', async () => {
  const options = buildCorsOptions(['https://worknest.app']);

  await new Promise((resolve) => {
    options.origin('https://evil.example', (err) => {
      assert.ok(err);
      resolve();
    });
  });
});

test('buildCorsOptions rejects wildcard origins when credentials are enabled', async () => {
  const options = buildCorsOptions(['*']);

  await new Promise((resolve) => {
    options.origin('https://evil.example', (err) => {
      assert.ok(err);
      resolve();
    });
  });
});

test('getAllowedOriginsFromEnv combines CLIENT_URL and ALLOWED_ORIGINS', () => {
  const origins = getAllowedOriginsFromEnv({
    CLIENT_URL: 'http://localhost:5173',
    ALLOWED_ORIGINS: 'https://worknest-silk.vercel.app,https://admin.worknest.com',
  });

  assert.deepEqual(origins, [
    'http://localhost:5173',
    'https://worknest-silk.vercel.app',
    'https://admin.worknest.com',
  ]);
});

test('enforceHttpsMiddleware bypasses check outside production', () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  let called = false;
  enforceHttpsMiddleware({ secure: false, headers: {} }, {}, () => {
    called = true;
  });

  assert.equal(called, true);
  process.env.NODE_ENV = oldEnv;
});
