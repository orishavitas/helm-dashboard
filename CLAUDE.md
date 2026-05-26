# Helm Dashboard — CLAUDE.md

> Project context for Claude/Legion. Keep this current. Codex-visible equivalent is `AGENTS.md` + `.codex/state/`.

## Project Identity

- **Repo:** `C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard`
- **Stack:** Next.js 14 (App Router), TypeScript, Drizzle ORM, Neon Postgres, Auth.js (Google), React Query, Tailwind, pnpm
- **Package manager:** always `corepack pnpm` — never bare `pnpm` or `npm`
- **Sprint:** `DOCS/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md`

---

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| DB schema + Drizzle foundation | ✅ Done | `lib/db/`, `drizzle/0000_*.sql` |
| Auth (Google via Auth.js) | ✅ Done | `lib/session.ts`, `requireUser()` |
| Overlord DB schema | ✅ Done | `lib/db/overlord-schema.ts`, `drizzle/0001_overlord.sql` |
| Overlord API routes | ✅ Done | `app/api/overlord/push/` + `state/` |
| Overlord UI + polling | ✅ Done | `components/overlord-panel.tsx`, `overlord-terminal-card.tsx` |
| Dashboard widget architecture | ✅ Done | `components/dashboard/dashboard-layout.tsx`, `dashboard-widget.tsx` |
| Product progress model | ✅ Done | `lib/product-progress.ts`, `components/product-progress.tsx` |
| Concept preview | ✅ Done | `concept-preview.html` |
| DB migration applied to Neon | ❌ Blocked | Missing `DATABASE_URL` / `DATABASE_URL_UNPOOLED` in env |
| Live Overlord push test | ❌ Blocked | Missing `OVERLORD_BASE_URL` + `OVERLORD_PUSH_SECRET` + migrated DB |
| Auth login flow (browser) | ❌ Blocked | Missing `AUTH_SECRET` + Google OAuth env vars |

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
| `graphify-out/` | Knowledge graph (156 nodes, 178 edges, 56 communities) |
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

## Current Status (2026-05-18)

All code is written, type-checked, linted, and built successfully. The only remaining work is **operational** (env + DB):

1. Create `.env.local` with Neon, Auth.js, Google OAuth, GitHub App, Overlord secrets
2. Run `corepack pnpm db:migrate` to apply `drizzle/0001_overlord.sql` to Neon
3. Run `scripts/overlord-push.ps1` with real `OVERLORD_BASE_URL` + `OVERLORD_PUSH_SECRET`
4. Verify dashboard renders a terminal card for the push

## Next Steps

- [ ] Shepard-Commander: provide `.env.local` values (Neon DB, Auth.js, Google OAuth, OVERLORD_PUSH_SECRET)
- [ ] Run `corepack pnpm db:migrate`
- [ ] Run `scripts/overlord-push.ps1` and verify terminal card appears in dashboard
- [ ] Mark sprint done in DOCS/
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
