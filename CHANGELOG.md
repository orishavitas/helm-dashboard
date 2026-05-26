# Changelog — Helm Dashboard

## 2026-05-26 (session 2 — Sprint 03 fixes + Sprint 04 + Sprint 05)

### Fixed (Sprint 03 gaps)
- Fixed `lib/terminal/server-runtime.mjs` lines 24+29: `WebSocket.OPEN` (browser global) → `1` (the constant value). Node.js `ws` library exposes the constant directly on the socket; the undefined global caused a crash on first PTY connection.
- Fixed `app/(app)/terminal/page.tsx`: replaced static `import { XtermPane }` with `next/dynamic(() => ..., { ssr: false })`. xterm.js accesses `document` at module load, which crashes Next.js SSR.
- Fixed `components/terminal/xterm-pane.tsx`: added `socket.binaryType = "arraybuffer"` after WebSocket construction. `@xterm/addon-attach`'s AttachAddon expects binary frames.

### Added (Sprint 04 — Claude Code Agent Runner)
- Added `lib/db/agent-schema.ts`: `agent_sessions` + `agent_events` tables with enums (`agent_session_status`, `agent_event_type`).
- Added `drizzle/0005_agent_sessions.sql` migration + journal entry.
- Added `lib/data/agents.ts`: `createAgentSession`, `getAgentSession`, `listAgentSessions`, `updateAgentSession`, `appendAgentEvent`, `getAgentEvents`.
- Added `lib/agents/claude-runner.ts`: streaming async generator wrapping `@anthropic-ai/sdk` Messages API. Yields `text`, `tool_use`, `tool_result`, `usage`, `error`, `done` events.
- Added `lib/agents/session-controllers.ts`: singleton map of `sessionId → AbortController` shared between stream and stop routes.
- Added `app/api/agents/sessions/route.ts`: GET (list) + POST (create, requires `HELM_PROFILE=local` + `ANTHROPIC_API_KEY`).
- Added `app/api/agents/stream/[id]/route.ts`: SSE streaming endpoint; consumes runner generator, forwards as `text/event-stream`, persists events to DB.
- Added `app/api/agents/stop/[id]/route.ts`: POST to abort in-flight session via shared AbortController.
- Added `components/agents/agent-event-stream.tsx`: EventSource consumer; renders text, tool_use, error events with auto-scroll.
- Added `components/agents/agent-runner.tsx`: prompt textarea + model picker (Haiku/Sonnet/Opus) + run/stop buttons.
- Added `app/(app)/agents/page.tsx`: local-profile-gated runner page with API key status badge + recent sessions list.
- Added `@anthropic-ai/sdk ^0.51.0` to `package.json` (run `corepack pnpm install`).

### Added (Sprint 05 — Vault Browser & Knowledge Graph)
- Added `lib/vault/obsidian-rest.ts`: typed `ObsidianRestClient` class + `getObsidianClient()` singleton for `obsidian-local-rest-api`.
- Added `lib/vault/vault-fs.ts`: direct filesystem fallback (`readVaultTree`, `readVaultNote`, `searchVaultNotes`). Path traversal guard included.
- Added `lib/vault/graph-builder.ts`: `buildGraph()` — parses `[[wikilinks]]` + `#tags` from vault notes, returns `{ nodes, edges }` with `inDegree`/`outDegree`.
- Added `app/api/vault/tree/route.ts`: returns file tree (REST API → fs fallback).
- Added `app/api/vault/note/[...path]/route.ts`: returns raw markdown content (REST API → fs fallback).
- Added `app/api/vault/search/route.ts`: full-text search proxy (REST API → fs grep fallback).
- Added `app/api/vault/graph/route.ts`: walks vault, builds graph, returns JSON for react-force-graph-2d.
- Added `components/vault/vault-tree.tsx`: collapsible tree with directory expand/collapse, file selection highlight.
- Added `components/vault/note-viewer.tsx`: `react-markdown` + `remark-gfm` renderer with `[[wikilink]]` pre-processing → clickable wikilink buttons.
- Added `components/graph/knowledge-graph.tsx`: `react-force-graph-2d` canvas with node coloring by tag category (project/session/agent/default), label rendering at zoom > 1.8.
- Added `app/(app)/vault/page.tsx`: 3-pane layout (tree/search results | note viewer | header search bar). `?note=` query param supported for graph node-click navigation. Wrapped in `Suspense` for `useSearchParams`.
- Added `app/(app)/graph/page.tsx`: full-viewport force graph with `ResizeObserver`-driven canvas dimensions. Node click → `router.push(/vault?note=...)`.
- Extended `components/app-shell.tsx` sidebar + mobile header: added Agent (Bot icon), Vault (BookOpen icon), Graph (Share2 icon) nav links — visible in local profile only.
- Added `react-force-graph-2d ^1.26.3`, `react-markdown ^9.0.1`, `remark-gfm ^4.0.0` to `package.json`.
- Added `transpilePackages` in `next.config.ts` for `react-force-graph-2d` and its CJS dependencies.

### Verified (Sprint 03 terminal backend — Codex, session 1)
- `node-pty` installed with the Windows ConPTY prebuild and imported successfully.
- `corepack pnpm exec tsc -p tsconfig.test.json` passed.
- `node --test .tmp\test-dist\tests\*.test.js` passed: 10/10.
- `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build` passed.
- Graphify refreshed: 231 nodes, 300 edges, 63 communities.

### Action required (Shepard-Commander)
1. `corepack pnpm install` — installs `@anthropic-ai/sdk`, `react-force-graph-2d`, `react-markdown`, `remark-gfm`.
2. `corepack pnpm db:migrate` — applies `drizzle/0005_agent_sessions.sql` to Neon.
3. `corepack pnpm dev:helm` — start local server, then visit:
   - `/terminal` → PowerShell session (smoke test Sprint 03)
   - `/agents` → submit a prompt, watch SSE stream (smoke test Sprint 04)
   - `/vault` → browse legion-vault notes (smoke test Sprint 05)
   - `/graph` → see force graph of vault links (smoke test Sprint 05)

## 2026-05-20

### Added
- Added Sprint 02 GitHub drill-downs for cached open pull requests and recent commits.
- Added `recent_commits` to `github_repo_snapshots` with migration `drizzle/0004_github_recent_commits.sql`.
- Added terminal presence helpers and focused tests for 60-second GitHub snapshot staleness plus 10-minute heartbeat offline derivation.

### Changed
- Project cards and project detail now render GitHub status, error, empty, PR, and commit states from the same cached snapshot.
- Operations terminal presence is grouped by repo and assignee with current task, role/status, and recent heartbeat history.
- `scripts/helm-sync-local.ps1` now includes branch/commit/dirty repo state in imported project descriptions and source-line notes on imported tasks.
- `corepack pnpm build` now uses `next build --turbopack`; the standard webpack build path hangs before compilation in this environment, while Turbopack completed cleanly.

### Verified
- Focused Node tests passed: 5/5.
- `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build` passed.
- `corepack pnpm db:migrate` applied the recent-commits migration successfully.
- Turbopack dev smoke confirmed protected GitHub/operations/overlord endpoints redirect unauthenticated, invalid import bearer returns 401, and the example local import returns 200.
- Graphify refreshed: 214 nodes, 281 edges, 61 communities. Known `.codex/hooks.json` permission warning remains after graph rebuild.

### Remaining
- Authenticated browser visual verification for `/` and `/projects/[id]` still needs a signed-in session.

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
- Pushed `master` to GitHub through commit `fdb8b8c`; production alias `https://helm-dashboard-ten.vercel.app` serves the updated app.
- Post-push production HTTP smoke passed for `/login` (200), `/api/auth/providers` (200), and protected `/api/operations/state` redirecting to `/login` (307).
- Production `POST /api/operations/import` currently returns 500 because Vercel Production is missing `OPERATIONS_IMPORT_SECRET`; Vercel CLI auth is invalid in this shell, so the env var could not be added from Codex.
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
