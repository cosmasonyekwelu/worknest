# WorkNest Workspace

This root folder contains both sides of the WorkNest project:

- `worknest-frontend/`
- `worknest-backend/`

The root `.gitignore` is set up to help prevent accidental commits of:

- `node_modules`
- build output such as `dist/` and `build/`
- `.env` files and other secret-bearing config files
- local editor/cache files
- logs, test reports, and temporary files

## Current Structure

```text
worknest/
|- worknest-backend/
|- worknest-frontend/
|- .gitignore
|- README.md
```

## Safe Git Setup

If you want to turn this root folder into the main git repository:

```bash
git init
git add .gitignore README.md
git status
```

Before your first push, review `git status` and make sure real secret files are not staged.

## Environment Files

- Real environment files such as `.env` are ignored at the root level.
- Example files such as `.env.example` are still allowed so the team can share setup instructions safely.
- The backend already includes an example file at `worknest-backend/.env.example`.

If the frontend later needs environment variables, add a safe example file such as:

```text
worknest-frontend/.env.example
```

and keep the real `.env` file untracked.

## What To Commit

Safe to commit:

- application source code
- configuration templates
- documentation
- lockfiles such as `package-lock.json`

Do not commit:

- API keys, database URIs, JWT secrets, mail credentials, or cloud secrets
- `node_modules`
- generated build output unless you intentionally version deployment artifacts

## Notes

The current `worknest-frontend` folder appears to contain generated output and installed dependencies. Those are now ignored at the root so they do not get pushed by mistake if you initialize git from this folder.
