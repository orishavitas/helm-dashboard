# Task State - Helm Dashboard

**Repo:** https://github.com/orishavitas/helm-dashboard
**Sprint:** DOCS/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md
**Current task:** helm-overlord-02 BLOCKED on DB env; implementation tasks complete locally
**Written by:** Codex
**Updated:** 2026-05-06T21:25:54+03:00

## Objective

Implement the full Overlord Monitor feature end-to-end.

## Current Result

Local implementation is complete and verified by static/build checks. Runtime DB apply and live heartbeat test are blocked because this shell has no `DATABASE_URL_UNPOOLED`, `DATABASE_URL`, `OVERLORD_BASE_URL`, or `OVERLORD_PUSH_SECRET`.

## Constraints

- Package manager: `corepack pnpm` always; never bare `pnpm` or `npm`.
- Remote push: do not `git push` unless the active baseline project contract explicitly requires it.
- Watchdog cadence: check usage/context every work round and at least every 5 minutes; at 75% context pause to update durable state and handoff; at 90% session usage stop after checkpointing.
- Migration requires Neon connectivity. `db:migrate` was attempted once and failed because DB URL env vars are empty; do not retry until env is available.
- `OVERLORD_PUSH_SECRET` must be present before runtime push route validation can work.
- Every active repo must maintain `graphify-out/`; run workspace automation from `C:\Users\OriShavit\documents\github\scripts\ensure-graphify.ps1`.

## Implemented Files

| File | Purpose |
|------|---------|
| `lib/db/enums.ts` | Added `terminalStatus` enum |
| `lib/db/overlord-schema.ts` | Added `terminalSnapshots` table |
| `lib/db/schema.ts` | Re-exported Overlord schema |
| `lib/env.ts` | Added `OVERLORD_PUSH_SECRET` |
| `lib/view-models.ts` | Added `TerminalSnapshot` and `OverlordState` |
| `lib/data/overlord.ts` | Added `getOverlordState()` |
| `app/api/overlord/push/route.ts` | Added heartbeat push endpoint |
| `app/api/overlord/state/route.ts` | Added authenticated state endpoint |
| `components/overlord-terminal-card.tsx` | Added terminal card UI |
| `components/overlord-panel.tsx` | Added React Query polling panel |
| `app/(app)/page.tsx` | Rendered `<OverlordPanel />` |
| `drizzle/0001_overlord.sql` | Added scoped Overlord migration |
| `scripts/overlord-push.ps1` | Added heartbeat push script |
| `AGENTS.md` | Added repo-local Graphify instructions |
| `.codex/hooks.json` | Added Graphify Codex hook |
| `graphify-out/` | Added generated knowledge graph |

## Definition of Done

- [ ] `terminal_snapshots` table exists in Neon DB - blocked by missing DB env
- [x] `POST /api/overlord/push` implemented with bearer auth
- [x] `GET /api/overlord/state` implemented with `requireUser()`
- [x] `<OverlordPanel />` renders in dashboard and polls every 2 minutes
- [x] `corepack pnpm typecheck` passes
- [x] `corepack pnpm lint` passes with `--max-warnings=0`
- [x] `corepack pnpm build` succeeds
- [x] `scripts/overlord-push.ps1` exists
- [ ] Live script push test - blocked by missing URL/secret/DB env
- [x] Legion KB updated with new files
- [x] `graphify-out/` added and Graphify automation installed

## Next Safe Step

Run `corepack pnpm db:migrate` in Helm-Dashboard after DB env is available. Then run `scripts/overlord-push.ps1` with valid `OVERLORD_BASE_URL` and `OVERLORD_PUSH_SECRET`.
