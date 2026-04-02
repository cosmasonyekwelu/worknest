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

Sample `multipart/form-data` payload fields:

- `resume`: _(file: pdf/doc/docx)_
- `portfolioUrl`: `https://portfolio.example.com`
- `linkedinUrl`: `https://linkedin.com/in/jane-doe`
- `personalInfo` (JSON string):
```json
{
  "firstname": "Jane",
  "lastname": "Doe",
  "email": "jane.doe@example.com",
  "phone": "+12025550123",
  "currentLocation": "Austin, TX"
}
```
- `answers` (JSON string):
```json
[
  {
    "question": "Why are you a great fit for this role?",
    "answer": "I have built and scaled similar systems in production."
  }
]
```

### `GET /applications/me`
Get current verified applicant's applications.

### `GET /applications/:id`
Get application details by ID (applicant or admin).

### `GET /applications`
Get all applications (admin only).

### `PATCH /applications/:id/status`
Update application status (admin only).

Sample JSON payload:
```json
{
  "status": "interview",
  "note": "Strong system design round. Move to final panel."
}
```

### `PATCH /applications/:id/note`
Update application internal note (admin only).

Sample JSON payload:
```json
{
  "note": "Candidate has strong communication and ownership signals."
}
```

### `GET /applications/stats/overview`
Get application stats overview (admin only).

### `GET /applications/stats`
Get application counts for specific jobs (admin only). Query accepts repeated `jobIds`.

Example query:
`/applications/stats?jobIds=64f1a8d2c7b9a1e4f9d2c3b1&jobIds=64f1a8d2c7b9a1e4f9d2c3b2`

### `POST /applications/:id/submit-interview`
Submit interview answers (verified applicant only).

Sample JSON payload:
```json
{
  "answers": [
    { "answer": "I reduced API latency by 37% by redesigning the caching layer." },
    { "answer": "I prefer documenting tradeoffs before implementation." }
  ]
}
```

### `POST /applications/:id/ai-review`
Trigger manual AI review for an application (admin only).

### `PUT /applications/:id/personal-info`
Update personal info for an application (admin only).

Sample JSON payload:
```json
{
  "personalInfo": {
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+12025550123",
    "currentLocation": "Austin, TX"
  }
}
```

---

## Contact Routes (`/contact`)

### `POST /contact/send`
Submit contact request.

Sample JSON payload:
```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@example.com",
  "subject": "Question about enterprise hiring plan",
  "message": "Hello team, I would like to understand enterprise support and security options."
}
```

---

## Notification Routes (`/notifications`)

### `GET /notifications`
Get current user's notifications. Query supports `page`, `limit`, `isRead`, and `unreadOnly`.

Example query:
`/notifications?page=1&limit=20&unreadOnly=true`

### `GET /notifications/unread-count`
Get unread notification count for the current user.

### `PATCH /notifications/:id/read`
Mark one notification as read.

### `PATCH /notifications/read-all`
Mark all current user's notifications as read.

### `DELETE /notifications/:id`
Delete one notification.

---

## Resume Routes (`/resume`)

### `POST /resume/upload`
Upload a resume for parsing/analysis (`multipart/form-data`, field: `resume`, verified applicant only).

### `GET /resume/analysis`
Get the current user's latest resume analysis state/result.

### `POST /resume/tailor/custom`
Generate tailored resume content from a custom job description.

Sample JSON payload:
```json
{
  "jobDescription": "We are hiring a backend engineer to build resilient Node.js APIs, improve observability, and scale MongoDB-backed services."
}
```

### `POST /resume/tailor/:jobId`
Generate tailored resume content for a specific job.

### `GET /resume/tailor/:jobId/download`
Download tailored resume output. Query parameter `format` supports `pdf` (default) and `txt`.

## Operational Endpoints

### `GET /health`
Lightweight liveness probe.

### `GET /ready`
Readiness probe that verifies database connectivity.

### `GET /metrics`
Prometheus text metrics output for request volume, route-level errors, and duration totals. Requires `x-monitoring-token`.

### `GET /metrics/snapshot`
JSON metrics snapshot for quick debugging. Requires `x-monitoring-token`.
