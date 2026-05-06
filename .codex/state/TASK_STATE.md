# Task State — Helm Dashboard

**Sprint:** docs/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md
**Current task:** helm-overlord-01 (start here)
**Written by:** Legion
**Written at:** 2026-05-06

---

## Objective

Implement the full Overlord Monitor feature end-to-end, no stops. All 11 tasks in sequence. Do not stop between tasks unless a hard BLOCKED condition is met (see Codex identity file for stop conditions).

## What We Are Building

An Overlord Monitor widget for the Helm Dashboard. It lets agent terminals push heartbeat snapshots (status, current task, repo, context %) to a Neon-backed endpoint. A React Query client widget polls the state every 2 minutes and renders a card grid. Fully self-contained — drop `<OverlordPanel />` anywhere.

## Constraints

- **Package manager:** `corepack pnpm` always — never bare `pnpm` or `npm`
- **No tests runner yet** — verify by typecheck + lint + build after Task 9
- **Migration requires Neon connectivity** — if `db:migrate` fails on connection, write BLOCKED immediately; do not retry more than once
- **`OVERLORD_PUSH_SECRET`** — must be added to `.env.local` before running the app or migration. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **No scope creep** — implement exactly what the sprint tasks say. If something outside scope is noticed, note it in `DECISIONS.md` and move on
- **Commit after each task** — keep commits small and labelled with task_id

## Key Files (existing — read before modifying)

| File | Why relevant |
|------|-------------|
| `lib/db/enums.ts` | Add `terminalStatus` here |
| `lib/db/schema.ts` | Add re-export here |
| `lib/db/product-schema.ts` | Pattern reference for new schema file |
| `lib/env.ts` | Add `OVERLORD_PUSH_SECRET` to envSchema |
| `lib/view-models.ts` | Append new types here |
| `lib/data/projects.ts` | Pattern reference for new data file |
| `app/api/vercel/projects/route.ts` | Pattern reference for new API routes |
| `components/project-card.tsx` | UI pattern + Badge/icon usage reference |
| `app/(app)/page.tsx` | Wire `<OverlordPanel />` here in Task 9 |

## Definition of Done (full sprint)

- [ ] `terminal_snapshots` table exists in Neon DB
- [ ] `POST /api/overlord/push` accepts heartbeats with bearer auth
- [ ] `GET /api/overlord/state` returns current + history per terminal
- [ ] `<OverlordPanel />` renders in dashboard, polls every 2 min
- [ ] `corepack pnpm typecheck` passes
- [ ] `corepack pnpm lint` passes (--max-warnings=0)
- [ ] `corepack pnpm build` succeeds
- [ ] `scripts/overlord-push.ps1` exists and can push a test heartbeat
- [ ] KB updated with all new files
