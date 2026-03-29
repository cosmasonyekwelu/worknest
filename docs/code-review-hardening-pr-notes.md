# PR Change Notes

**Title:**  
Security Hardening, Verified Access Enforcement, and Auth Flow Reliability

**Summary:**  
This PR closes several review findings across the WorkNest backend and frontend by tightening authentication behavior, enforcing verified-account access on sensitive applicant actions, and reducing contract drift in client code. Key backend updates landed in `worknest-backend/src/services/user.service.js`, `worknest-backend/src/middleware/authenticate.js`, `worknest-backend/src/services/auth.service.js`, and the applicant/admin route files, while the frontend session and API cleanup centered on `worknest-frontend/src/store/AuthProvider.jsx`, `worknest-frontend/src/api/api.js`, and `worknest-frontend/src/api/applications.js`. The overall purpose of the PR is to improve security, reduce abuse and enumeration risk, make auth restoration more predictable, and add focused regression coverage for the highest-risk flows.

## 1. Concepts
This PR hardens account and session behavior in a few connected ways. Password reset now returns the same success message whether or not the email exists, which blocks account enumeration. Protected applicant actions now require both authentication and a verified email at the API layer, so direct requests cannot bypass frontend-only guards.

The session model was also made more explicit. Instead of inferring whether the client should use user or admin refresh behavior from the current URL, the frontend now tracks an `authMode` in state and uses that to restore sessions after reloads. On top of that, uploads now validate file signatures instead of trusting browser-reported MIME types, admin search uses indexed queries, application search uses denormalized searchable fields, and the frontend applications client validates API response contracts instead of silently accepting multiple response shapes.

## 2. Real-world analogy
Think of this PR like improving how a secure office building works. The receptionist now gives the same answer whether or not an employee exists in the directory, so outsiders cannot probe who works there. Sensitive rooms now require both a badge and an activated employee account, while the security desk checks the physical ID card itself instead of trusting whatever label a visitor wrote on a folder.

## 3. Smallest practical example
One minimal example is the password-reset and verified-user protection pattern:

```js
// Always return the same response for forgot-password
const user = await User.findOne({ email });

if (user) {
  // create reset token and send email
}

return {
  message: "If an account exists, a password reset link has been sent.",
};

// Require verified applicants for protected write actions
router.post(
  "/:jobId/apply",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  upload.single("resume"),
  validateUploadedResume,
  applyForJob,
);
```

This shows the two main ideas: do not reveal account existence, and enforce verification in the backend route chain rather than only in the UI.

## 4. Why it exists & where it is used
The change exists because several critical behaviors were either too trusting or too loosely enforced. The old forgot-password response allowed attackers to detect whether an email was registered. The old protected-route model relied too heavily on frontend behavior, which meant unverified users could still attempt direct API calls. The old upload middleware trusted client-provided MIME types, which is unsafe for files that are later stored or processed.

These fixes apply across the main user journey: account recovery, login/session restoration, profile settings, resume uploads, job saves, and application submission. They also affect admin-facing search and operational maintainability by moving the frontend toward stricter response contracts and the backend toward more scalable query patterns.

## 5. Technical trade-off
One significant trade-off in this PR is the decision to denormalize searchable application fields such as applicant name, applicant email, job title, and company name into the `Application` document. That approach was chosen because it makes admin keyword search much cheaper and more direct than repeatedly joining across `User` and `Jobs` collections at query time.

The trade-off is that denormalized data can become stale if related records change and every sync path is not maintained carefully. This PR updates those fields in the main creation and update flows, but the system still carries some technical debt because broader background reconciliation or full lifecycle sync coverage is not yet implemented.
