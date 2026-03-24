# Deployment Guide (Hardened Build)

## Option A: Docker Compose (production-like)
1. Create environment values in host runtime (do not bake `.env` into image).
2. Build and run:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Validate probes:
   - `GET /health`
   - `GET /ready`
   - `GET /metrics`

## Option B: Kubernetes / ECS Checklist
- Run container behind TLS-terminating ingress/load balancer.
- Preserve `x-forwarded-proto` for HTTPS enforcement middleware.
- Set resource limits (starting recommendation):
  - **CPU**: 1 vCPU limit, 250m request
  - **Memory**: 768Mi limit, 256Mi request
- Configure readiness probe to `/ready` and liveness probe to `/health`.
- Mount secrets via platform secret manager (AWS Secrets Manager, etc.).

## Required Runtime Secrets
- MongoDB URI and database name
- JWT access and refresh secrets (must be different in production)
- Brevo sender + API key
- Cloudinary credentials
- Groq API key (if AI is enabled)

## Scaling Notes
- Horizontal scale requires external shared cache (Redis recommended).
- Keep API stateless (JWT + DB-backed refresh state already compatible).
- Add queue worker for email/AI async workloads for heavy traffic bursts.
