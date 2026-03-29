# PR Change Notes

**Title:**  
Application Admin Contract Alignment and Job Flow Hardening

**Summary:**  
This PR fixes release-blocking contract drift between the admin applications UI and backend, hardens job search and deletion behavior, and improves consistency across application/job payloads. It updates key backend files such as `src/services/application.service.js`, `src/services/job.service.js`, `src/controllers/job.controller.js`, and `src/validation/application.validation.js`, along with frontend consumers in `src/utils/constant.js`, `src/features/AdminApplication/Filter.jsx`, `src/hooks/useJobs.js`, `src/hooks/useApplications.js`, and `src/pages/CandidateApplicationForm.jsx`. The overall goal is to make filtering, payload shape, search, deletion, and job/application UI flows predictable and safe without introducing cross-project coupling.

## 1. Concepts
- Canonical application statuses now live inside each app boundary instead of a repo-root shared file: backend status constants drive model/validation/service logic, while frontend status constants drive UI filters and normalization.
- Application detail responses now populate the correct job field, `requirement`, and normalize logo data to a stable `companyLogo` field so clients receive predictable job metadata.
- Job search now treats user input as untrusted input: regex characters are escaped, search length is capped, and multi-select filters are handled explicitly with validated arrays and safe `$in` queries.
- Job deletion now follows a clear lifecycle rule: jobs with existing applications cannot be deleted, and deletable jobs clean up saved-job references and job-related notifications.
- Admin dashboards now fetch application counts for many jobs in one request, reducing unnecessary API fan-out from the frontend.

## 2. Real-world analogy
Think of this PR like standardizing a warehouse. Every shelf now uses the same approved labels inside each department, search requests are sanitized before they reach the stock room, fragile items are packed in a consistent box, and products that already have active orders cannot be thrown away from inventory. Instead of sending one worker to count each shelf separately, one inventory sweep now returns all the counts at once.

## 3. Smallest practical example
The simplest example is the status contract cleanup: the backend validates only supported statuses, and the frontend renders only those same supported options from its own local constants module.

```js
// backend: worknest-backend/src/constants/applicationStatus.js
export const APPLICATION_STATUS_VALUES = [
  "submitted",
  "in_review",
  "shortlisted",
  "interview",
  "offer",
  "rejected",
  "hired",
];

// backend validation
status: z.enum(APPLICATION_STATUS_VALUES).optional()

// frontend: worknest-frontend/src/constants/applicationStatus.js
export const APPLICATION_STATUS_OPTIONS = [
  { label: "Submitted", value: "submitted" },
  { label: "In Review", value: "in_review" },
  // ...
];
```

With this pattern, unsupported legacy values like `pending` and `viewed` are no longer offered by the UI or accepted by the backend.

## 4. Why it exists & where it is used
This change exists because several high-risk paths had drifted out of sync: the admin applications screen could send unsupported status filters, application detail payloads could omit expected job fields, job search could be abused with unsafe regex input, and deletion flows could leave related records in an inconsistent state. It applies to admin application filtering, candidate application forms, public/private job listing queries, job deletion flows, per-job application analytics, and application detail rendering across both backend APIs and frontend pages. The status-constant move specifically uses app-local modules to keep each codebase self-contained while still centralizing status handling inside that codebase.

## 5. Technical trade-off
The main trade-off was choosing app-local status constants instead of a single repo-level shared module. That approach is better for package boundaries, tooling simplicity, and long-term maintainability, especially in a multi-app repository where the frontend and backend are deployed and tested independently. The downside is controlled duplication: if a new application status is added in the future, both apps must be updated together unless WorkNest later introduces a proper internal shared package with its own package boundary and build contract.

## PR Information
Backend fixes include status validation alignment, safe job search handling, correct application-detail population, batched application counts, guarded job deletion, and cleanup-oriented account deletion. Frontend fixes include aligned admin status filters, predictable `companyLogo` usage, multi-select job filter serialization, better candidate prefill from `fullname`, and a single-request job-application count flow.

Regression coverage was added for application status validation, application detail field shape, safe job search behavior, job deletion behavior, and frontend status/application contract handling. Verification for this PR was completed with:

- `worknest-backend`: `npm test`
- `worknest-frontend`: `npm run lint`
- `worknest-frontend`: `npm test`
