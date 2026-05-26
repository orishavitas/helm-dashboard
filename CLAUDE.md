# Helm Dashboard — CLAUDE.md

> Project context for Claude/Legion. Keep this current. Codex-visible equivalent is `AGENTS.md` + `.codex/state/`.

## Project Identity

- **Repo:** `C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard`
- **Stack:** Next.js 14 (App Router), TypeScript, Drizzle ORM, Neon Postgres, Auth.js (Google), React Query, Tailwind, pnpm
- **Package manager:** always `corepack pnpm` — never bare `pnpm` or `npm`
- **Sprint:** Sprints 03–06 (v2 MVP — AI Cockpit)
- **v2 Spec:** `DOCS/superpowers/specs/2026-05-25-helm-v2-mvp-design.md`
- **Status:** Sprint 03 in progress; Codex-owned terminal backend/package slice complete, Claude-owned server/profile/UI slice pending

---

## Phase Status

### v1 — Complete ✅
| Phase | Status | Notes |
|-------|--------|-------|
| DB schema + Drizzle foundation | ✅ Done | `lib/db/`, `drizzle/0000_*.sql` |
| Auth (Google via Auth.js) | ✅ Done | `lib/session.ts`, `requireUser()` |
| Overlord Monitor (Sprint 01) | ✅ Done | Push endpoint, polling UI, deployed to Vercel |
| State Aggregator | ✅ Done | Operations state API, import endpoint, widgets |
| GitHub Tracking (Sprint 02) | ✅ Done | PR/commit drill-down, terminal presence grouped by repo |
| DB migrations (Neon) | ✅ Done | 0001–0004 applied |
| Production deploy | ✅ Done | https://helm-dashboard-ten.vercel.app |

### v2 — AI Cockpit (Active)
| Phase | Status | Notes |
|-------|--------|-------|
| v2 Design & Research | ✅ Done | `DOCS/superpowers/specs/2026-05-25-helm-v2-mvp-design.md` |
| Sprint 03: Local Runtime + Terminal | In progress | Codex backend/package slice complete; Claude server/profile/UI slice pending |
| Sprint 04: Claude Code Agent Runner | ⏳ Pending S03 | Agent SDK, SSE streaming, session persistence |
| Sprint 05: Vault + Knowledge Graph | ⏳ Pending S03 | Obsidian REST, wikilinks, react-force-graph-2d |
| Sprint 06: Snapshots + Polish | ⏳ Pending S04+S05 | Cloud snapshots, cost tracking, watch mode |

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/env.ts` | Env validation — `parseEnv()` (full), `parseOverlordPushEnv()` (push-only) |
| `lib/db/schema.ts` | Re-exports all Drizzle table definitions |
| `lib/db/overlord-schema.ts` | `terminal_snapshots` table |
| `lib/db/enums.ts` | `terminalStatus` enum |
| `lib/data/overlord.ts` | `getOverlordState()` — latest snapshot per terminal |
| `lib/data/projects.ts` | Sprint task-state counts + product progress computation |
| `lib/product-progress.ts` | TypeScript-only stage/maturity model (no DB) |
| `lib/view-models.ts` | `TerminalSnapshot`, `OverlordState` types |
| `app/api/overlord/push/route.ts` | Bearer-auth heartbeat POST endpoint |
| `app/api/overlord/state/route.ts` | Authenticated GET for dashboard polling |
| `components/overlord-panel.tsx` | React Query polling panel (2-min interval) |
| `components/overlord-terminal-card.tsx` | Terminal status card UI |
| `components/dashboard/dashboard-layout.tsx` | Widget registry + layout config array |
| `components/dashboard/dashboard-widget.tsx` | Reusable widget shell |
| `components/project-card.tsx` | Project card with stage, maturity, progress |
| `components/product-progress.tsx` | Product progress UI sections |
| `components/ui/card.tsx` | Helm card primitive |
| `components/ui/chip.tsx` | Helm chip primitive |
| `components/ui/input.tsx` | Helm input primitive |
| `app/(app)/page.tsx` | Dashboard page — renders widget grid |
| `app/globals.css` | Helm design tokens (CSS vars) |
| `drizzle/0001_overlord.sql` | Scoped Overlord migration (NOT yet applied to Neon) |
| `scripts/overlord-push.ps1` | PowerShell heartbeat push script |
| `lib/terminal/pty-pool.ts` | Sprint 03 PTY pool for max-4 terminal sessions and idle cleanup |
| `lib/terminal/ws-handler.ts` | Sprint 03 websocket upgrade/input/resize handler for terminal sessions |
| `scripts/run-helm-server.mjs` | Windows-safe launcher for `dev:helm` and `start:helm` |
| `graphify-out/` | Knowledge graph (231 nodes, 300 edges, 63 communities) |
| `.codex/state/` | Codex-owned task/run state |
| `AGENTS.md` | Graphify guidance for Codex |

---

## Critical Implementation Notes

### Env parsing split (2026-05-18)
`parseEnv()` validates all 14 env vars including Google OAuth, GitHub App, etc.
`parseOverlordPushEnv()` only requires `DATABASE_URL` + `OVERLORD_PUSH_SECRET`.
The push route uses `parseOverlordPushEnv()` so it works with partial env (agent terminals only need DB + secret).

### Widget registry pattern
Dashboard widgets are declared in a single `DASHBOARD_LAYOUT` config array in `dashboard-layout.tsx`. Adding a widget = one entry in that array. No prop drilling.

### Product progress is TypeScript-only
Stage and maturity are computed from sprint task-state counts and GitHub/Vercel snapshot status. No DB columns. Missing signals render as explicit blockers (not silently zero).

### Overlord push is a public-secret endpoint
The push route is the only mutation outside normal Auth.js session auth. It uses `Authorization: Bearer <OVERLORD_PUSH_SECRET>`. Intentional — agent terminals don't have browser sessions.

### No remote push policy
Do not `git push` unless a baseline project contract explicitly requires it. All verification is local.

### Windows path casing warning
Next.js/Webpack reports case-only path differences between `Documents` and `documents`. Non-fatal — always run from the lowercase path (`C:\Users\OriShavit\documents\github\...`) to suppress.

---

## Architectural Decisions (immutable without sign-off)

| Date | Decision |
|------|----------|
| 2026-05-05 | GitHub/Vercel data from snapshot tables only — no live API in RSC renders |
| 2026-05-05 | Vercel token AES-256-GCM encrypted in DB |
| 2026-05-05 | One open sprint per project (partial unique index) |
| 2026-05-05 | All product mutations via Server Actions only |
| 2026-05-05 | GitHub App auth via installation ID in `userIntegrations` |
| 2026-05-05 | Soft delete on projects/tasks; hard delete on todos |
| 2026-05-06 | Overlord push is the one exception to no-public-mutations — bearer secret |
| 2026-05-06 | No remote git push without explicit contract |
| 2026-05-06 | Every active repo must have `graphify-out/` + AGENTS.md + Codex hooks |

---

## Current Status (2026-05-26)

Sprint 03 is in progress. Codex completed the backend/package slice:

1. Terminal dependencies installed and `node-pty` Windows ConPTY import verified.
2. `lib/terminal/pty-pool.ts` and `lib/terminal/ws-handler.ts` implemented with focused tests.
3. `pnpm dev:helm` and `pnpm start:helm` added through `scripts/run-helm-server.mjs`.
4. Verification passed: focused tests 10/10, typecheck, lint, build, and Graphify refresh.

Remaining Sprint 03 blocker: `corepack pnpm dev:helm` fails with `ERR_MODULE_NOT_FOUND` for `server.mjs`. That file is Claude-owned in `.codex/state/TASK_STATE.md`.

## Next Steps

- [ ] Claude: add `server.mjs` and wire `handleTerminalUpgrade()` on `/ws/terminal/:sessionId`
- [ ] Claude: add `parseLocalProfileEnv()` and local-only nav gating
- [ ] Claude: add `components/terminal/xterm-pane.tsx`, `/terminal`, and `DOCS/local-runtime.md`
- [ ] Rerun `corepack pnpm dev:helm` and the live terminal acceptance checks

---

## Nexus Harness

This repo is wired into the Nexus agentic development system.

**Dispatch source:** `.agent-harness/inbox/` — task packets land here. Agents do not read monday.com for dispatch.
**Writeback:** `.agent-harness/outbox/{task-id}.result.md` — every task ends with a populated result file.
**Evidence:** `.agent-harness/artifacts/{task-id}/` — test output, verification logs.
**Monitor:** Run `python C:/Users/OriShavit/Documents/GitHub/project_nexus/monitor/monitor.py` to countersign completed results.
**Schema:** `.agent-harness/config/manifest/schema.yaml` — 9 task types, evidence requirements.

### Session Start Protocol

1. Read `MEMORY.md` — current state, key decisions, blockers
2. Read `TODO.md` — what's next and current phase
3. Check `.agent-harness/inbox/` for any active task packet
4. Read `legion-vault/projects/Helm-Dashboard/index.md` for sprint state

### Vault Ingest (Automatic)

Every session triggers vault ingest at Stop via `session_stop.py` → `vault_ingest_agent.py`.

**Verify:** `tail -5 .agent-harness/logs/vault-ingest.ndjson` — look for `vault_ingest_complete`

**Manual re-run:**
```bash
python C:\Users\OriShavit\Documents\GitHub\project_nexus\scripts\vault_ingest_agent.py --runtime claude --session-id manual --repo-path C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard
```

**Constraint:** Never write directly to `system/`, `projects/`, or `raw/repos/` in the vault. Only `vault_ingest_agent.py` writes there.

### Completion Anchors

Every completed task must update before claiming done:
- `TODO.md` — mark completed work, set next actionable item
- `MEMORY.md` — refresh current state, latest verified task, blockers
- `CHANGELOG.md` — add dated entry for what changed
