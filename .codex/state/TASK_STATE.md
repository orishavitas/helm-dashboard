# Task State - Helm Dashboard

**Repo:** https://github.com/orishavitas/helm-dashboard
**Sprint:** Sprints 03–06 (v2 MVP — AI Cockpit)
**Spec:** DOCS/superpowers/specs/2026-05-25-helm-v2-mvp-design.md
**Current task:** Sprint 03 — Local Runtime & Terminal Embedding
**Written by:** Legion (Claude) 2026-05-26; Codex update 2026-05-26
**Updated:** 2026-05-26T10:00:52+03:00

---

## Context

Sprints 01, 02, and the State Aggregator are all complete and verified. The project is now entering v2 (AI Cockpit) — a major expansion adding an embedded terminal, Claude Code agent runner, Obsidian vault browser, and live knowledge graph. Full spec is at `DOCS/superpowers/specs/2026-05-25-helm-v2-mvp-design.md`.

Production is live at https://helm-dashboard-ten.vercel.app and must remain working throughout v2 work. All new local-only features gate on `HELM_PROFILE=local`.

**Key change:** `.env.local` now has v2 keys filled in by Shepard-Commander:
- `HELM_PROFILE=local`
- `ANTHROPIC_API_KEY` — set ✅
- `OBSIDIAN_REST_API_KEY` — set ✅
- `OBSIDIAN_VAULT_PATH=C:\Users\OriShavit\Documents\legion-vault`
- `OBSIDIAN_REST_API_URL=http://127.0.0.1:27123`
- `TERMINAL_SHELL=powershell.exe`
- `TERMINAL_CWD=C:\Users\OriShavit\Documents\GitHub`

---

## Objective

Implement Sprint 03: add a custom Node.js server (`server.mjs`) that handles both HTTP (via Next.js) and WebSocket (`/ws/terminal/:sessionId`), add `HELM_PROFILE` gating, and embed a working PowerShell terminal in the dashboard using `xterm.js` + `node-pty`.

---

## Sprint 03 Tasks (Codex-owned, owner_runtime: codex)

The following tasks are assigned to Codex. Claude-owned tasks are listed separately below for coordination awareness.

### Codex tasks — Sprint 03

- [x] Install `node-pty`, `ws`, `react-xtermjs`, `@xterm/xterm`, `@xterm/addon-attach`, `@xterm/addon-fit` via `corepack pnpm add`
- [x] Verify `node-pty` Windows ConPTY build succeeds (`node-pty` must compile native module). Prebuild imported successfully; no rebuild helper needed.
- [x] Build `lib/terminal/pty-pool.ts` — manages up to 4 PTY sessions, idle timeout 5 min, maps `sessionId → ptyProcess`
- [x] Build `lib/terminal/ws-handler.ts` — WebSocket upgrade handler; spawns PTY from pool on connect, relays IO, handles resize messages, kills PTY on close
- [x] Add `pnpm dev:helm` script to `package.json` that runs the Helm server in dev mode (sets `NODE_ENV=development`)
- [x] Add `pnpm start:helm` script to `package.json` for production local mode

### Claude tasks — Sprint 03 (DO NOT duplicate)

- [ ] Author `server.mjs` — HTTP + WS upgrade handler, mounts Next.js request handler, registers ws-handler on `/ws/terminal/:sessionId`, binds to `HELM_LOCAL_PORT` (default 3001)
- [ ] Add `HELM_PROFILE` env var + `parseLocalProfileEnv()` to `lib/env.ts`
- [ ] Conditional nav rendering: hide `/terminal`, `/agents`, `/vault`, `/graph` when `HELM_PROFILE !== 'local'`
- [ ] Build `components/terminal/xterm-pane.tsx` using `react-xtermjs` + `@xterm/addon-attach` + `@xterm/addon-fit`, dynamic import (no SSR)
- [ ] Build `app/(app)/terminal/page.tsx` with tab bar (max 4 tabs)
- [ ] Write `DOCS/local-runtime.md`

---

## Sprint 04 Tasks (queued — start after Sprint 03 acceptance criteria pass)

### Codex tasks — Sprint 04

- [ ] Install `@anthropic-ai/claude-agent-sdk` via `corepack pnpm add`
- [ ] Build `lib/agents/claude-runner.ts` — wraps `query()` from SDK, yields agent events, accepts `cwd`, `prompt`, `permissionMode`, `sessionId` (for resume)
- [ ] Build `lib/agents/permission-policy.ts` — maps UI mode string (`'plan'|'acceptEdits'|'bypass'`) to SDK `permissionMode`
- [ ] Build `lib/agents/session-store.ts` — DB read/write for `agent_sessions` rows; `createSession()`, `updateStatus()`, `getSession()`, `listSessions(userId)`
- [ ] Persist every agent event to `agent_events` table inside the runner loop (tool_use, tool_result, text, error)
- [ ] Add session resume button logic: re-instantiate `query()` with stored `session_id`

### Claude tasks — Sprint 04 (DO NOT duplicate)

- [ ] Drizzle schema `lib/db/agent-schema.ts` + migration `drizzle/0005_agent_sessions.sql`
- [ ] `app/api/agents/sessions/route.ts` (POST create, GET list)
- [ ] `app/api/agents/stream/[id]/route.ts` — SSE endpoint, streams agent events from runner
- [ ] `app/api/agents/stop/[id]/route.ts` — sets AbortController signal on active runner
- [ ] `components/agents/agent-runner.tsx` — prompt textarea, repo path input, mode dropdown
- [ ] `components/agents/agent-event-stream.tsx` — EventSource consumer, renders tool_use/text/result cards
- [ ] `app/(app)/agents/page.tsx` — session list (left rail) + active stream (main)

---

## Sprint 05 Tasks (queued — start after Sprint 03)

### Codex tasks — Sprint 05

- [ ] Build `lib/vault/obsidian-rest.ts` — typed REST client for `obsidian-local-rest-api`; methods: `getFile(path)`, `listFiles()`, `search(query)`, `getDailyNote()`; uses `OBSIDIAN_REST_API_URL` + `OBSIDIAN_REST_API_KEY` Bearer header
- [ ] Build `lib/vault/vault-fs.ts` — direct `fs` fallback; `readNote(path)`, `listNotes(subdir)` using `OBSIDIAN_VAULT_PATH`; used when REST API returns 503
- [ ] Build `lib/vault/graph-builder.ts` — reads all `.md` files, parses `[[wikilinks]]`, returns `{nodes, edges}` for react-force-graph-2d

### Claude tasks — Sprint 05 (DO NOT duplicate)

- [ ] `app/api/vault/tree/route.ts` — file tree (local: live via REST, cloud: from vault_snapshots)
- [ ] `app/api/vault/note/[...path]/route.ts` — read single note, return markdown + frontmatter
- [ ] `app/api/vault/search/route.ts` — proxy to obsidian-rest search
- [ ] `components/vault/vault-tree.tsx` — collapsible file tree
- [ ] `components/vault/note-viewer.tsx` — react-markdown + @flowershow/remark-wiki-link + remark-gfm
- [ ] `app/(app)/vault/page.tsx` — 3-pane: tree | viewer | search
- [ ] `components/graph/knowledge-graph.tsx` — react-force-graph-2d wrapper (dynamic import, no SSR)
- [ ] `app/(app)/graph/page.tsx`
- [ ] Node-click → navigate to `/vault?note=...`

---

## Sprint 06 Tasks (queued — start after Sprints 04+05)

### Codex tasks — Sprint 06

- [ ] Drizzle migration `drizzle/0006_vault_snapshots.sql` + schema `lib/db/vault-schema.ts`
- [ ] `scripts/snapshot-vault.ps1` — reads vault via `vault-fs.ts`, writes `vault_snapshots` row to Neon
- [ ] Wire cloud profile to read `vault_snapshots` for `/api/vault/tree` and graph data
- [ ] Persist PTY output to `agent_events` (event_type='terminal_log') with rate limiting (max 1 event/s)
- [ ] "Watch mode": agent runner appends narration events to today's Obsidian daily note via `obsidian-rest.ts`

### Claude tasks — Sprint 06 (DO NOT duplicate)

- [ ] Cost/token display on agent session cards (tokens_in, tokens_out, cost_usd from SDK result)
- [ ] Capture and persist tokens/cost on session completion
- [ ] Terminal log viewer on agent session detail page
- [ ] Graph community coloring using `graphify-out/graph.json` community field
- [ ] Final polish: empty states, error toasts, loading skeletons

---

## Constraints

- Package manager: `corepack pnpm` always — never bare `pnpm` or `npm`
- Build command: `corepack pnpm build` uses `next build --turbopack` (webpack hangs in this environment)
- No remote `git push` unless explicitly required by the active sprint contract
- `node-pty` is a native module — must build on Windows. Do NOT attempt Edge Runtime. All terminal/agent routes must use `export const runtime = 'nodejs'`
- `HELM_PROFILE=local` is set in `.env.local`. Cloud build (HELM_PROFILE=cloud) must never bundle `node-pty` or `@anthropic-ai/claude-agent-sdk` — use dynamic imports inside profile guards
- Agent default mode is `'plan'` (read-only). `'acceptEdits'` only on explicit UI toggle per session. Never persist `acceptEdits` as default
- Obsidian REST client uses Bearer: `Authorization: Bearer ${process.env.OBSIDIAN_REST_API_KEY}`
- `vault-fs.ts` fallback must be implemented BEFORE the REST client is used in routes (not an afterthought)
- Watchdog: check usage/context every work round and at least every 5 minutes; pause at 75% context; stop at 90% session usage
- Graphify: run `graphify update .` after modifying code files; known `.codex/hooks.json` permission warning on hook reinstall is non-fatal

## Definition of Done — Sprint 03

- [ ] `pnpm dev:helm` starts local server on port 3001 (or `HELM_LOCAL_PORT`)
- [ ] `/terminal` route renders xterm pane only when `HELM_PROFILE=local`
- [ ] Typing `Get-ChildItem` in the terminal returns directory listing within 100ms
- [ ] Closing the tab terminates the pty process (no zombie processes)
- [ ] Cloud build (`HELM_PROFILE=cloud`) succeeds without `node-pty` in bundle
- [x] `corepack pnpm typecheck` passes
- [x] `corepack pnpm lint` passes
- [x] `corepack pnpm build` (Turbopack) passes

## Codex Update — 2026-05-26

- Completed the Codex-owned Sprint 03 backend/package slice: installed terminal deps, aligned `@xterm/xterm` to `5.5.0` for `react-xtermjs`, added `@types/ws`, implemented `lib/terminal/pty-pool.ts`, implemented `lib/terminal/ws-handler.ts`, added focused tests, and added Windows-safe `dev:helm` / `start:helm` launch scripts through `scripts/run-helm-server.mjs`.
- Verification passed: `corepack pnpm exec tsc -p tsconfig.test.json`, `node --test .tmp\test-dist\tests\*.test.js` (10/10), `node-pty` import smoke, `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm build`, and Graphify refresh through `ensure-graphify.ps1 -RepoPath . -SkipHooks` (231 nodes, 300 edges, 63 communities).
- Coordination blocker: `corepack pnpm dev:helm` fails with `ERR_MODULE_NOT_FOUND` for `server.mjs`. That file is still listed as Claude-owned, so Codex did not create it.

## Next Safe Step

Claude should land the Sprint 03 server/profile/UI slice next: `server.mjs`, `parseLocalProfileEnv()`, local-only nav gating, `xterm-pane`, `/terminal`, and `DOCS/local-runtime.md`. After that, rerun `corepack pnpm dev:helm` and the live terminal acceptance checks.
