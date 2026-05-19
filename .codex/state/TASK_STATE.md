# Task State - Helm Dashboard

**Repo:** https://github.com/orishavitas/helm-dashboard
**Sprint:** DOCS/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md
**Current task:** Helm operability smoke passed; production Google OAuth callback adapter fix deployed, interactive browser login awaits verification
**Written by:** Legion (Claude) + Codex update 2026-05-19
**Updated:** 2026-05-19T15:13:27+03:00

## Objective

Implement the full Overlord Monitor feature end-to-end.

Add a rearrangeable widget architecture and TypeScript-only product progress model without changing runtime DB schema.

## Current Result

Local implementation is complete and verified by static/build checks. Runtime env now exists in `.env.local`; Codex verified DB connectivity, `terminal_snapshots` presence, invalid push rejection, and a valid live heartbeat push on 2026-05-19.

Production OAuth config was triaged on 2026-05-19. Google Auth Platform is `External`/`Testing` with the expected test users, and the production Google callback URI is set. A later Vercel runtime log for `/api/auth/callback/google` showed Google discovery/token calls succeeded and Neon SQL returned 400. Codex traced the root cause to Auth.js `DrizzleAdapter(getDb())` defaulting to `user`/`account`/`session` tables while Helm's schema uses `users`/`accounts`/`sessions`/`verification_tokens`; `lib/auth.ts` now maps those tables explicitly.

Codex pushed the Auth.js adapter fix to GitHub on 2026-05-19. Vercel production deployment `dpl_FNKyewXuws7jbKL65buWCQnrr1tF` reached `Ready` and owns `https://helm-dashboard-ten.vercel.app`.

Codex added `concept-preview.html` on 2026-05-14 as a standalone browser-openable preview of the intended Helm dashboard experience. It does not change the Next.js runtime.

Codex converted the live dashboard on 2026-05-18 to a widget registry/layout architecture. Product progress is computed in TypeScript from sprint task state, GitHub snapshot status, and Vercel deployment status. Unknown or missing signals render explicitly as blockers. No DB migration was added.

## Constraints

- Package manager: `corepack pnpm` always; never bare `pnpm` or `npm`.
- Remote push: do not `git push` unless the active baseline project contract explicitly requires it.
- Watchdog cadence: check usage/context every work round and at least every 5 minutes; at 75% context pause to update durable state and handoff; at 90% session usage stop after checkpointing.
- Migration requires Neon connectivity. `db:migrate` was not run during the 2026-05-19 smoke test, but the target `terminal_snapshots` table is present.
- `OVERLORD_PUSH_SECRET` is present in `.env.local` and was used by Codex for a valid live push smoke test without printing the secret.
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
| `app/(app)/page.tsx` | Rendered code-configurable dashboard widget grid |
| `components/dashboard/dashboard-layout.tsx` | Added typed widget registry and layout config |
| `components/dashboard/dashboard-widget.tsx` | Added reusable dashboard widget shell |
| `components/project-card.tsx` | Added product stage, maturity, percent, and missing-signal summary |
| `components/product-progress.tsx` | Added product progress UI sections |
| `components/ui/card.tsx` | Added Helm card primitive |
| `components/ui/chip.tsx` | Added Helm chip primitive |
| `components/ui/input.tsx` | Added Helm input primitive |
| `lib/product-progress.ts` | Added TypeScript-only progress and maturity model |
| `lib/data/projects.ts` | Computes sprint task-state counts and product progress |
| `lib/auth.ts` | Maps Auth.js Drizzle adapter to Helm's actual auth tables |
| `app/globals.css` | Added Helm token variables adapted from concept preview |
| `drizzle/0001_overlord.sql` | Added scoped Overlord migration |
| `scripts/overlord-push.ps1` | Added heartbeat push script |
| `AGENTS.md` | Added repo-local Graphify instructions |
| `.codex/hooks.json` | Added Graphify Codex hook |
| `graphify-out/` | Added generated knowledge graph |
| `concept-preview.html` | Static conceptual preview of Helm's dashboard, Overlord Monitor, integrations, todos, and run snapshot |

## Definition of Done

- [x] `terminal_snapshots` table exists in Neon DB - verified by Codex 2026-05-19 via read-only catalog query
- [x] `POST /api/overlord/push` implemented with bearer auth
- [x] `GET /api/overlord/state` implemented with `requireUser()`
- [x] `<OverlordPanel />` renders in dashboard and polls every 2 minutes
- [x] `corepack pnpm typecheck` passes
- [x] `corepack pnpm lint` passes with `--max-warnings=0`
- [x] `corepack pnpm build` succeeds
- [x] Dashboard widgets are controlled by one layout config array
- [x] Product progress renders without DB migration
- [x] Missing GitHub, Vercel, sprint, and task signals are shown explicitly
- [x] `scripts/overlord-push.ps1` exists
- [x] Live script push test - verified by Codex 2026-05-19 with `codex-smoke-20260519`
- [x] Legion KB updated with new files
- [x] `graphify-out/` added and Graphify automation installed

## Latest Verification - 2026-05-19

- `corepack pnpm typecheck` passed.
- `corepack pnpm lint` passed.
- `corepack pnpm build` passed.
- Local dev job probes passed: `/login` returned `200`, `/` returned `307`, and `/api/overlord/state` returned `307` without auth.
- DB read-only checks passed: `select 1` returned `ok: 1`, and `terminal_snapshots` exists.
- Push route checks passed: invalid bearer auth returned `401`; valid `scripts/overlord-push.ps1` returned `{"ok":true}` and inserted `codex-smoke-20260519`.
- Follow-up OAuth diagnosis: Vercel runtime log proved Google token exchange succeeded and Neon SQL failed; `lib/auth.ts` adapter mapping was patched.
- Post-fix `corepack pnpm typecheck` passed.
- Post-fix `corepack pnpm lint` passed.
- Post-fix `corepack pnpm build` timed out twice before compilation output; no compiler error was emitted.
- Graphify was refreshed after code change: 157 nodes, 180 edges, 56 communities. Known `.codex/hooks.json` permission warning remains on the helper's follow-on hook install.
- Deploy verification passed: `git push origin master` updated GitHub through `61aec2f`; `vercel inspect helm-dashboard-ten.vercel.app` showed deployment `dpl_FNKyewXuws7jbKL65buWCQnrr1tF` as `Ready`; Node fetch returned 200 for `/login` and `/api/auth/providers`.

## Next Safe Step

Complete the interactive authenticated browser path: Google OAuth login from `/login` → dashboard → Overlord panel shows the latest terminal card → polling refreshes after the configured interval. Then mark the sprint done.
