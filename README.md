# WorkNest

WorkNest is a full-stack recruitment platform workspace. It combines a candidate-facing web app with an admin dashboard and a backend API that handles authentication, job management, applications, resume uploads, notifications, and operational endpoints.

At the root of this repository you have the shared workspace documentation plus two main apps:

- `worknest-frontend/`: React + Vite client for candidates and admins
- `worknest-backend/`: Express API with Mongo-backed domain logic and OpenAPI docs

## What The Project Does

WorkNest supports the main flows you would expect in a job marketplace:

- public job discovery and job detail pages
- candidate signup, login, verification, password reset, and profile management
- saved jobs, application submission, application tracking, and resume workflows
- admin job creation, job updates, applicant review, notifications, and dashboard views
- backend security features such as JWT auth, role-based access, rate limiting, metrics, and protected monitoring endpoints

## Tech Stack

Frontend:

- React 19
- Vite 7
- React Router
- TanStack Query
- Tailwind CSS
- Vitest + Testing Library

Backend:

- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth with refresh tokens
- Cloudinary for uploads
- Brevo for transactional email
- OpenAPI / Swagger docs

## Repository Structure

```text
worknest/
|- docs/
|- worknest-backend/
|- worknest-frontend/
|- .gitignore
|- README.md
```

Useful project docs already in the repo:

- `worknest-backend/README.md`
- `worknest-backend/docs/ARCHITECTURE_OVERVIEW.md`
- `worknest-backend/docs/API_REFERENCE.md`
- `worknest-backend/docs/SECURITY.md`
- `worknest-backend/openapi.json`

## Local Setup

### 1. Install dependencies

Run these once from the repo root:

```powershell
cd worknest-backend
npm install

cd ..\worknest-frontend
npm install
```

### 2. Create local environment files

Use the example files as your starting point:

```powershell
Copy-Item worknest-backend\.env.example worknest-backend\.env
Copy-Item worknest-frontend\.env.example worknest-frontend\.env
```

Minimum frontend config:

- `VITE_WORKNEST_BASE_URL`

Important backend config:

- `PORT`
- `CLIENT_URL`
- `ALLOWED_ORIGINS`
- `MONGO_URI`
- `DATABASE_NAME`
- `JWT_ACCESS_SECRET_KEY`
- `JWT_REFRESH_SECRET_KEY`
- `MONITORING_TOKEN`

Optional backend integrations used by parts of the app:

- `BREVO_*` for email delivery
- `CLOUDINARY_*` for file uploads
- `GOOGLE_CLIENT_ID` for Google auth
- `GROQ_API_KEY` and `AI_*` values for AI-assisted workflows

### 3. Start the apps

Run the backend and frontend in separate terminals:

Backend:

```powershell
cd worknest-backend
npm run dev
```

Frontend:

```powershell
cd worknest-frontend
npm run dev
```

Default local URLs:

- frontend: `http://localhost:5173`
- backend API: `http://localhost:5000`
- backend docs: `http://localhost:5000/docs`
- OpenAPI spec: `http://localhost:5000/openapi.json`

## Quality Checks

Frontend:

```powershell
cd worknest-frontend
npm run lint
npm test
npm run build
```

Backend:

```powershell
cd worknest-backend
npm test
```

Security audit scripts exist in both apps:

```powershell
npm run security:audit
```

## Git And Secret Safety

This workspace is set up so real local secrets stay out of version control:

- real `.env` files are ignored
- `.env.example` files remain commit-safe templates
- dependency folders, build output, logs, caches, and local tooling state are ignored
- certificate and credential-style files are ignored at the root to reduce accidental leaks

Current repo state is aligned with that workflow: the tracked files include the example env files, not the real `.env` files.

Good practice before every push:

```powershell
git status --short
```

If a secret is ever staged or pushed, remove it from Git history and rotate the credential immediately. Updating `.gitignore` only prevents future accidental commits; it does not invalidate a secret that has already leaked.

## Notes

- The frontend currently contains local `dist/` output and `node_modules/`; the root `.gitignore` prevents those from being committed by accident.
- The backend also has local logs and runtime files that should remain untracked.
- If you want deeper implementation detail, start with the backend architecture and API docs listed above.
