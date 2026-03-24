# WorkNest Backend – Production Review Report

## Severity Legend
- **Critical**: exploitable security flaw, data integrity issue, or outage risk.
- **High**: major scale/perf/correctness risk under load.
- **Medium**: significant maintainability/operability concern.
- **Low**: clean-up / consistency improvements.

## Findings and Fixes

### Critical
1. **Refresh token ingestion only from cookies (multi-client breakage + mobile incompatibility)**
   - **Location**: `src/controllers/auth.controller.js`, `src/controllers/admin.controller.js`
   - **Impact**: Native mobile clients without cookie jar could not refresh sessions reliably.
   - **Fix**: Added unified refresh token extractor with fallback order **cookie → Authorization bearer → request body**.
   - **Expected improvement**: Stable refresh flow for web + mobile clients.

2. **No HTTPS enforcement middleware in production path**
   - **Location**: request pipeline in `index.js`
   - **Impact**: accidental plaintext traffic acceptance in misconfigured ingress scenarios.
   - **Fix**: Added `enforceHttpsMiddleware` (production-only, proxy-aware).
   - **Expected improvement**: transport security hardening.

### High
1. **Observability gaps: no `/metrics` endpoint and no request-level counters**
   - **Location**: app bootstrap
   - **Impact**: difficult to detect latency regressions and endpoint-level error spikes.
   - **Fix**: Added request metrics middleware + Prometheus-style `/metrics` and JSON `/metrics/snapshot`.
   - **Expected improvement**: better SRE visibility and alertability.

2. **Application endpoint unthrottled for high-write abuse**
   - **Location**: `/api/v1/applications/:jobId/apply`
   - **Impact**: spam/abuse can cause CPU and storage spikes.
   - **Fix**: Added dedicated `applyJobLimiter`.
   - **Expected improvement**: controlled write pressure and abuse resistance.

3. **Resume upload rollback missing on DB failure**
   - **Location**: `src/controllers/application.controller.js`
   - **Impact**: orphaned Cloudinary assets after failed application creation.
   - **Fix**: Added compensating deletion flow for uploaded resume when DB write fails.
   - **Expected improvement**: reduced storage leaks and data consistency.

### Medium
1. **CORS implementation was static and permissive for operational mistakes**
   - **Location**: `index.js`
   - **Impact**: easier to misconfigure allowed origins.
   - **Fix**: Added explicit allowlist validator and centralized CORS options builder.

2. **Cache middleware assumed `req.user` always exists**
   - **Location**: `src/middleware/cache.js`
   - **Impact**: potential runtime errors for anonymous requests.
   - **Fix**: null-safe user id extraction.

3. **Insufficient index coverage for large admin/application queries**
   - **Location**: `src/models/application.js`, `src/models/jobs.js`
   - **Impact**: slower filtered and sorted reads at scale.
   - **Fix**: added compound indexes for status/job/applicant + createdAt patterns.

### Low
1. **Container hardening opportunities**
   - **Location**: `Dockerfile`
   - **Fix**: moved to multi-stage build, non-root runtime user, explicit healthcheck tooling.

2. **Missing production compose template and load-test artifact**
   - **Fix**: added `docker-compose.prod.yml` and `tests/load/worknest-smoke.js`.

## Performance Bottlenecks Summary
- Candidate bottlenecks are heavy regex search and multi-step keyword joins in applications filtering.
- Added indexes and metrics to reduce/observe cost; recommend future cursor pagination for all list endpoints.

## Security Risks Summary
- Addressed HTTPS enforcement, stricter CORS checks, and safer refresh token ingestion.
- Resume uploads moved to authenticated/raw Cloudinary mode for better access control.

## Maintainability Summary
- Introduced reusable middleware modules for security and metrics.
- Added automated tests for token extraction and CORS/HTTPS guards.
