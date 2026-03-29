# Architecture Overview

## Request Flow
1. Request enters Express with request-id assignment (`x-request-id`).
2. Security middleware enforces HTTPS (prod) and strict CORS origin checks.
3. Rate-limit middleware applies global and endpoint-specific throttling.
4. Auth middleware validates JWT access tokens and role authorization.
5. Controllers call services (business logic), services call Mongoose models.
6. Global error handler normalizes error output and logs structured context.

## Authentication Flow
- Access token: short-lived bearer JWT.
- Refresh token: rotating JWT persisted as hashed token state in DB.
- Refresh token input: secure HTTP-only cookie only.

## Caching Strategy
- In-process cache (`node-cache`) used for low-latency auth/profile reads.
- Cache keys are namespaced by user id where possible.
- Invalidation is explicit on profile mutation endpoints.
- **Next step for horizontal scale**: replace with Redis shared cache and pub/sub invalidation.

## Upload & Media Security
- Resume uploads are sent to Cloudinary as `raw` with authenticated delivery mode.
- If DB application creation fails after upload, uploaded object is removed (compensating rollback).

## Observability
- `/metrics` endpoint exports Prometheus-compatible counters and requires `x-monitoring-token`.
- `/metrics/snapshot` gives JSON diagnostics for quick inspection and requires `x-monitoring-token`.
- `/health` and `/ready` available for orchestration probes.

## Data Integrity
- Application model contains unique `(applicant, job)` index to prevent duplicates.
- Added compound indexes for frequent dashboard filters and chronological views.
