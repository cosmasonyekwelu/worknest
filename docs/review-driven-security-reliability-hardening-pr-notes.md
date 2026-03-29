# PR Change Notes

**Title:**  
Review-Driven Security and Reliability Hardening

**Summary:**  
This PR hardens WorkNest across backend and frontend by closing security gaps around cookie-authenticated refresh/logout flows, moving password confirmation checks into schema validation, and making frontend API bootstrapping safe in tests. It also improves runtime reliability by fixing AI review request-path coupling, correcting AI prompt job field mapping, reducing noisy logging, and adding adapter-based cache scaling support. Key files touched include backend auth/security middleware and routes, application/AI services, frontend auth/API utilities, and new regression tests covering CSRF, schema validation, CORS, and frontend base URL resolution.

## 1. Concepts
This PR focuses on shifting important safety checks to the earliest reliable boundary.

- Cookie-authenticated refresh and logout endpoints now require both a trusted request origin and an explicit CSRF header so browsers cannot silently trigger those actions from another site.
- Password reset and password change payloads now fail validation if `confirmPassword` does not match, instead of relying only on later service checks.
- Frontend API bootstrap now supports test-safe base URL resolution so unit tests do not crash before they even run.
- Credentialed CORS is stricter and no longer treats wildcard origins as valid.
- Manual AI review no longer blocks the admin request until the third-party provider finishes; it is marked as processing and completed asynchronously in-process.
- Cache middleware is now structured to allow a shared store module later, while keeping a safe in-memory fallback for the current repo.

## 2. Real-world analogy
Think of this PR like upgrading a building’s front desk and back office at the same time.

The front desk now checks both your badge and whether you came through the right entrance before letting you change something sensitive. Inside the building, paperwork is validated before it reaches the manager, noisy hallway shouting is replaced with proper incident logs, and one slow vendor call no longer makes the receptionist freeze while everyone waits in line.

## 3. Smallest practical example
One minimal example from this PR is the new CSRF requirement on cookie-authenticated refresh:

```js
await refreshClient.post("/auth/refresh-token", null, {
  withCredentials: true,
  headers: {
    "X-Worknest-Csrf": "1",
    "X-Requested-With": "XMLHttpRequest",
  },
});
```

And on the backend, password confirmation is now enforced at the schema boundary:

```js
const updatePasswordSchema = z
  .object({
    password: currentPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "New password and confirm password must match",
  });
```

## 4. Why it exists & where it is used
This change exists because several review findings sat in the category of “works most of the time, but fails unsafely or too late.”

- The CSRF protection applies to backend refresh/logout routes in [`userRoutes.js`](/Users/User/Documents/worknest/worknest-backend/src/routes/userRoutes.js) and [`adminRoutes.js`](/Users/User/Documents/worknest/worknest-backend/src/routes/adminRoutes.js), with frontend support added in [`api.js`](/Users/User/Documents/worknest/worknest-frontend/src/api/api.js), [`admin.js`](/Users/User/Documents/worknest/worknest-frontend/src/api/admin.js), and [`axiosInstance.js`](/Users/User/Documents/worknest/worknest-frontend/src/utils/axiosInstance.js).
- Password confirmation validation applies to reset and password-update flows through [`dataSchema.js`](/Users/User/Documents/worknest/worknest-backend/src/lib/dataSchema.js).
- Test-safe frontend API bootstrapping applies to isolated frontend tests and any environment where `VITE_WORKNEST_BASE_URL` is intentionally stubbed late, through [`axiosInstance.js`](/Users/User/Documents/worknest/worknest-frontend/src/utils/axiosInstance.js) and [`setupTests.js`](/Users/User/Documents/worknest/worknest-frontend/src/test/setupTests.js).
- AI reliability changes apply to admin-triggered AI review and automatic application processing through [`application.service.js`](/Users/User/Documents/worknest/worknest-backend/src/services/application.service.js), [`application.controller.js`](/Users/User/Documents/worknest/worknest-backend/src/controllers/application.controller.js), [`ai.service.js`](/Users/User/Documents/worknest/worknest-backend/src/services/ai.service.js), and the admin application detail UI in [`ApplicationDetail.jsx`](/Users/User/Documents/worknest/worknest-frontend/src/features/AdminApplication/ApplicationDetail.jsx).
- Cache and operational hardening apply in [`cache.js`](/Users/User/Documents/worknest/worknest-backend/src/middleware/cache.js), [`cacheStore.js`](/Users/User/Documents/worknest/worknest-backend/src/config/cacheStore.js), [`security.js`](/Users/User/Documents/worknest/worknest-backend/src/middleware/security.js), [`db.server.js`](/Users/User/Documents/worknest/worknest-backend/src/config/db.server.js), and [`index.js`](/Users/User/Documents/worknest/worknest-backend/index.js).

## 5. Technical trade-off
The biggest trade-off in this PR was choosing an in-process background queue for manual AI review instead of introducing a full external worker/queue system right away.

That approach was chosen because it meaningfully reduces request latency and provider coupling without rewriting deployment architecture or introducing new infrastructure during a focused hardening pass. The technical debt is that queued AI work is still process-local: it is better than synchronous inline execution, but it is not durable across restarts and is not yet suitable for guaranteed multi-instance background processing. A future follow-up should move this to a real external job queue and pair it with a shared cache store implementation behind `CACHE_STORE_MODULE`.
