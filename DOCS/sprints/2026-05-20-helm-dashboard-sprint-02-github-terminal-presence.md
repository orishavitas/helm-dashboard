# Sprint 02 - GitHub Project Tracking and Live Terminal Presence

**Date:** 2026-05-20
**Status:** Implemented locally by Codex

## Scope

- Add cached GitHub drill-downs for open pull requests and recent commits.
- Keep dashboard/project-detail GitHub health aligned from `github_repo_snapshots`.
- Derive terminal `offline` state when the latest heartbeat is older than 10 minutes.
- Group operations terminal presence by repo and assignee with status, task, role, and history.
- Keep local sync one-way into Helm through `POST /api/operations/import`.

## Implementation

- Added `recent_commits` to `github_repo_snapshots` through `drizzle/0004_github_recent_commits.sql`.
- Added cached endpoints:
  - `GET /api/github/repos/[projectId]/pull-requests`
  - `GET /api/github/repos/[projectId]/commits`
- Updated GitHub refresh to fetch open PRs and the latest 10 commits in the same snapshot.
- Updated project summaries, project cards, and project detail to render GitHub status, errors, empty states, open PRs, and recent commits from the cached snapshot.
- Added `lib/terminal-presence.ts` for 10-minute offline derivation and repo/assignee grouping.
- Updated operations state and the terminal presence widget to use grouped terminal views.
- Extended `scripts/helm-sync-local.ps1` to include repo branch/commit/dirty state in imported project descriptions and task source-line notes while preserving stable `sourceRef` upserts.
- Switched `corepack pnpm build` to `next build --turbopack` because the standard webpack build path hangs before compilation in this environment while Turbopack completes cleanly.

## Verification

- `corepack pnpm exec tsc -p tsconfig.test.json; node --test .tmp\test-dist\tests\*.test.js` passed: 5 tests.
- `corepack pnpm typecheck` passed.
- `corepack pnpm lint` passed.
- `corepack pnpm build` passed with Turbopack.
- `corepack pnpm db:migrate` applied `0004_github_recent_commits`.
- Turbopack dev smoke:
  - `/api/github/repos/smoke/pull-requests` returned 307 without auth.
  - `/api/github/repos/smoke/commits` returned 307 without auth.
  - `/api/operations/state` returned 307 without auth.
  - `/api/overlord/state` returned 307 without auth.
  - `POST /api/operations/import` with invalid bearer returned `401 {"error":"Unauthorized"}`.
  - `scripts/helm-sync-local.ps1 -Config config\helm-projects.example.json -BaseUrl http://127.0.0.1:3000 -Secret <dev smoke secret>` returned `{"ok":true,"projects":1,"tasks":{"created":0,"updated":0}}`.
- Graphify helper refreshed `graphify-out`: 214 nodes, 281 edges, 61 communities. The known follow-on `.codex/hooks.json` permission warning remains after graph rebuild.

## Remaining

- Authenticated browser visual verification for `/` and `/projects/[id]` still needs a signed-in session.
