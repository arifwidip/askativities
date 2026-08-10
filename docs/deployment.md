# Deployment

Poin Anak is deployed on **Coolify** (self-hosted VPS) using Git integration.
The full step-by-step guide lives in the [Deployment
Guide](../README.md#-deployment-guide-on-coolify) in the README; this page is a
short reference and links to the release workflow.

## Resources

One Coolify project with three resources:

| Resource | Type | Base dir | Port |
| --- | --- | --- | --- |
| PostgreSQL | Built-in service | — | — |
| Backend | Dockerfile | `backend` | `3000` |
| Frontend | Static / Nixpacks | `frontend` | `80` |

### Backend

- **Build pack:** `Dockerfile` (see
  [`backend/Dockerfile`](../backend/Dockerfile)).
- **Environment:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and the
  `S3_*` credentials.
- The Dockerfile auto-runs `npx prisma migrate deploy` after build and
  `prisma db push` + seed at container startup.

### Frontend

- **Build pack:** `Static` or `Nixpacks`.
- **Environment:** `VITE_API_URL` pointing at the backend domain.
- **SPA redirect:** enable fallback routing so client-side routes (e.g.
  `/admin`, `/riwayat`) don't 404 on refresh.

## Releasing

Releases are versioned and documented automatically from Conventional Commits
by a GitHub Actions workflow using **release-please**. When changes merge to
`main`, the workflow opens release PRs per component (`backend`, `frontend`),
bumps versions, and maintains [`CHANGELOG.md`](../CHANGELOG.md). Merging a
release PR creates a tagged GitHub release with generated notes.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md#release-process) for the workflow.
