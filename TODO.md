# TODO â€” Helm Dashboard

## v2 MVP: Helm AI Cockpit (Sprints 03â€“06)

> Full spec: `DOCS/superpowers/specs/2026-05-25-helm-v2-mvp-design.md`
> Status: Sprint 03 in progress; Codex-owned terminal backend/package slice complete

### Pre-Sprint-03 Checklist (Shepard-Commander action required)
- [ ] Confirm vault path: `C:\Users\OriShavit\Documents\legion-vault`
- [ ] Install `obsidian-local-rest-api` plugin + share `OBSIDIAN_REST_API_KEY`
- [ ] Confirm `ANTHROPIC_API_KEY` available
- [ ] Confirm local port `3001` acceptable
- [ ] Sign off on this spec â†’ triggers Sprint 03 kickoff

### Sprint 03 â€” Local Runtime & Terminal Embedding ✅ Code complete (2026-05-26)
- [x] `server.mjs` custom server (HTTP + WS upgrade, Next handler) â€” claude ✅
- [x] `HELM_PROFILE` env var + `parseLocalProfileEnv()` â€” claude ✅
- [x] Conditional nav rendering for local-only routes â€” claude ✅
- [x] `node-pty` install + Windows ConPTY build verification â€” codex ✅
- [x] `lib/terminal/pty-pool.ts` (max 4 sessions, idle timeout) â€” codex ✅
- [x] `lib/terminal/ws-handler.ts` (WS upgrade handler) â€” codex ✅
- [x] `components/terminal/xterm-pane.tsx` (react-xtermjs + addons) â€” claude ✅ (fixed SSR + binaryType)
- [x] `app/(app)/terminal/page.tsx` â€” claude ✅ (dynamic import with ssr:false)
- [x] `pnpm dev:helm` script in `package.json` â€” codex ✅
- [x] `pnpm start:helm` script in `package.json` â€” codex ✅
- [ ] `DOCS/local-runtime.md` â€” claude (deferred to Sprint 06 polish)

Codex note 2026-05-26: `corepack pnpm dev:helm` is blocked until Claude-owned `server.mjs` exists.

### Sprint 04 â€” Claude Code Agent Runner ✅ Code complete (2026-05-26)
- [x] Drizzle migration `0005_agent_sessions.sql` + schema â€” claude ✅
- [x] `lib/agents/claude-runner.ts` (uses `@anthropic-ai/sdk` streaming) â€” claude ✅
- [x] `lib/agents/session-controllers.ts` (singleton AbortController map) â€” claude ✅
- [x] `app/api/agents/sessions/route.ts` (POST create, GET list) â€” claude ✅
- [x] `app/api/agents/stream/[id]/route.ts` (SSE endpoint) â€” claude ✅
- [x] `app/api/agents/stop/[id]/route.ts` (AbortController) â€” claude ✅
- [x] `components/agents/agent-runner.tsx` (prompt + model picker + stop) â€” claude ✅
- [x] `components/agents/agent-event-stream.tsx` (SSE consumer) â€” claude ✅
- [x] `app/(app)/agents/page.tsx` (session list + live stream) â€” claude ✅
- [ ] Session resume button using stored `session_id` â€” deferred to Sprint 06
- [ ] `lib/agents/permission-policy.ts` (UI mode â†’ permissionMode) â€” deferred to Sprint 06
- **Needs:** `corepack pnpm install` (adds `@anthropic-ai/sdk ^0.51.0`)

### Sprint 05 â€” Vault Integration & Knowledge Graph ✅ Code complete (2026-05-26)
- [x] `lib/vault/obsidian-rest.ts` typed REST client â€” claude ✅
- [x] `lib/vault/vault-fs.ts` direct fs fallback â€” claude ✅
- [x] `lib/vault/graph-builder.ts` (wikilink â†’ nodes+edges) â€” claude ✅
- [x] `app/api/vault/tree/route.ts` â€” claude ✅
- [x] `app/api/vault/note/[...path]/route.ts` â€” claude ✅
- [x] `app/api/vault/search/route.ts` â€” claude ✅
- [x] `app/api/vault/graph/route.ts` â€” claude ✅
- [x] `components/vault/vault-tree.tsx` (collapsible tree) â€” claude ✅
- [x] `components/vault/note-viewer.tsx` (markdown + wikilinks) â€” claude ✅
- [x] `app/(app)/vault/page.tsx` (tree | viewer | search, useSearchParams Suspense-wrapped) â€” claude ✅
- [x] `components/graph/knowledge-graph.tsx` (react-force-graph-2d, dynamic SSR-off) â€” claude ✅
- [x] `app/(app)/graph/page.tsx` (responsive canvas, node count stats) â€” claude ✅
- [x] Node-click â†’ navigate to `/vault?note=...` â€” claude ✅
- **Needs:** `corepack pnpm install` (adds `react-force-graph-2d`, `react-markdown`, `remark-gfm`)

### Sprint 06 â€” Cloud Snapshots, Cost Tracking & Polish
- [ ] Drizzle migration `0006_vault_snapshots.sql` â€” codex
- [ ] `scripts/snapshot-vault.ps1` â€” codex
- [ ] Cloud profile reads `vault_snapshots` for vault+graph â€” codex
- [ ] Cost/token display on agent session cards â€” claude
- [ ] Capture tokens_in/out/cost from SDK, persist on completion â€” claude
- [ ] Terminal log persistence to `agent_events` â€” codex
- [ ] Terminal log viewer on agent session detail â€” claude
- [ ] Agent "watch mode" â†’ appends to today's vault daily note â€” codex
- [ ] Graph community coloring (from graphify-out structure) â€” claude
- [ ] Final polish: empty states, error toasts, loading skeletons â€” claude

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

- [x] Create `.env.local` â€” required values:
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
- [x] Run `corepack pnpm db:migrate` - Codex applied state aggregator/import migrations on 2026-05-19
- [x] Run `scripts/overlord-push.ps1` with real env â€” 2026-05-19 Codex smoke push returned `{"ok":true}` and inserted `codex-smoke-20260519`
- [x] Confirm `terminal_snapshots` table exists in Neon

### Ready to do (env unblocked)

- [x] Deploy the `lib/auth.ts` Auth.js Drizzle adapter table-mapping fix to Vercel production â€” commit `61aec2f`, deployment `dpl_FNKyewXuws7jbKL65buWCQnrr1tF`
- [x] Test full browser login flow (Google OAuth â†’ dashboard)
- [x] Verify `GET /api/overlord/state` returns data after push from an authenticated browser session
- [x] Verify polling interval works (2-minute auto-refresh in `overlord-panel.tsx`)
- [x] Mark sprint done: update `DOCS/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md`

### Code quality (non-blocking)

- [x] Run `corepack pnpm typecheck` + `corepack pnpm lint` after Auth.js adapter fix â€” passed 2026-05-19
- [x] Re-run `corepack pnpm build` - passed from Codex state-aggregator worktree on 2026-05-19
- [ ] Resolve Windows path casing warning (Documents vs documents) â€” low priority

## Done âœ…

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
- [x] All static checks: typecheck âœ… lint âœ… build âœ…
- [x] 2026-05-19 operability smoke: `/login` 200, protected routes 307, DB `select 1`, Overlord table present, invalid push 401, valid push 200
- [x] 2026-05-19 OAuth deployment config triage: Google app is External/Testing with test users; Vercel env had whitespace and was missing `AUTH_TRUST_HOST=true`
- [x] 2026-05-19 Google callback root cause: Auth.js `DrizzleAdapter` was defaulting to `user`/`account`/`session` tables; fixed `lib/auth.ts` to map Helm's `users`/`accounts`/`sessions`/`verification_tokens` tables explicitly
- [x] 2026-05-19 State Aggregator implementation: ownership/source task fields, operations state API, dashboard widgets, terminal metadata, local sync script, secure import endpoint, import indexes, Graphify refreshes, and Neon migration
