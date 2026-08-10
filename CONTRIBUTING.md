# Contributing

Thanks for contributing to Poin Anak. This guide covers how to make changes
and how the automated release-notes pipeline consumes your commits.

## Development

See [`docs/development.md`](./docs/development.md) for local setup and
conventions.

## Commit conventions

This repository uses **Conventional Commits**. Release notes and version bumps
are generated from these commit messages, so every change must follow the
format:

```text
<type>(<optional scope>): <short summary>
```

**Types:**

- `feat` — a new feature (lands in the next minor release).
- `fix` — a bug fix (lands in the next patch release).
- `docs`, `chore`, `refactor`, `perf`, `test`, `style`, `build`, `ci` — no
  version bump, but still grouped in the changelog where relevant.

**Breaking changes:** append `!` after the type/scope or add a `BREAKING
CHANGE:` trailer in the body. This triggers a major version bump.

**Scope** (optional) names the affected area, e.g. `(activities)`,
`(backend)`, `(frontend)`, `(moodboard)`.

Examples:

```text
feat(activities): add bulk activity logging
fix: handle empty history response in pagination
docs: document the release process
```

## Branch naming

Name branches to describe the work:

```text
feature/<slug>
fix/<slug>
chore/<slug>
docs/<slug>
ci/<slug>
```

## Pull requests

- One logical change per PR; keep diffs small and reviewable.
- Write imperative, descriptive PR titles. The PR title and its commits are
  used by the release-notes generator.
- Never commit secrets, credentials, or generated artifacts.
- Add or update tests for changed behavior and run the relevant checks before
  requesting review.

## Release process

The release-notes pipeline is automated with **release-please** (GitHub
Actions):

1. When changes merge to `main`, the
   [release-please workflow](./.github/workflows/release-please.yml) detects
   Conventional Commit types.
2. It opens a **release PR** per component (`backend`, `frontend`) that bumps
   the version, updates `CHANGELOG.md`, and captures release notes.
3. Merge the release PR to create a tagged GitHub release with the generated
   notes.

You don't write `CHANGELOG.md` by hand — let the pipeline own it. When a
release PR is open, merge it before stacking further feature/fix work so the
changelog stays clean.
