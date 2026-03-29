# PR Change Notes

**Title:**  
Application Validation, Transaction Safety, and Rate-Limit Hardening

**Summary:**  
This PR hardens the highest-risk application and account mutation paths across the WorkNest backend and frontend without changing the overall product flow. It adds schema-driven validation for application submissions, standardizes validation error formatting, wraps multi-step account and job mutations in MongoDB transactions, strengthens rate-limit key generation, and makes frontend application normalization resilient to malformed JSON. The main backend files touched include `worknest-backend/src/validation/application.validation.js`, `worknest-backend/src/models/application.js`, `worknest-backend/src/services/user.service.js`, `worknest-backend/src/controllers/job.controller.js`, and `worknest-backend/src/middleware/rateLimit.js`, while the frontend hardening lives in `worknest-frontend/src/api/applications.js` and related tests.

## 1. Concepts
The core change is moving risky input and mutation paths onto shared, explicit rules instead of relying on ad hoc parsing or best-effort cleanup. Application form fields such as `portfolioUrl`, `linkedinUrl`, answers, and `personalInfo` are now parsed and validated through a single schema path, oversized values are rejected before persistence, and Mongoose model constraints backstop the request layer. Multi-step destructive operations such as account deletion and job deletion now run inside MongoDB transactions so related writes succeed or fail together. Rate limiting was also hardened so request buckets are keyed by IP and authenticated identity rather than user-agent strings, and the middleware now exposes a safe adapter hook for a future shared store module.

## 2. Real-world analogy
Think of this PR like upgrading a front desk and records room in the same office. The front desk now checks that forms are complete and correctly formatted before filing them, and the records room now treats every multi-folder cleanup as one sealed box move instead of a handful of unrelated trips. If the move fails halfway through, the box stays where it was instead of leaving papers scattered across different shelves.

## 3. Smallest practical example
The smallest example is the application submission schema now safely parsing multipart JSON fields and rejecting malformed URLs before the controller persists anything.

```js
const applicationSchema = z.object({
  portfolioUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).url("Must be a valid URL").optional(),
  ),
  answers: jsonArrayField("answers", applicationAnswerSchema),
  personalInfo: jsonObjectField("personalInfo", personalInfoSchema),
});
```

With this pattern, a bad `linkedinUrl`, malformed `answers` JSON string, or oversized answer body fails in the same standardized validation path instead of reaching the database or crashing the page later.

## 4. Why it exists & where it is used
This change exists because the application flow had several audit-level risks packed into a small number of hot paths: weak URL and string validation, inconsistent validation responses, multi-step deletes that could partially commit, and frontend parsing that assumed stored payloads were always well-formed. It applies directly to candidate job applications, admin application management, account deletion, job deletion, and global/auth rate limiting. In practice, these updates protect the `/applications/:jobId/apply` flow, admin status and note updates, job cleanup paths, account cleanup paths, and any UI that renders normalized application payloads.

## 5. Technical trade-off
The main trade-off was choosing a lightweight shared-store adapter hook for rate limiting instead of introducing a Redis dependency directly in this PR. That keeps this hardening pass production-safe and low-risk for the current repo, while still making horizontal scaling a near drop-in change through `RATE_LIMIT_STORE_MODULE`. The downside is that true cross-instance rate-limit coordination still depends on external infra and a compatible adapter module being provided, so the current fallback remains in-memory until that integration is wired in.
