# Sprint 01 â€” Overlord Monitor
**Repo:** helm-dashboard
**Sprint goal:** Build a self-contained Overlord Monitor widget: DB-backed terminal heartbeat store, push/state API endpoints, React Query polling panel, embeddable in any dashboard page, deployed to Vercel.
**Started:** 2026-05-06
**Closed:** BLOCKED on Neon env apply

**Codex execution status (2026-05-06T21:25:54+03:00):** Tasks 1 and 3-11 are implemented locally. Task 2 migration SQL exists, but `corepack pnpm db:migrate` is blocked because this shell has no `DATABASE_URL_UNPOOLED` or `DATABASE_URL`. Live heartbeat push testing is blocked until DB env, `OVERLORD_BASE_URL`, and `OVERLORD_PUSH_SECRET` are available.

---

## Task 1 â€” DB schema: `terminal_snapshots` table + enum

**task_id:** helm-overlord-01
**Type:** code_implementation
**Priority:** P0

**Scope:**
- Add `terminalStatus` pg enum to `lib/db/enums.ts`
- Create `lib/db/overlord-schema.ts` with `terminal_snapshots` table
- Re-export from `lib/db/schema.ts`
- Add `OVERLORD_PUSH_SECRET` to `lib/env.ts` zod schema

**Acceptance criteria:**
- `lib/db/overlord-schema.ts` exports `terminalSnapshots` with columns: id, terminalId, label, status, currentTask, repo, agentRole, contextPct, meta (jsonb), pushedAt
- `lib/db/enums.ts` exports `terminalStatus` pgEnum with values: `active | idle | blocked | done | offline`
- `lib/db/schema.ts` re-exports `overlord-schema`
- `lib/env.ts` envSchema includes `OVERLORD_PUSH_SECRET: z.string().min(16)`
- `corepack pnpm typecheck` passes with no errors

**Status:** done

---

## Task 2 â€” Drizzle migration

**task_id:** helm-overlord-02
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-01

**Scope:**
- Run `corepack pnpm db:generate` to produce migration SQL
- Run `corepack pnpm db:migrate` to apply it to Neon DB

**Acceptance criteria:**
- A new migration file exists under `drizzle/` containing `CREATE TYPE terminal_status` and `CREATE TABLE terminal_snapshots`
- `corepack pnpm db:migrate` exits 0

**Stop condition:** If db:migrate fails due to Neon connection error, write BLOCKED â€” do not retry more than once.

**Status:** blocked - migration SQL generated; `db:migrate` failed because DB URL env vars are empty

---

## Task 3 â€” View models

**task_id:** helm-overlord-03
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-01

**Scope:**
- Append `TerminalSnapshot` and `OverlordState` types to `lib/view-models.ts`

**Acceptance criteria:**
- `lib/view-models.ts` exports `TerminalSnapshot` with fields: id, terminalId, label, status (union of 5 values), currentTask, repo, agentRole, contextPct, meta, pushedAt
- `lib/view-models.ts` exports `OverlordState` with fields: terminals (array of `{ current: TerminalSnapshot; history: TerminalSnapshot[] }`), fetchedAt
- `corepack pnpm typecheck` passes

**Status:** done

---

## Task 4 â€” Data layer: `lib/data/overlord.ts`

**task_id:** helm-overlord-04
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-01, helm-overlord-03

**Scope:**
- Create `lib/data/overlord.ts` exporting `getOverlordState(): Promise<OverlordState>`
- Query: for each distinct `terminalId`, fetch the most recent snapshot (current) + up to 5 previous (history), ordered by pushedAt DESC

**Acceptance criteria:**
- `getOverlordState()` returns `{ terminals: [...], fetchedAt: Date }` with correct shape
- Returns empty `terminals: []` if table is empty (no crash)
- `corepack pnpm typecheck` passes

**Implementation note:** Use `DISTINCT ON (terminal_id)` subquery pattern (Postgres/Neon). `toSnapshot()` helper converts DB row â†’ `TerminalSnapshot`.

**Status:** done

---

## Task 5 â€” Push API: `POST /api/overlord/push`

**task_id:** helm-overlord-05
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-01

**Scope:**
- Create `app/api/overlord/push/route.ts`
- Auth: `Authorization: Bearer <OVERLORD_PUSH_SECRET>` header check
- Zod validate body; insert one row into `terminal_snapshots`
- Return `{ ok: true }` on success

**Acceptance criteria:**
- POST with valid bearer token and valid body returns 200 `{ ok: true }` and inserts a row
- POST with wrong/missing token returns 401
- POST with invalid body returns 422 with zod error details
- `corepack pnpm typecheck` passes

**Body schema:** `{ terminalId, label, status, currentTask?, repo?, agentRole?, contextPct?, meta? }`

**Status:** done

---

## Task 6 â€” State API: `GET /api/overlord/state`

**task_id:** helm-overlord-06
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-03, helm-overlord-04

**Scope:**
- Create `app/api/overlord/state/route.ts`
- Auth gate: call `requireUser()` â€” unauthenticated requests get redirected/401
- Call `getOverlordState()` and return as JSON
- Mark `dynamic = "force-dynamic"` and `revalidate = 0`

**Acceptance criteria:**
- GET returns JSON matching `OverlordState` shape
- Unauthenticated request does not return data (redirected to login or 401)
- `corepack pnpm typecheck` passes

**Status:** done

---

## Task 7 â€” Terminal card component

**task_id:** helm-overlord-07
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-03

**Scope:**
- Create `components/overlord-terminal-card.tsx`
- Props: `{ current: TerminalSnapshot; history: TerminalSnapshot[] }`
- Show: label, terminalId, status badge (colored), currentTask, repo, agentRole, contextPct (amber at â‰¥80%), pushedAt (relative time), history list (last N status + task + relative time)

**Acceptance criteria:**
- Component renders without error in RSC or client context
- `corepack pnpm typecheck` passes
- Status colors: active=green, blocked=amber, idle/done/offline=zinc (matches existing `Badge` tone prop pattern)
- Context % text turns amber when `contextPct >= 80`
- History section only renders when `history.length > 0`

**Implementation note:** Use existing `Badge` from `components/ui/badge.tsx` and `formatRelativeTime` from `lib/utils.ts`. Icons from `lucide-react`.

**Status:** done

---

## Task 8 â€” Overlord panel widget

**task_id:** helm-overlord-08
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-06, helm-overlord-07

**Scope:**
- Create `components/overlord-panel.tsx` as a `"use client"` component
- Uses `useQuery` from `@tanstack/react-query` to poll `/api/overlord/state` every 2 minutes
- Deserializes `pushedAt` and `fetchedAt` Date strings from JSON
- Loading state, error state, empty state, populated state (grid of `<OverlordTerminalCard>`)
- Shows last poll time and poll interval note

**Acceptance criteria:**
- Component is fully self-contained â€” single import `<OverlordPanel />` drops into any page
- Poll interval is `2 * 60 * 1000` ms (2 minutes)
- `staleTime` matches `refetchInterval`
- `corepack pnpm typecheck` passes
- No prop drilling â€” fetches its own data

**Status:** done

---

## Task 9 â€” Wire into dashboard page

**task_id:** helm-overlord-09
**Type:** code_implementation
**Priority:** P0
**Depends on:** helm-overlord-08

**Scope:**
- Import `<OverlordPanel />` in `app/(app)/page.tsx`
- Render it above the existing `<header>` block inside the top-level grid div

**Acceptance criteria:**
- `app/(app)/page.tsx` imports and renders `<OverlordPanel />`
- `corepack pnpm typecheck` passes
- `corepack pnpm lint` passes (--max-warnings=0)
- `corepack pnpm build` completes successfully

**Status:** done

---

## Task 10 â€” PowerShell push script

**task_id:** helm-overlord-10
**Type:** code_implementation
**Priority:** P1
**Depends on:** helm-overlord-05

**Scope:**
- Create `scripts/overlord-push.ps1`
- Params: `TerminalId`, `Label`, `Status`, `CurrentTask?`, `Repo?`, `AgentRole?`, `ContextPct?`, `BaseUrl` (default `$env:OVERLORD_BASE_URL`), `Secret` (default `$env:OVERLORD_PUSH_SECRET`)
- POST to `$BaseUrl/api/overlord/push` with `Authorization: Bearer $Secret`
- Print `[overlord] pushed: ...` on success; `Write-Warning` on failure (non-fatal)

**Acceptance criteria:**
- Script exists at `scripts/overlord-push.ps1`
- Missing `BaseUrl` or `Secret` exits with clear error message
- Script can be invoked as: `.\scripts\overlord-push.ps1 -TerminalId "test-1" -Label "Test" -Status active`
- No hard-coded secrets

**Status:** done

---

## Task 11 â€” KB update

**task_id:** helm-overlord-11
**Type:** documentation
**Priority:** P1
**Depends on:** helm-overlord-09

**Scope:**
- Update `legion-swarm/agents/kb/helm-dashboard.md`:
  - Add `overlord-schema.ts` to Repo Layout â†’ `lib/db/`
  - Add `lib/data/overlord.ts` to Key Files table
  - Add `app/api/overlord/` routes to Repo Layout â†’ `app/api/`
  - Add `components/overlord-panel.tsx` and `overlord-terminal-card.tsx` to `components/`
  - Add `OVERLORD_PUSH_SECRET` and `OVERLORD_BASE_URL` to Known Issues / env vars section
  - Remove "No tests exist yet" gotcha if tests were added; otherwise keep

**Acceptance criteria:**
- KB accurately reflects all new files created in this sprint
- No stale references

**Status:** done
