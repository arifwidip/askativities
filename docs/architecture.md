# Architecture

Poin Anak is a mobile-first Progressive Web App for tracking children's good
habits through a point/reward system. This document describes the high-level
system.

## Monorepo layout

```
askativities/
├── backend/    Express.js + TypeScript + Prisma ORM + S3-compatible storage
├── frontend/   React + Vite + TypeScript + TailwindCSS + framer-motion + PWA
└── docs/       This documentation
```

The repository is a monorepo with two independently deployable applications.
Each lives in its own folder with its own `package.json`, lockfile, and
tooling.

## Backend

- **Framework:** Express.js + TypeScript, compiled with `tsc` to `dist/`.
- **ORM:** Prisma. The schema lives in [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma);
  `prisma db push` syncs it at container startup and `npm run seed` loads
  initial data.
- **Storage:** S3-compatible object storage (Garage / MinIO / AWS S3) via
  `@aws-sdk/client-s3` for avatar uploads.
- **Auth:** JWT-based. Routes and middleware are organized in
  [`backend/src`](../backend/src):

  | File | Purpose |
  | --- | --- |
  | `index.ts` | App entry point, server bootstrap. |
  | `db.ts` | Prisma client singleton. |
  | `routes/auth.ts` | Login/registration and token issuing. |
  | `routes/children.ts` | Child entity CRUD. |
  | `routes/activities.ts` | Habit/activity management. |
  | `routes/rewards.ts` | Reward catalog and redemption. |
  | `middlewares/auth.ts` | JWT verification middleware. |
  | `utils/s3.ts` | Object storage client and helpers. |

### Data model

The Prisma schema defines the core entities: users (parents/admins), children,
activities, and rewards. Points are earned by completing activities and spent on
rewards. See the schema for authoritative field definitions.

## Frontend

- **Framework:** React 19 + Vite + TypeScript, TailwindCSS for styling,
  framer-motion for animation, `vite-plugin-pwa` for installability.
- **Routing:** `react-router-dom`. Pages live in
  [`frontend/src/pages`](../frontend/src/pages):

  | Page | Purpose |
  | --- | --- |
  | `Beranda.tsx` | Home/dashboard. |
  | `Aktivitas.tsx` | Activity logging. |
  | `Reward.tsx` | Reward redemption. |
  | `Riwayat.tsx` | History of points/activity logs (cursor-paginated). |
  | `Admin.tsx` | Admin management. |

- **State:** shared context in [`frontend/src/context/AppContext.tsx`](../frontend/src/context/AppContext.tsx);
  data fetching via `axios`.
- The frontend talks to the backend through a single API origin configured by
  `VITE_API_URL`.

## Cross-cutting concerns

- **Deployment:** backend runs from a Docker image (see
  [`backend/Dockerfile`](../backend/Dockerfile)); frontend is built as a static
  site. See [`deployment.md`](./deployment.md).
- **Releases:** release notes are generated automatically from Conventional
  Commits by a GitHub Actions workflow — see
  [`CONTRIBUTING.md`](../CONTRIBUTING.md) and the
  [release-please workflow](../.github/workflows/release-please.yml).
