# PR Change Notes

**Title:**  
Harden auth logging, password reset abuse controls, and admin session bootstrap

**Summary:**  
This PR fixes the highest-risk auth and session issues without widening the scope of the existing architecture. It removes sensitive auth logging from the frontend, relaxes sign-in validation so older valid passwords can still log in, hardens password reset with per-account lockouts and email normalization, and stabilizes admin session recovery so protected pages do not fire too early during refresh. The main files touched are the frontend auth screens and provider (`worknest-frontend/src/pages/auth/*`, `worknest-frontend/src/store/AuthProvider.jsx`, `worknest-frontend/src/utils/axiosInstance.js`, `worknest-frontend/src/routes/AppRoutes.jsx`) and the backend reset/auth flow (`worknest-backend/src/services/user.service.js`, `worknest-backend/src/models/user.js`, `worknest-backend/src/middleware/rateLimit.js`, `worknest-backend/src/routes/userRoutes.js`, `worknest-backend/src/lib/dataSchema.js`).

## 1. Concepts
- Sensitive auth responses and raw error objects should not be printed to the browser console because they can expose tokens, payloads, or internal response details.
- Login validation should only verify that a password is present, not that it matches current password-creation rules, because older valid passwords still need to authenticate successfully.
- Password reset flows need both network-level throttling and account-level lockouts. IP-based limiting slows bulk abuse, while per-account attempt tracking stops brute-force guessing against a single email.
- Session bootstrap should have an explicit ready state. Protected data fetching should wait until the initial refresh attempt has either restored the session or definitively failed.
- Frontend configuration errors should fail fast. A missing or malformed API base URL should throw immediately instead of silently producing requests to `undefined/api/v1`.

## 2. Real-world analogy
Think of this PR like improving how a secure office opens each morning. Staff should not shout badge details across the lobby (`console.log`), the front desk should pause before letting people into restricted rooms until it confirms who is actually signed in (`authReady`), and the password reset desk should temporarily lock after too many wrong code guesses instead of letting someone try endless combinations.

## 3. Smallest practical example
Minimal examples of the core patterns added in this PR:

```js
// Safe auth debug logging
if (import.meta.env.DEV) {
  console.debug("User login completed", { status: response?.status });
}

// Fail fast if the frontend API origin is misconfigured
const envBaseUrl = import.meta.env.VITE_WORKNEST_BASE_URL?.trim();
if (!envBaseUrl) {
  throw new Error("Missing VITE_WORKNEST_BASE_URL in environment variables");
}

// Per-account password reset lockout
user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
if (user.passwordResetAttempts >= 5) {
  user.passwordResetLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
}

// Hold protected queries until auth bootstrap finishes
const authReady = !!accessToken || refreshSessionQuery.isSuccess || refreshSessionQuery.isError;
```

## 4. Why it exists & where it is used
This PR exists because several small auth issues combined into real security and reliability problems. Sensitive console logging increased exposure risk during login and reset flows. Strong password rules on sign-in blocked legitimate users whose passwords were created under older rules. The password reset flow used a short 6-digit code without tracking per-account failures, which made repeated guessing too cheap. On the frontend, missing API configuration could fail silently, the profile page could be hit without a route guard, and admin pages could try loading before the refresh-based session bootstrap had actually completed.

These changes apply across both user and admin authentication. On the frontend they affect login, forgot-password, reset-password, verification, signup, protected routes, the shared Axios client, and the auth provider that restores sessions on app load. On the backend they affect sign-in validation, password reset validation and storage, reset abuse protection, and reset-token lookup behavior. The admin applications page specifically benefits from the new bootstrap behavior because it now waits for auth restoration before its protected queries run.

## 5. Technical trade-off
The biggest trade-off was choosing a minimal `authReady` gate and route-aware refresh preference instead of redesigning the auth system around persistent access tokens or a larger session state machine. That keeps the fix narrow, preserves the existing memory-only access-token approach, and directly addresses the admin refresh failure with low migration risk. The technical debt is that session restoration logic still lives inside the shared auth provider and depends on route context plus refresh sequencing, so a future multi-client auth redesign may still want a more explicit session orchestration layer.
