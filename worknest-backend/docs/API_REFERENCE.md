# WorkNest API Reference

Base URL (local): `http://localhost:5000/api/v1`

## Conventions

- Most protected routes require `Authorization: Bearer <access_token>`.
- Refresh tokens are handled via HTTP-only cookies.
- Some endpoints use multipart form uploads.

---

## Auth Routes (`/auth`)

### `POST /auth/create`
Register a new user.

### `POST /auth/login`
Login for applicant users.

### `POST /auth/google`
Exchange a Google ID token for a WorkNest access token and refresh cookie.

### `GET /auth/user`
Get authenticated user profile.

### `POST /auth/refresh-token`
Refresh access token using the HTTP-only refresh-token cookie.

### `PATCH /auth/verify-account`
Verify account with verification token.

### `POST /auth/resend/verify-token`
Resend verification token.

### `POST /auth/forgot-password`
Start forgot-password flow.

### `PATCH /auth/reset-password`
Reset password with reset token flow payload.

### `POST /auth/logout`
Logout the current user and clear the refresh cookie. A valid refresh cookie is enough even if the access token has expired.

---


## User Settings Routes (`/users/me/settings`)

### `GET /users/me/settings`
Get authenticated user settings and profile data.

### `PATCH /users/me/settings/personal-info`
Update personal profile fields for an authenticated, verified applicant.

### `PATCH /users/me/settings/notifications`
Update notification preferences (`email`, `push`, `marketing`) for a verified applicant.

### `PATCH /users/me/settings/profile-privacy`
Update privacy preferences (`profileVisibility`, `showEmail`, `showPhone`) for a verified applicant.

### `PATCH /users/me/settings/password`
Update password for an authenticated, verified applicant.

### `PATCH /users/me/settings/avatar`
Upload user avatar (`multipart/form-data`, field: `avatar`) for a verified applicant. Image signatures are validated server-side.

### `DELETE /users/me/settings/account`
Delete the authenticated, verified applicant account.

---

## Admin Routes (`/admin`)

### `POST /admin/login`
Admin-only login endpoint.

### `GET /admin/profile`
Get authenticated admin profile.

### `POST /admin/refresh-token`
Refresh admin access token using the HTTP-only refresh-token cookie.

### `PATCH /admin/profile`
Update admin profile.

### `PATCH /admin/upload-avatar`
Upload admin avatar.

### `PATCH /admin/profile/password`
Update admin password.

### `GET /admin/all`
Get all users (admin only).

### `DELETE /admin/:id/delete-account`
Delete a user account by ID (admin only).

### `DELETE /admin/delete-account`
Delete current admin profile account.

### `POST /admin/logout`
Logout the current admin and clear the refresh cookie. A valid refresh cookie is enough even if the access token has expired.

---

## Job Routes (`/jobs`)

### `POST /jobs`
Create a job (admin only, supports avatar upload).

### `GET /jobs/all`
Get all jobs (supports optional authentication).

### `GET /jobs/:id`
Get job details by ID.

### `PATCH /jobs/:id`
Update job by ID (admin only).

### `DELETE /jobs/:id`
Delete job by ID (admin only).

### `PATCH /jobs/:jobId/upload-avatar`
Upload or replace job avatar image. Image signatures are validated server-side.

### `GET /jobs/saved`
List saved jobs for an authenticated, verified applicant.

### `POST /jobs/:id/save`
Save a job (verified applicant only).

### `DELETE /jobs/:id/save`
Unsave a job (verified applicant only).

Legacy aliases `POST /jobs/create`, `PATCH /jobs/:id/update`, and `DELETE /jobs/:id/delete` remain temporarily supported but are deprecated.

---

## Application Routes (`/applications`)

### `POST /applications/:jobId/apply`
Apply for a job (`multipart/form-data`, field: `resume`, verified applicant only). Resume files are validated by file signature.

### `GET /applications/me`
Get current verified applicant's applications.

### `GET /applications/:id`
Get application details by ID (applicant or admin).

### `GET /applications`
Get all applications (admin only).

### `PATCH /applications/:id/status`
Update application status (admin only).

### `PATCH /applications/:id/note`
Update application internal note (admin only).

### `GET /applications/stats/overview`
Get application stats overview (admin only).

---

## Contact Routes (`/contact`)

### `POST /contact/send`
Submit contact request.

## Operational Endpoints

### `GET /health`
Lightweight liveness probe.

### `GET /ready`
Readiness probe that verifies database connectivity.

### `GET /metrics`
Prometheus text metrics output for request volume, route-level errors, and duration totals. Requires `x-monitoring-token`.

### `GET /metrics/snapshot`
JSON metrics snapshot for quick debugging. Requires `x-monitoring-token`.
