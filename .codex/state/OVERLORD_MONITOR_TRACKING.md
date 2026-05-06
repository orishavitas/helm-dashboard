# Overlord Monitor Tracking - Helm-Dashboard

Updated: 2026-05-06T21:25:54+03:00
Repo: `C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard`

## Concept

Overlord Monitor is a self-contained authenticated dashboard widget. Agent terminals push heartbeat snapshots to a shared-secret endpoint. The dashboard polls state every 2 minutes and renders current terminal status plus recent history.

## Implementation

- DB: `lib/db/overlord-schema.ts` defines `terminal_snapshots`; `lib/db/enums.ts` defines `terminal_status`.
- Migration: `drizzle/0001_overlord.sql` creates the enum and table only.
- API: `app/api/overlord/push/route.ts` validates bearer auth and inserts snapshots.
- API: `app/api/overlord/state/route.ts` requires a user and returns `OverlordState`.
- Data: `lib/data/overlord.ts` selects latest snapshot per terminal and five previous entries.
- UI: `components/overlord-panel.tsx` polls via React Query every `2 * 60 * 1000`.
- UI: `components/overlord-terminal-card.tsx` shows status, task, repo, role, context percentage, relative time, and history.
- Script: `scripts/overlord-push.ps1` posts heartbeats without hard-coded secrets.
- Graphify: `graphify-out/` generated, `AGENTS.md` installed, `.codex/hooks.json` installed, git hooks installed.

## Verification / Tests

- Passed: `corepack pnpm typecheck`.
- Passed: `corepack pnpm lint`.
- Passed: `corepack pnpm build`.
- Passed: `graphify update .`.
- Blocked: `corepack pnpm db:migrate`, because DB URL env vars are empty.
- Blocked: live heartbeat push, because script needs `OVERLORD_BASE_URL`, `OVERLORD_PUSH_SECRET`, and migrated DB.

## Failures

- `corepack pnpm db:generate` produced an unsafe full-schema migration due missing Drizzle meta for the hand-written foundation migration. Replaced with manual scoped migration.
- Initial sandboxed migration attempt failed with `spawn EPERM`; escalated local run then exposed the real blocker: missing DB URL.

## Local Commits

- `da21611` schema/env
- `03fc699` view models
- `bd6148a` data query
- `5cce309` push endpoint
- `d6c84dd` state endpoint
- `e64c574` terminal card
- `a5ce2db` polling panel
- `da1862e` dashboard wiring
- `76b5d4b` migration
- `121837d` push script/docs

## Remaining Risk

- Database table is not applied in Neon yet.
- Live endpoint behavior is not proven with real DB credentials.
- `helm-dev.out.log` remains dirty from unrelated dev-server output.
