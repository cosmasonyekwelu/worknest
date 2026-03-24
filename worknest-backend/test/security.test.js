import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCorsOptions, enforceHttpsMiddleware } from '../src/middleware/security.js';

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
