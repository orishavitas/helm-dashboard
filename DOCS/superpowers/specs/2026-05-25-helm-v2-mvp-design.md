# Helm Dashboard v2 — MVP Design Spec

**Document version:** 1.0  
**Date:** 2026-05-25  
**Status:** Awaiting Shepard-Commander sign-off  
**Successor to:** Sprint 01 (Overlord Monitor) + Sprint 02 (GitHub/Terminal Presence) + State Aggregator  
**Research basis:** Claude Code + Obsidian second-brain research (2026-05-25 sessions)

---

## 1. MVP Vision Statement

**Helm Dashboard v2 is a local-first AI operations cockpit** that fuses the Helm operations dashboard with a Claude Code agent runner and the Obsidian vault, so Shepard-Commander can dispatch agents, watch their terminals, browse the second brain, and review outcomes from a single tab. **"Working" means:** I can sit at the dashboard, kick off a Claude Code agent on a real repo, watch its terminal stream live, see the notes it touches in the vault graph, and accept/reject its output — without leaving the browser or opening four other tools.

---

## 2. MVP Scope

### IN (P0)
- **Local-only Helm app** (`pnpm dev:helm`) running on Windows 11 with custom Node server
- **Embedded PowerShell terminal** in dashboard (xterm.js + node-pty + WebSocket)
- **Claude Code agent runner** — start/stop sessions, stream output via SSE, persist `session_id`
- **Obsidian vault reader** — file tree, markdown rendering with wikilinks, full-text search via Local REST API
- **Live knowledge graph view** — read vault, render with react-force-graph-2d, click-to-open note
- **Agent session log** — DB-backed record of every Claude Code run with status, tokens, files touched
- **Existing Helm features preserved** — Overlord panel, GitHub presence, operations state widget continue working on Vercel (cloud profile) AND local (full profile)

### OUT (explicit non-goals for MVP)
- ❌ Multi-user support — single-user, single-machine
- ❌ Vercel deployment of terminal/agent features — local-only by design
- ❌ Mobile/responsive polish — desktop 1440px+ only
- ❌ Voice input, audio output, screen recording
- ❌ Multi-vault support — one vault path in env
- ❌ Codex parity (Codex Cloud session runner) — Claude only this MVP
- ❌ Vault writes from agents through dashboard UI — agents write via their own filesystem tools; dashboard is read-mostly
- ❌ Authentication for local profile — bind to 127.0.0.1, trust the OS user
- ❌ Custom plugin marketplace, themes, layout editor

### Deferred (post-MVP)
- Remote terminal access via SSH tunnel
- Codex session runner integration
- Vault write UI (create/edit notes from dashboard)
- Sprint planning UI (currently markdown-driven)

---

## 3. Architecture Overview

### Runtime Profiles

| Profile | Host | Features | Entry |
|---------|------|----------|-------|
| **cloud** | Vercel | Overlord, GitHub presence, ops state, vault read-only (snapshot) | `next start` (existing) |
| **local** | Windows 11 dev box | All cloud features + terminal + agent runner + live vault + graph | `node server.mjs` (custom) |

Feature gating via `HELM_PROFILE=local|cloud` env var. Server-only modules guarded by profile check + dynamic import. Cloud build never bundles `node-pty` or `@anthropic-ai/claude-agent-sdk`.

### Custom Server Decision: `server.mjs`

**Not** next-ws — full control over HTTP/WS upgrade lifecycle, no plugin coupling, matches Anthropic SDK examples. Cost: one extra file (~80 lines). Benefit: never fights Next.js upgrades.

### Directory Additions

```
helm-dashboard/
├── server.mjs                          # NEW custom server (local profile)
├── lib/
│   ├── agents/
│   │   ├── claude-runner.ts            # wraps @anthropic-ai/claude-agent-sdk query()
│   │   ├── session-store.ts            # DB-backed session_id persistence + resume
│   │   └── permission-policy.ts        # maps UI mode → SDK permissionMode
│   ├── vault/
│   │   ├── obsidian-rest.ts            # REST client for obsidian-local-rest-api
│   │   ├── vault-fs.ts                 # direct fs reader fallback
│   │   ├── graph-builder.ts            # vault → {nodes, edges}
│   │   └── wikilink.ts                 # @flowershow/remark-wiki-link config
│   ├── terminal/
│   │   ├── pty-pool.ts                 # node-pty session manager (max 4, idle timeout)
│   │   └── ws-handler.ts              # WS upgrade handler (mounted in server.mjs)
│   └── db/
│       ├── agent-schema.ts             # agent_sessions, agent_events tables
│       └── vault-schema.ts             # vault_snapshots table
├── app/(app)/
│   ├── agents/page.tsx                 # agent runner page
│   ├── vault/page.tsx                  # vault browser
│   ├── graph/page.tsx                  # knowledge graph
│   └── terminal/page.tsx               # embedded terminal
├── app/api/
│   ├── agents/
│   │   ├── sessions/route.ts           # list/create
│   │   ├── stream/[id]/route.ts        # SSE endpoint
│   │   └── stop/[id]/route.ts          # abort signal
│   └── vault/
│       ├── tree/route.ts               # file tree
│       ├── note/[...path]/route.ts     # read single note
│       └── search/route.ts             # search proxy
├── components/
│   ├── agents/agent-runner.tsx         # prompt + mode + stream view
│   ├── agents/agent-event-stream.tsx   # SSE consumer
│   ├── vault/note-viewer.tsx           # markdown + wikilinks
│   ├── vault/vault-tree.tsx            # collapsible tree
│   ├── graph/knowledge-graph.tsx       # react-force-graph-2d wrapper
│   └── terminal/xterm-pane.tsx         # react-xtermjs wrapper
└── drizzle/
    ├── 0005_agent_sessions.sql
    └── 0006_vault_snapshots.sql
```

### New DB Tables

#### `agent_sessions`
```sql
CREATE TABLE agent_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL REFERENCES users(id),
  session_id    text NOT NULL,               -- Claude SDK session_id
  parent_id     uuid REFERENCES agent_sessions(id),
  repo_path     text NOT NULL,
  prompt        text NOT NULL,
  mode          text NOT NULL,               -- 'plan' | 'acceptEdits' | 'bypass'
  status        text NOT NULL,               -- 'running' | 'completed' | 'failed' | 'aborted'
  model         text NOT NULL,
  tokens_in     integer DEFAULT 0,
  tokens_out    integer DEFAULT 0,
  cost_usd      numeric(10,4),
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  CONSTRAINT agent_sessions_session_id_unique UNIQUE(session_id)
);
```

#### `agent_events`
```sql
CREATE TABLE agent_events (
  id            bigserial PRIMARY KEY,
  session_pk    uuid NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  event_type    text NOT NULL,               -- 'tool_use' | 'tool_result' | 'text' | 'error'
  tool_name     text,
  payload       jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

#### `vault_snapshots`
```sql
CREATE TABLE vault_snapshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL REFERENCES users(id),
  vault_name    text NOT NULL,
  node_count    integer NOT NULL,
  edge_count    integer NOT NULL,
  graph_json    jsonb NOT NULL,              -- for cloud-profile rendering
  captured_at   timestamptz NOT NULL DEFAULT now()
);
```

### New Environment Variables

```
# Profile
HELM_PROFILE=local                             # local | cloud (default: cloud)

# Claude Agent SDK
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_DEFAULT_MODEL=claude-opus-4-7

# Obsidian
OBSIDIAN_VAULT_PATH=C:\Users\OriShavit\Documents\legion-vault
OBSIDIAN_REST_API_URL=http://127.0.0.1:27123
OBSIDIAN_REST_API_KEY=...

# Terminal
TERMINAL_SHELL=powershell.exe
TERMINAL_CWD=C:\Users\OriShavit\Documents\GitHub
TERMINAL_MAX_SESSIONS=4

# Local server
HELM_LOCAL_PORT=3001
HELM_WS_PATH=/ws
```

### Local-Only vs Vercel-Deployable Split

| Feature | Cloud (Vercel) | Local (`node server.mjs`) |
|---------|---------------|---------------------------|
| Overlord panel | ✅ | ✅ |
| GitHub presence | ✅ | ✅ |
| Operations state | ✅ | ✅ |
| Vault browser | Read-only from `vault_snapshots` | Live via REST API |
| Knowledge graph | Static from snapshot | Live, rebuilds on focus |
| Agent runner | ❌ (hidden in nav) | ✅ |
| Embedded terminal | ❌ (hidden in nav) | ✅ |
| Auth | Auth.js Google | Auth.js Google (required) |

---

## 4. Feature Set with Priority

| # | Feature | Priority | Sprint | Complexity |
|---|---------|----------|--------|------------|
| F01 | Custom Node server with WS upgrade handler | P0 | S3 | M |
| F02 | Profile gating (`HELM_PROFILE`) + nav conditional | P0 | S3 | S |
| F03 | xterm.js + node-pty PowerShell terminal | P0 | S3 | M |
| F04 | Terminal session pool (max 4, idle timeout) | P0 | S3 | S |
| F05 | Claude Agent SDK runner wrapper | P0 | S4 | M |
| F06 | Agent SSE streaming endpoint | P0 | S4 | M |
| F07 | `agent_sessions` + `agent_events` schema + migrations | P0 | S4 | S |
| F08 | Agent runner UI (prompt, mode, stream view, stop button) | P0 | S4 | M |
| F09 | Session resume by `session_id` | P0 | S4 | S |
| F10 | Obsidian REST client | P0 | S5 | S |
| F11 | Vault tree + note viewer with wikilinks | P0 | S5 | M |
| F12 | Vault search (REST proxy) | P0 | S5 | S |
| F13 | Knowledge graph builder + react-force-graph-2d | P0 | S5 | M |
| F14 | Click-node-to-open-note flow | P0 | S5 | S |
| F15 | Vault snapshot job (for cloud profile) | P1 | S6 | M |
| F16 | Agent cost/token display | P1 | S6 | S |
| F17 | Per-session terminal logs persisted to DB | P1 | S6 | M |
| F18 | Agent "watch mode" — auto-stream into vault daily note | P1 | S6 | M |
| F19 | Graph community coloring (from graphify-out structure) | P1 | S6 | S |
| F20 | Keyboard shortcuts (Cmd-K palette) | P2 | post-MVP | M |
| F21 | Multi-pane terminal layout | P2 | post-MVP | M |
| F22 | Agent diff preview before acceptEdits | P2 | post-MVP | L |

---

## 5. Sprint Plan

### Sprint 03 — Local Runtime & Terminal Embedding
**Goal:** A logged-in user on the local profile can open `/terminal`, see a live PowerShell session inside the dashboard, type commands, and see output stream back in under 100ms.

**Tasks:**
- [ ] `owner_runtime: claude` — Author `server.mjs` custom server (HTTP + WS upgrade, mount Next handler) (F01)
- [ ] `owner_runtime: claude` — Add `HELM_PROFILE` env var, `parseLocalProfileEnv()` in `lib/env.ts` (F02)
- [ ] `owner_runtime: claude` — Conditional nav rendering for local-only routes (F02)
- [ ] `owner_runtime: codex` — Install + wire `node-pty` (verify Windows ConPTY build), prebuild script if needed (F03)
- [ ] `owner_runtime: codex` — Build `lib/terminal/pty-pool.ts` with max-sessions limit + idle timeout (F04)
- [ ] `owner_runtime: codex` — Build `lib/terminal/ws-handler.ts`, register on `/ws/terminal/:sessionId` (F03)
- [ ] `owner_runtime: claude` — Build `components/terminal/xterm-pane.tsx` using `react-xtermjs` + `@xterm/addon-attach` + `@xterm/addon-fit` (F03)
- [ ] `owner_runtime: claude` — Build `app/(app)/terminal/page.tsx` (F03)
- [ ] `owner_runtime: codex` — Add `pnpm dev:helm` script that runs `node server.mjs` in dev mode (F01)
- [ ] `owner_runtime: claude` — Docs: `DOCS/local-runtime.md` — startup, troubleshooting, ConPTY quirks

**Acceptance criteria:**
- `pnpm dev:helm` starts local server on port 3001
- `/terminal` route renders xterm pane only when `HELM_PROFILE=local`
- Typing `Get-ChildItem` returns directory listing within 100ms
- Closing the tab terminates the pty process (verified in Task Manager)
- Cloud build (`pnpm build` with `HELM_PROFILE=cloud`) succeeds without `node-pty` in bundle

**Dependencies:** None

---

### Sprint 04 — Claude Code Agent Runner
**Goal:** User can submit a prompt + repo path + mode, watch the Claude Code agent loop stream in real time, persist the session, and resume it later.

**Tasks:**
- [ ] `owner_runtime: claude` — Drizzle migration `0005_agent_sessions.sql` + schema files (F07)
- [ ] `owner_runtime: codex` — Install `@anthropic-ai/claude-agent-sdk`, build `lib/agents/claude-runner.ts` wrapping `query()` (F05)
- [ ] `owner_runtime: codex` — Build `lib/agents/permission-policy.ts` mapping UI mode → SDK `permissionMode` (F05)
- [ ] `owner_runtime: codex` — Build `lib/agents/session-store.ts` for `session_id` persistence + resume (F09)
- [ ] `owner_runtime: claude` — Build `app/api/agents/sessions/route.ts` (POST create, GET list) (F06)
- [ ] `owner_runtime: claude` — Build `app/api/agents/stream/[id]/route.ts` SSE endpoint (F06)
- [ ] `owner_runtime: claude` — Build `app/api/agents/stop/[id]/route.ts` for AbortController signaling (F06)
- [ ] `owner_runtime: codex` — Persist every agent event to `agent_events` table from runner (F07)
- [ ] `owner_runtime: claude` — Build `components/agents/agent-runner.tsx` (form + mode picker) (F08)
- [ ] `owner_runtime: claude` — Build `components/agents/agent-event-stream.tsx` (SSE consumer with EventSource) (F08)
- [ ] `owner_runtime: claude` — Build `app/(app)/agents/page.tsx` with session list + active stream (F08)
- [ ] `owner_runtime: codex` — Add session resume button using stored `session_id` (F09)

**Acceptance criteria:**
- Submitting a prompt creates a row in `agent_sessions` with `status='running'`
- SSE stream emits `tool_use`, `tool_result`, `text` events to the browser
- Stop button aborts the query within 1 second
- After page reload, the session list shows all past runs sorted by `started_at DESC`
- Clicking "Resume" continues a session with the same `session_id`
- `permissionMode='plan'` blocks all write operations

**Dependencies:** Sprint 03 (local profile gating)

---

### Sprint 05 — Vault Integration & Knowledge Graph
**Goal:** User can browse the Obsidian vault tree, click any note to render it with working wikilinks, search across notes, and see the full vault as an interactive force-directed graph.

**Tasks:**
- [ ] `owner_runtime: codex` — Build `lib/vault/obsidian-rest.ts` typed REST client (F10)
- [ ] `owner_runtime: codex` — Build `lib/vault/vault-fs.ts` direct fs fallback (F10)
- [ ] `owner_runtime: claude` — Build `app/api/vault/tree/route.ts` returning file tree (F11)
- [ ] `owner_runtime: claude` — Build `app/api/vault/note/[...path]/route.ts` returning markdown + frontmatter (F11)
- [ ] `owner_runtime: claude` — Build `app/api/vault/search/route.ts` proxying REST search (F12)
- [ ] `owner_runtime: claude` — Build `components/vault/vault-tree.tsx` collapsible tree component (F11)
- [ ] `owner_runtime: claude` — Build `components/vault/note-viewer.tsx` using `react-markdown` + `@flowershow/remark-wiki-link` (F11)
- [ ] `owner_runtime: claude` — Build `app/(app)/vault/page.tsx` (split pane: tree | viewer | search) (F11, F12)
- [ ] `owner_runtime: codex` — Build `lib/vault/graph-builder.ts` parsing `[[wikilinks]]` into nodes+edges (F13)
- [ ] `owner_runtime: claude` — Build `components/graph/knowledge-graph.tsx` wrapping `react-force-graph-2d` (F13)
- [ ] `owner_runtime: claude` — Build `app/(app)/graph/page.tsx` (F13)
- [ ] `owner_runtime: claude` — Wire node-click → navigate to `/vault?note=...` (F14)

**Acceptance criteria:**
- `/vault` renders tree of all `.md` files within 2s for a 500-note vault
- Clicking a note renders markdown with wikilinks as `<a>` tags
- Search input returns matches within 500ms
- `/graph` renders force-directed graph with 100+ nodes at 60fps
- Clicking a graph node opens that note in `/vault`
- Falls back to `vault-fs.ts` when REST API returns 503

**Dependencies:** Sprint 03 (local profile)

---

### Sprint 06 — Cloud Snapshots, Cost Tracking & Polish
**Goal:** Cloud profile gets a read-only vault/graph via daily snapshots. Agent runs show cost and tokens. Terminal logs are inspectable after the fact.

**Tasks:**
- [ ] `owner_runtime: codex` — Drizzle migration `0006_vault_snapshots.sql` (F15)
- [ ] `owner_runtime: codex` — Build `scripts/snapshot-vault.ps1` — reads vault, writes `vault_snapshots` row (F15)
- [ ] `owner_runtime: codex` — Wire cloud profile to read `vault_snapshots` for `/vault` and `/graph` (F15)
- [ ] `owner_runtime: claude` — Add cost/token columns to agent session card (F16)
- [ ] `owner_runtime: claude` — Capture `tokens_in/out/cost` from SDK result and persist on completion (F16)
- [ ] `owner_runtime: codex` — Persist pty output to `agent_events` (event_type='terminal_log') with rate limit (F17)
- [ ] `owner_runtime: claude` — Build terminal log viewer on agent session detail page (F17)
- [ ] `owner_runtime: codex` — "Watch mode": agent run appends events to today's daily note via Obsidian REST (F18)
- [ ] `owner_runtime: claude` — Color graph nodes by community (reuse `graphify-out/graph.json` community field) (F19)
- [ ] `owner_runtime: claude` — Final polish pass — empty states, error toasts, loading skeletons

**Acceptance criteria:**
- Snapshot job writes a new `vault_snapshots` row when run via Windows Task Scheduler
- Cloud profile shows graph rendered from snapshot, marked "snapshot from <timestamp>"
- Every completed agent session shows `$0.XX` cost and `IN/OUT` token counts
- "Watch mode" causes agent narration to appear in `Daily/2026-05-25.md` within 10s
- Graph nodes colored consistently across reloads (deterministic palette by community id)

**Dependencies:** Sprints 04, 05

---

## 6. MVP Screen Descriptions

### Screen 1: `/terminal` — Embedded Terminal
- **Shows:** Full-height xterm.js pane with tab bar (up to 4 tabs). Each tab = separate PowerShell session.
- **Data source:** WebSocket `/ws/terminal/:sessionId` bridging `node-pty` PowerShell process.
- **Updates:** WebSocket binary frames, sub-100ms keystroke echo.
- **Actions:** Type/run commands, new tab (`Ctrl+T`), close tab (`Ctrl+W`), set cwd via URL param.

### Screen 2: `/agents` — Agent Runner
- **Shows:** Left rail: past sessions (status pill, prompt preview, started_at, cost). Main: event feed (tool_use cards, tool_result blocks, narration text). Top: new-session form (prompt, repo path, mode dropdown: `plan`/`acceptEdits`/`bypass`).
- **Data source:** `agent_sessions` + `agent_events` tables for history; SSE `/api/agents/stream/:id` for live runs.
- **Updates:** SSE for active session, React Query for session list (refetch on focus + after mutation).
- **Actions:** Start new run, Stop running session, Resume completed session, click event to expand payload JSON.

### Screen 3: `/vault` — Vault Browser
- **Shows:** Three-pane split: Left = collapsible file tree. Middle = rendered note with wikilinks. Right = search + results + backlinks.
- **Data source:** REST API on local profile; `vault_snapshots` on cloud profile.
- **Updates:** React Query, manual refresh button.
- **Actions:** Click tree node to open note, click wikilink to navigate, search, "Open in Obsidian" button (`obsidian://` URI).

### Screen 4: `/graph` — Knowledge Graph
- **Shows:** Full-viewport force-directed graph. Nodes = notes, edges = wikilinks. Color = community. Size = backlink count. Side drawer on node select.
- **Data source:** `graph-builder.ts` on local; `vault_snapshots.graph_json` on cloud.
- **Updates:** Initial load; refresh button.
- **Actions:** Drag/zoom/pan, click to select node, double-click to navigate to `/vault?note=...`.

### Screen 5: `/` Dashboard — Enhanced Home
- **Shows:** Existing widgets + new "Active Agents" widget (running count, quick-link to `/agents`) + new "Vault Pulse" widget (note count, today's daily note preview, recent edits).
- **Data source:** Existing + `/api/agents/sessions?status=running` + `/api/vault/recent`.
- **Updates:** React Query polling (2 min) — consistent with existing pattern.

---

## 7. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| TD-01 | Custom `server.mjs`, not next-ws | Full WS lifecycle control, no plugin coupling, matches SDK examples |
| TD-02 | Two runtime profiles, one codebase | Vercel deployment must survive; local features gate behind `HELM_PROFILE=local` |
| TD-03 | SSE for agent streaming, WebSocket only for terminal | SSE is unidirectional and Vercel-compatible; WS only where bidirectional binary is required |
| TD-04 | Persist `session_id`, not transcript | SDK handles conversation state; we store event stream for UI replay |
| TD-05 | Obsidian REST as primary, `vault-fs.ts` as fallback | REST gives search/commands; fallback ensures dashboard works without Obsidian running |
| TD-06 | `react-force-graph-2d`, not 3D or hand-rolled D3 | 2D sufficient for 500–5000 nodes at 60fps; 3D costs perf; D3 from scratch costs weeks |
| TD-07 | Local profile trusts 127.0.0.1 (no extra auth) | OS-level access already exceeds what the dashboard exposes; theater auth adds complexity without security |

---

## 8. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | `node-pty` Windows build fails after Node upgrade | Medium | High | Pin Node version in `.nvmrc`, document `pnpm rebuild node-pty`, add CI check on Windows runner |
| R2 | Agent SDK contract drifts (Anthropic breaking change) | Medium | High | Pin SDK version exactly, smoke-test session in Sprint 04 acceptance, isolate calls behind `claude-runner.ts` |
| R3 | Custom server breaks Next.js HMR or App Router | Low | Medium | Mirror official custom-server example exactly for dev mode, add `pnpm dev:helm:debug` |
| R4 | Obsidian REST API unavailable | High | Low | `vault-fs.ts` fallback as first-class path in Sprint 05, surface plugin status in UI as "Obsidian connected" pill |
| R5 | `permissionMode` misconfiguration causes unintended writes | Low | Critical | Default is `plan` (read-only), `acceptEdits` requires explicit toggle per session (never persisted as default), `bypass` behind `?danger=1` URL param |

---

## Pre-Sprint-03 Checklist (Shepard-Commander)

Before Sprint 03 kickoff, please confirm:
- [ ] Vault path: `C:\Users\OriShavit\Documents\legion-vault` ← confirm or correct
- [ ] `OBSIDIAN_REST_API_KEY` — install `obsidian-local-rest-api` plugin, share key
- [ ] `ANTHROPIC_API_KEY` — confirm available for agent runner
- [ ] Local port `3001` — acceptable? (or specify alternative)
- [ ] Profile naming `local` / `cloud` — acceptable?

After sign-off, Sprints 03–06 are seeded as individual sprint files following existing conventions (`DOCS/sprints/`).

---

*Spec authored 2026-05-25 by Opus 4.7 + Sonnet 4.6 research session. Reviewed by Claude Code.*
