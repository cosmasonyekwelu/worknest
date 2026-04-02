# WorkNest Backend API

Production-oriented Express/Mongo backend for WorkNest web, admin, and mobile clients.

## Core Capabilities
- JWT auth with access + rotating refresh tokens
- Role-based authorization for applicant/admin surfaces
- Job lifecycle APIs and application workflows
- Resume/avatar uploads to Cloudinary
- Brevo-powered email notifications
- AI-assisted shortlisting (Groq)
- Health, readiness, and metrics endpoints

## Quick Start
```bash
npm install
npm run dev
```

## API Documentation
- Swagger UI: `GET /docs`
- Raw OpenAPI spec: `GET /openapi.json`

Once the backend is running locally, you can open:

```text
http://localhost:5000/docs
http://localhost:5000/openapi.json
```

## Environment Variables
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173,https://admin.worknest.com
ALLOWED_ORIGINS=https://worknest-silk.vercel.app,https://admin.worknest.com

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
DATABASE_NAME=worknest_server

JWT_ACCESS_SECRET_KEY=change_me_access
JWT_REFRESH_SECRET_KEY=change_me_refresh
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_EXPIRES=7d
MONITORING_TOKEN=change_me_monitoring_token
GOOGLE_CLIENT_ID=your_google_oauth_client_id

BREVO_API_KEY=...
BREVO_SENDER_EMAIL=no-reply@example.com
BREVO_SENDER_NAME=Worknest

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

GROQ_API_KEY=...
AI_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
AI_SHORTLIST_THRESHOLD=50
```

## Security/Operations Notes
- In production, HTTP requests are rejected unless `x-forwarded-proto=https` or direct TLS is used.
- CORS is allowlist-based from the combined values of `CLIENT_URL` and `ALLOWED_ORIGINS`.
- Refresh token endpoints accept the refresh token from the secure cookie only.
- Applicant-only write flows require verified accounts at the API layer.
- Metrics endpoints require an `x-monitoring-token` header that matches `MONITORING_TOKEN`.
- Resume and image uploads validate file signatures, not just client-supplied MIME types.

## Operational Endpoints
- `GET /health` and `GET /health/live`
- `GET /ready` and `GET /health/ready`
- `GET /metrics` (Prometheus text, protected)
- `GET /metrics/snapshot` (JSON, protected)
- `GET /docs` (Swagger UI)
- `GET /openapi.json` (canonical OpenAPI contract)

## Docker
Development:
```bash
docker compose up --build
```

Production-like:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Load Testing (K6)
Script: `tests/load/worknest-smoke.js`

Example:
```bash
k6 run tests/load/worknest-smoke.js
```
