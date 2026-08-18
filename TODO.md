# TODO — Helm Dashboard

## v2 MVP: Helm AI Cockpit (Sprints 03–06)

> Full spec: `DOCS/superpowers/specs/2026-05-25-helm-v2-mvp-design.md`
> Status: Sprints 03–05 ✅ complete + verified (commit `0eb0483`, 2026-05-26). Sprint 06 is next.

### Smoke test required (Shepard-Commander)
- [ ] `corepack pnpm dev:helm` → `/terminal` (Sprint 03 — PowerShell session) (unauthenticated redirect confirmed 2026-08-13 — DOCS/2026-08-13-smoke-retest-report.md; authenticated content still pending Shepard-Commander live login)
- [ ] `/agents` → submit prompt, watch SSE stream (Sprint 04) (blocked: drizzle 0005 not applied to Neon — confirmed via live query 2026-08-18, no agent_sessions table exists; gated, queued for Shepard to run corepack pnpm db:migrate)
- [ ] `/vault` → browse notes from `C:\Users\OriShavit\Documents\legion-vault` (Sprint 05) (unauthenticated redirect confirmed 2026-08-13 — DOCS/2026-08-13-smoke-retest-report.md; authenticated content still pending Shepard-Commander live login)
- [ ] `/graph` → force-graph renders vault links (Sprint 05) (unauthenticated redirect confirmed 2026-08-13 — DOCS/2026-08-13-smoke-retest-report.md; authenticated content still pending Shepard-Commander live login)

### Sprint 03 — Local Runtime & Terminal Embedding ✅ Verified (2026-05-26)
- [x] `server.mjs` custom server (HTTP + WS upgrade, Next handler) — claude ✅
- [x] `HELM_PROFILE` env var + `parseLocalProfileEnv()` — claude ✅
- [x] Conditional nav rendering for local-only routes — claude ✅
- [x] `node-pty` install + Windows ConPTY build verification — codex ✅
- [x] `lib/terminal/pty-pool.ts` (max 4 sessions, idle timeout) — codex ✅
- [x] `lib/terminal/ws-handler.ts` (WS upgrade handler) — codex ✅
- [x] `components/terminal/xterm-pane.tsx` (react-xtermjs + addons) — claude ✅ (fixed SSR + binaryType)
- [x] `components/terminal/terminal-loader.tsx` (client wrapper for Turbopack ssr:false) — claude ✅
- [x] `app/(app)/terminal/page.tsx` — claude ✅ (uses TerminalLoader; SSR-safe)
- [x] `pnpm dev:helm` script in `package.json` — codex ✅
- [x] `pnpm start:helm` script in `package.json` — codex ✅
- [ ] `DOCS/local-runtime.md` — claude (deferred to Sprint 06 polish)

### Sprint 04 — Claude Code Agent Runner ✅ Verified (2026-05-26)
- [x] Drizzle migration `0005_agent_sessions.sql` + schema written (file exists, NOT yet applied to Neon — see below) — claude ✅
- [x] `lib/agents/claude-runner.ts` (uses `@anthropic-ai/sdk` streaming) — claude ✅
- [x] `lib/agents/session-controllers.ts` (globalThis singleton AbortController map) — claude ✅
- [x] `app/api/agents/sessions/route.ts` (POST create, GET list) — claude ✅
- [x] `app/api/agents/stream/[id]/route.ts` (SSE endpoint) — claude ✅
- [x] `app/api/agents/stop/[id]/route.ts` (AbortController) — claude ✅
- [x] `components/agents/agent-runner.tsx` (prompt + model picker + stop) — claude ✅
- [x] `components/agents/agent-event-stream.tsx` (SSE consumer) — claude ✅
- [x] `app/(app)/agents/page.tsx` (session list + live stream) — claude ✅
- [ ] `drizzle/0005_agent_sessions.sql` applied to Neon — NOT applied; live query 2026-08-18 confirms no agent_sessions table and migration hash absent from drizzle.__drizzle_migrations. Gated for Shepard: corepack pnpm db:migrate.
- [ ] Session resume button using stored `session_id` — deferred to Sprint 06
- [ ] `lib/agents/permission-policy.ts` (UI mode → permissionMode) — deferred to Sprint 06

### Sprint 05 — Vault Integration & Knowledge Graph ✅ Verified (2026-05-26)
- [x] `lib/vault/obsidian-rest.ts` typed REST client — claude ✅
- [x] `lib/vault/vault-fs.ts` direct fs fallback (path traversal guard) — claude ✅
- [x] `lib/vault/graph-builder.ts` (wikilink → nodes+edges, edge deduplication) — claude ✅
- [x] `app/api/vault/tree/route.ts` — claude ✅
- [x] `app/api/vault/note/[...path]/route.ts` — claude ✅
- [x] `app/api/vault/search/route.ts` — claude ✅
- [x] `app/api/vault/graph/route.ts` — claude ✅
- [x] `components/vault/vault-tree.tsx` (collapsible tree) — claude ✅
- [x] `components/vault/note-viewer.tsx` (markdown + wikilinks + XSS guard) — claude ✅
- [x] `app/(app)/vault/page.tsx` (tree | viewer | search, useSearchParams Suspense-wrapped) — claude ✅
- [x] `components/graph/knowledge-graph.tsx` (react-force-graph-2d, dynamic SSR-off) — claude ✅
- [x] `app/(app)/graph/page.tsx` (responsive canvas, node count stats) — claude ✅
- [x] Node-click → navigate to `/vault?note=...` — claude ✅

### Sprint 06 — Cloud Snapshots, Cost Tracking & Polish
- [ ] Drizzle migration `0006_vault_snapshots.sql` — codex
- [ ] `scripts/snapshot-vault.ps1` — codex
- [ ] Cloud profile reads `vault_snapshots` for vault+graph — codex
- [ ] Cost/token display on agent session cards — claude
- [ ] Capture tokens_in/out/cost from SDK, persist on completion — claude
- [ ] Terminal log persistence to `agent_events` — codex
- [ ] Terminal log viewer on agent session detail — claude
- [ ] Agent "watch mode" → appends to today's vault daily note — codex
- [ ] Graph community coloring (from graphify-out structure) — claude
- [ ] Final polish: empty states, error toasts, loading skeletons — claude
- [ ] `DOCS/local-runtime.md` — claude

---

## Sprint 02: GitHub Project Tracking and Live Terminal Presence

- [x] Add cached GitHub open PR endpoint
- [x] Add cached GitHub recent commits endpoint
- [x] Store recent commits in `github_repo_snapshots`
- [x] Render GitHub status, errors, empty states, PRs, and commits on project cards/detail
- [x] Derive terminal `offline` after 10 minutes without changing the heartbeat protocol
- [x] Group terminal presence by repo and assignee in operations
- [x] Extend local sync with repo branch/commit/dirty state and task source notes
- [x] Apply `drizzle/0004_github_recent_commits.sql`
- [x] Verify typecheck, lint, build, focused tests, import smoke, and Graphify refresh
- [ ] Authenticated browser visual check for `/` and `/projects/[id]`

## State Aggregator

- [x] Review `DOCS/superpowers/plans/2026-05-19-helm-state-aggregator.md`
- [x] Implement ownership/source fields for tasks
- [x] Implement global operations state query and API
- [x] Add operations widgets for projects, terminals, tasks, blockers, and responsibility
- [x] Add local sync/import path for configured repos and sprint files
- [x] Add secure `POST /api/operations/import` endpoint with bearer auth and non-destructive upserts
- [x] Add `OPERATIONS_IMPORT_SECRET` to Vercel Production env, then redeploy or promote the latest commit
- [x] Production browser verification: authenticated dashboard renders operations widgets after Vercel deployment

## Sprint 01: Overlord Monitor

### Runtime verified

- [x] Create `.env.local` — required values:
  ```
  DATABASE_URL=<neon-pooled-url>
  DATABASE_URL_UNPOOLED=<neon-direct-url>
  AUTH_SECRET=<32+ char secret>
  AUTH_URL=http://localhost:3000
  GOOGLE_CLIENT_ID=<google-oauth>
  GOOGLE_CLIENT_SECRET=<google-oauth>
  GITHUB_APP_ID=<id>
  GITHUB_APP_PRIVATE_KEY=<pem>
  GITHUB_APP_CLIENT_ID=<id>
  GITHUB_APP_CLIENT_SECRET=<secret>
  GITHUB_APP_SLUG=<slug>
  ENCRYPTION_KEY=<32+ char key>
  OVERLORD_PUSH_SECRET=<16+ char secret>
  OVERLORD_BASE_URL=http://localhost:3000
  ```
- [x] Run `corepack pnpm db:migrate` — Codex applied state aggregator/import migrations on 2026-05-19
- [x] Run `scripts/overlord-push.ps1` with real env — 2026-05-19 Codex smoke push returned `{"ok":true}` and inserted `codex-smoke-20260519`
- [x] Confirm `terminal_snapshots` table exists in Neon

### Ready to do (env unblocked)

- [x] Deploy the `lib/auth.ts` Auth.js Drizzle adapter table-mapping fix to Vercel production — commit `61aec2f`, deployment `dpl_FNKyewXuws7jbKL65buWCQnrr1tF`
- [x] Test full browser login flow (Google OAuth → dashboard)
- [x] Verify `GET /api/overlord/state` returns data after push from an authenticated browser session
- [x] Verify polling interval works (2-minute auto-refresh in `overlord-panel.tsx`)
- [x] Mark sprint done: update `DOCS/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md`

### Code quality (non-blocking)

- [x] Run `corepack pnpm typecheck` + `corepack pnpm lint` after Auth.js adapter fix — passed 2026-05-19
- [x] Re-run `corepack pnpm build` — passed from Codex state-aggregator worktree on 2026-05-19
- [ ] Resolve Windows path casing warning (Documents vs documents) — low priority

## Done ✅

- [x] DB schema + Drizzle foundation
- [x] Auth.js (Google) integration
- [x] Overlord DB schema (`terminal_snapshots`, `terminal_status` enum)
- [x] `drizzle/0001_overlord.sql` scoped migration
- [x] `POST /api/overlord/push` with bearer auth
- [x] `GET /api/overlord/state` with `requireUser()`
- [x] `<OverlordPanel />` + `<OverlordTerminalCard />` UI
- [x] Dashboard widget registry architecture (`dashboard-layout.tsx`, `dashboard-widget.tsx`)
- [x] Product progress TypeScript model (stages + maturity)
- [x] Project cards with stage, maturity, percent, missing signals
- [x] `scripts/overlord-push.ps1` push script
- [x] `concept-preview.html` static preview
- [x] Helm UI primitives: Card, Chip, Input
- [x] CSS design tokens in `app/globals.css`
- [x] Graphify: `graphify-out/`, `AGENTS.md`, `.codex/hooks.json`
- [x] Fix Overlord push env over-validation (`parseOverlordPushEnv()`)
- [x] All static checks: typecheck ✅ lint ✅ build ✅
- [x] 2026-05-19 operability smoke: `/login` 200, protected routes 307, DB `select 1`, Overlord table present, invalid push 401, valid push 200
- [x] 2026-05-19 OAuth deployment config triage: Google app is External/Testing with test users; Vercel env had whitespace and was missing `AUTH_TRUST_HOST=true`
- [x] 2026-05-19 Google callback root cause: Auth.js `DrizzleAdapter` was defaulting to `user`/`account`/`session` tables; fixed `lib/auth.ts` to map Helm's `users`/`accounts`/`sessions`/`verification_tokens` tables explicitly
- [x] 2026-05-19 State Aggregator implementation: ownership/source task fields, operations state API, dashboard widgets, terminal metadata, local sync script, secure import endpoint, import indexes, Graphify refreshes, and Neon migration
- [x] 2026-05-26 Sprints 03–05: embedded terminal, Claude agent runner, Obsidian vault browser, knowledge graph — typecheck ✅ lint ✅ build ✅ migrate ✅ committed `0eb0483`
