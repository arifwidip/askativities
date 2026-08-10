# Development

Local development setup, tooling, and conventions for Poin Anak.

## Prerequisites

- Node.js — see the `.nvmrc` at the repo root (and in `backend/` /
  `frontend/`) for the pinned version.
- PostgreSQL (local or cloud).
- S3-compatible object storage credentials (Garage / MinIO / AWS S3).

## Getting started

The README's [Local Development
Setup](../README.md#-local-development-setup) walks through backend and
frontend setup end to end. In short:

1. **Backend:** `cd backend`, create `.env`, then
   `npx prisma db push && npm run seed && npm run dev`.
2. **Frontend:** `cd frontend`, then `npm run dev` — serves on
   `http://localhost:5173`.

## Working in the monorepo

- Backend and frontend are independent workspaces with their own lockfiles and
  scripts. Install and run commands from the relevant subfolder.
- Common scripts:
  - Backend: `npm run dev`, `npm run build`, `npm run start`, `npm run seed`.
  - Frontend: `npm run dev`, `npm run build`, `npm run preview`.

## Conventions

- **TypeScript throughout.** Keep types explicit and avoid `any` unless
  necessary.
- **Style:** follow the existing code style of the surrounding codebase. Keep
  functions small and single-purpose; no dead code or commented-out blocks.
- **Database changes:** update [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)
  and reflect schema changes in this documentation.

## Commit conventions

This repository uses **Conventional Commits**. The format powers the automated
changelog and release notes.

```text
<type>(<optional scope>): <short summary>
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`,
`style`, `build`, `ci`. Prefix a breaking change with `BREAKING CHANGE:` in the
body or add `!` after the type/scope.

Example:

```text
feat(activities): add bulk activity logging
```

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the full contribution workflow.
