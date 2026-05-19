# Changelog — Helm Dashboard

## 2026-05-19

### Added
- Implemented the Helm State Aggregator: task ownership/source fields, global operations state aggregation, auth-gated operations state API, compact operations dashboard widgets, enriched terminal heartbeat metadata, local repo/sprint sync script, and secure bearer-auth import endpoint.
- Added non-destructive import indexes for live project `owner_id + name` and task `source + source_ref` upserts.

### Changed
- The dashboard now reuses the operations aggregate for the existing project summary section and renders project state, task queues, terminal presence, blockers, and responsibility below it.
- `scripts/overlord-push.ps1` now accepts optional assignee/source/branch/command/cwd metadata without breaking the previous positional argument order.

### Planned
- Added `DOCS/superpowers/plans/2026-05-19-helm-state-aggregator.md`, a phased implementation plan for populating Helm with all project states, live terminals, working/finished/pending/blocked tasks, and responsibility.

### Fixed
- Google OAuth callback failure after Google token exchange. Vercel runtime log showed Neon returning 400 during `/api/auth/callback/google`; root cause was `DrizzleAdapter(getDb())` using default Auth.js table names (`user`, `account`, `session`, `verificationToken`) while Helm's schema uses `users`, `accounts`, `sessions`, and `verification_tokens`.
- Updated `lib/auth.ts` to pass Helm's Drizzle auth tables explicitly into `DrizzleAdapter`.

### Verified
- State Aggregator branch checks passed: `corepack pnpm typecheck`, `corepack pnpm lint`, `git diff --check`, and `corepack pnpm build`.
- `corepack pnpm db:migrate` applied the state aggregator/import migrations successfully against Neon from the Codex worktree.
- `POST /api/operations/import` invalid bearer auth returned `401 {"error":"Unauthorized"}` in local dev verification.
- Production heartbeat push returned `200 {"ok":true}` through Node fetch for terminal `codex-helm-state-aggregator`; PowerShell/curl attempts hit Windows TLS client errors before reaching Vercel.
- Operability smoke passed from Codex: `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build`.
- Local dev-server probes passed: `/login` returned 200; `/` and `/api/overlord/state` returned expected auth redirects.
- Neon read-only checks passed: `select 1` returned `ok: 1`, and `terminal_snapshots` exists.
- Overlord push endpoint rejected invalid bearer auth with 401 and accepted `scripts/overlord-push.ps1` with valid env, inserting `codex-smoke-20260519`.
- Post-fix checks passed: `corepack pnpm typecheck` and `corepack pnpm lint`.
- Graphify AST graph refresh passed after the code change: 157 nodes, 180 edges, 56 communities.
- Pushed `master` to GitHub through commit `61aec2f`, and Vercel created production deployment `dpl_FNKyewXuws7jbKL65buWCQnrr1tF`.
- Production alias `https://helm-dashboard-ten.vercel.app` now points at `https://helm-dashboard-jqaqvshxe-orishavitas-projects.vercel.app`.
- Post-deploy HTTP smoke via Node fetch passed: `/login` returned 200 and `/api/auth/providers` returned the Google provider with callback URL `https://helm-dashboard-ten.vercel.app/api/auth/callback/google`.

### Remaining
- Authenticated browser flow still needs manual/interactive Google OAuth verification before the sprint can be marked fully done.
- Interactive browser Google OAuth completion still needs a signed-in browser test after the production deploy.
- Local `corepack pnpm build` timed out twice before compilation output in the 2026-05-19 follow-up session; typecheck and lint passed.

## 2026-05-18

### Fixed
- `POST /api/overlord/push` no longer calls `parseEnv()` (which requires all 14 env vars including unrelated Google/GitHub/Auth vars). Now calls `parseOverlordPushEnv()` which only requires `DATABASE_URL` + `OVERLORD_PUSH_SECRET`. This makes the push endpoint usable in partial-env contexts (agent terminals, CI) without a full app env.

### Added
- `parseOverlordPushEnv()` in `lib/env.ts` — scoped Zod schema for push-only env validation
- `CLAUDE.md` — root-level project context file for Claude/Legion sessions
- `CHANGELOG.md` — this file
- `TODO.md` — task tracking for next session
- Session handoff doc in `.codex/state/HANDOFF.md`

### Changed
- `.codex/state/LAST_RUN.md` — updated to reflect env-split fix and session close
- `.codex/state/TASK_STATE.md` — updated current task and blocked status

---

## 2026-05-18 (earlier — Codex session)

### Added
- Dashboard widget architecture: `components/dashboard/dashboard-layout.tsx`, `components/dashboard/dashboard-widget.tsx`
- Widget registry with IDs: `run-snapshot`, `integration-health`, `overlord`, `projects`, `command-deck`, `global-todos`
- Helm UI primitives: `components/ui/card.tsx`, `components/ui/chip.tsx`, `components/ui/input.tsx`
- Product progress model: `lib/product-progress.ts`, `components/product-progress.tsx`
- Stages: `Kickstart → Concept → Architecture → Build → Deployment → Validation → Operate`
- Maturity states: `Internal → Alpha → Beta → MVP → Full Release`
- Sprint task-state counts and computed progress fields in `lib/data/projects.ts`
- CSS design tokens in `app/globals.css` (adapted from concept preview)
- Graphify rebuild: 156 nodes, 178 edges, 56 communities

### Changed
- `components/project-card.tsx` — renders stage, maturity, percent, missing/blocking signals
- `app/(app)/page.tsx` — renders code-configurable widget grid

---

## 2026-05-14 (Codex session)

### Added
- `concept-preview.html` — standalone static HTML/CSS/JS preview of Helm dashboard concept
- Graphify rebuild: 136 nodes, 157 edges, 51 communities

---

## 2026-05-06 (Codex session)

### Added
- Overlord Monitor feature: DB schema, migration, env contract, view models, data query, push/state API routes, dashboard UI, push script
- `lib/db/overlord-schema.ts` — `terminal_snapshots` table
- `lib/db/enums.ts` — `terminalStatus` enum
- `drizzle/0001_overlord.sql` — scoped Overlord migration
- `app/api/overlord/push/route.ts` — heartbeat POST with bearer auth
- `app/api/overlord/state/route.ts` — authenticated GET
- `components/overlord-panel.tsx` — React Query polling panel
- `components/overlord-terminal-card.tsx` — terminal status card
- `scripts/overlord-push.ps1` — PowerShell push script
- `graphify-out/` — knowledge graph
- `AGENTS.md` — Graphify guidance for Codex
- `.codex/hooks.json` — Graphify Codex hook

### Changed
- `lib/env.ts` — added `OVERLORD_PUSH_SECRET`
- `lib/view-models.ts` — added `TerminalSnapshot`, `OverlordState`
- `lib/db/schema.ts` — re-exports overlord schema
