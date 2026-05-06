# Overlord Monitor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A self-contained "Overlord" widget that polls active agent terminal sessions every N minutes, stores a history of observed states, and renders a live status panel — deployable to Vercel, embeddable in any dashboard page.

**Architecture:** A new DB table (`terminal_snapshots`) holds the heartbeat state for each named terminal. A cheap POST endpoint (`/api/overlord/push`) accepts pushes from running agents (or scripts). A GET endpoint (`/api/overlord/state`) returns the current + last N snapshots per terminal. A React widget (`<OverlordPanel>`) polls `/api/overlord/state` client-side via React Query and renders a compact card grid — it is fully standalone and can be dropped into any page with one import.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM + Neon PostgreSQL (existing), React Query (existing), Zod, Tailwind CSS, lucide-react.

---

## File Structure

| File | Role |
|------|------|
| `lib/db/overlord-schema.ts` | Drizzle table: `terminal_snapshots` |
| `lib/db/schema.ts` | Re-export new schema |
| `lib/db/enums.ts` | Add `terminalStatus` pg enum |
| `lib/view-models.ts` | Add `TerminalSnapshot`, `OverlordState` types |
| `lib/data/overlord.ts` | DB read: fetch current + history per terminal |
| `app/api/overlord/push/route.ts` | POST — agents push heartbeat JSON |
| `app/api/overlord/state/route.ts` | GET — dashboard polls this |
| `components/overlord-panel.tsx` | Standalone client widget |
| `components/overlord-terminal-card.tsx` | Single terminal card |
| `drizzle/0001_overlord.sql` | Migration SQL |
| `lib/env.ts` | Add `OVERLORD_PUSH_SECRET` |

---

## Task 1: DB Schema — `terminal_snapshots` table

**Files:**
- Create: `lib/db/overlord-schema.ts`
- Modify: `lib/db/enums.ts`
- Modify: `lib/db/schema.ts`
- Modify: `lib/env.ts`

- [ ] **Step 1: Add `terminalStatus` enum to `lib/db/enums.ts`**

Open `lib/db/enums.ts`. Add at the bottom:

```typescript
export const terminalStatus = pgEnum("terminal_status", [
  "active",
  "idle",
  "blocked",
  "done",
  "offline",
]);
```

- [ ] **Step 2: Create `lib/db/overlord-schema.ts`**

```typescript
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { terminalStatus } from "@/lib/db/enums";

export const terminalSnapshots = pgTable("terminal_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  terminalId: text("terminal_id").notNull(),
  label: text("label").notNull(),
  status: terminalStatus("status").default("offline").notNull(),
  currentTask: text("current_task"),
  repo: text("repo"),
  agentRole: text("agent_role"),
  contextPct: integer("context_pct"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}).notNull(),
  pushedAt: timestamp("pushed_at", { mode: "date" }).defaultNow().notNull(),
});
```

**Column notes:**
- `terminalId` — stable identifier (e.g. `"codex-helm-1"`). Not unique — every push is a new row (history).
- `label` — human display name (e.g. `"Helm Dashboard — Codex"`).
- `contextPct` — watchdog context percentage, optional.
- `meta` — arbitrary JSON bag for future extensions.
- `pushedAt` — when the agent pushed this snapshot.

- [ ] **Step 3: Re-export from `lib/db/schema.ts`**

Add to `lib/db/schema.ts`:

```typescript
export * from "@/lib/db/overlord-schema";
```

- [ ] **Step 4: Add env var to `lib/env.ts`**

In `envSchema`, add:

```typescript
OVERLORD_PUSH_SECRET: z.string().min(16),
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/overlord-schema.ts lib/db/enums.ts lib/db/schema.ts lib/env.ts
git commit -m "feat(overlord): add terminal_snapshots schema and push secret env"
```

---

## Task 2: Drizzle Migration

**Files:**
- Create: `drizzle/0001_overlord.sql`

- [ ] **Step 1: Generate migration**

```bash
cd Helm-Dashboard
pnpm db:generate
```

Expected: a new file `drizzle/0001_overlord.sql` (or next available number) is created containing `CREATE TYPE terminal_status` and `CREATE TABLE terminal_snapshots`.

- [ ] **Step 2: Verify the generated SQL looks correct**

Open the generated migration file. It should contain:

```sql
CREATE TYPE "public"."terminal_status" AS ENUM('active', 'idle', 'blocked', 'done', 'offline');

CREATE TABLE "terminal_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "terminal_id" text NOT NULL,
  "label" text NOT NULL,
  "status" "terminal_status" DEFAULT 'offline' NOT NULL,
  "current_task" text,
  "repo" text,
  "agent_role" text,
  "context_pct" integer,
  "meta" jsonb DEFAULT '{}' NOT NULL,
  "pushed_at" timestamp DEFAULT now() NOT NULL
);
```

- [ ] **Step 3: Run migration against Neon DB**

```bash
pnpm db:migrate
```

Expected: `[✓] migrations applied` with no errors.

- [ ] **Step 4: Commit**

```bash
git add drizzle/
git commit -m "feat(overlord): run migration for terminal_snapshots"
```

---

## Task 3: View Models

**Files:**
- Modify: `lib/view-models.ts`

- [ ] **Step 1: Add `TerminalSnapshot` and `OverlordState` types**

Append to `lib/view-models.ts`:

```typescript
export type TerminalSnapshot = {
  id: string;
  terminalId: string;
  label: string;
  status: "active" | "idle" | "blocked" | "done" | "offline";
  currentTask: string | null;
  repo: string | null;
  agentRole: string | null;
  contextPct: number | null;
  meta: Record<string, unknown>;
  pushedAt: Date;
};

export type OverlordState = {
  terminals: {
    current: TerminalSnapshot;
    history: TerminalSnapshot[];
  }[];
  fetchedAt: Date;
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/view-models.ts
git commit -m "feat(overlord): add TerminalSnapshot and OverlordState view models"
```

---

## Task 4: Data Layer — `lib/data/overlord.ts`

**Files:**
- Create: `lib/data/overlord.ts`

- [ ] **Step 1: Create the data query**

```typescript
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { terminalSnapshots } from "@/lib/db/schema";
import type { OverlordState, TerminalSnapshot } from "@/lib/view-models";

const HISTORY_DEPTH = 5;

function toSnapshot(row: typeof terminalSnapshots.$inferSelect): TerminalSnapshot {
  return {
    id: row.id,
    terminalId: row.terminalId,
    label: row.label,
    status: row.status,
    currentTask: row.currentTask,
    repo: row.repo,
    agentRole: row.agentRole,
    contextPct: row.contextPct,
    meta: row.meta as Record<string, unknown>,
    pushedAt: row.pushedAt,
  };
}

export async function getOverlordState(): Promise<OverlordState> {
  const db = getDb();

  // Get most recent snapshot per terminal_id using a subquery
  const latestIds = db
    .select({
      id: sql<string>`DISTINCT ON (${terminalSnapshots.terminalId}) ${terminalSnapshots.id}`,
    })
    .from(terminalSnapshots)
    .orderBy(terminalSnapshots.terminalId, desc(terminalSnapshots.pushedAt))
    .as("latest");

  const current = await db
    .select()
    .from(terminalSnapshots)
    .where(eq(terminalSnapshots.id, sql`ANY(SELECT id FROM ${latestIds})`))
    .orderBy(desc(terminalSnapshots.pushedAt));

  const terminals = await Promise.all(
    current.map(async (row) => {
      const history = await db
        .select()
        .from(terminalSnapshots)
        .where(eq(terminalSnapshots.terminalId, row.terminalId))
        .orderBy(desc(terminalSnapshots.pushedAt))
        .offset(1)
        .limit(HISTORY_DEPTH);

      return {
        current: toSnapshot(row),
        history: history.map(toSnapshot),
      };
    }),
  );

  return { terminals, fetchedAt: new Date() };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/data/overlord.ts
git commit -m "feat(overlord): add getOverlordState data query"
```

---

## Task 5: Push API Route — `POST /api/overlord/push`

**Files:**
- Create: `app/api/overlord/push/route.ts`

This endpoint is called by agents/scripts to push a terminal heartbeat. It uses a shared secret in the `Authorization` header (`Bearer <OVERLORD_PUSH_SECRET>`).

- [ ] **Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { terminalSnapshots } from "@/lib/db/schema";
import { parseEnv } from "@/lib/env";

const pushSchema = z.object({
  terminalId: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  status: z.enum(["active", "idle", "blocked", "done", "offline"]),
  currentTask: z.string().max(256).nullish(),
  repo: z.string().max(128).nullish(),
  agentRole: z.string().max(64).nullish(),
  contextPct: z.number().int().min(0).max(100).nullish(),
  meta: z.record(z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  const env = parseEnv();
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${env.OVERLORD_PUSH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  await getDb().insert(terminalSnapshots).values({
    terminalId: data.terminalId,
    label: data.label,
    status: data.status,
    currentTask: data.currentTask ?? null,
    repo: data.repo ?? null,
    agentRole: data.agentRole ?? null,
    contextPct: data.contextPct ?? null,
    meta: data.meta,
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/overlord/push/route.ts
git commit -m "feat(overlord): add POST /api/overlord/push endpoint"
```

---

## Task 6: State API Route — `GET /api/overlord/state`

**Files:**
- Create: `app/api/overlord/state/route.ts`

This endpoint is polled by the React widget. It requires the user to be authenticated (reuses the existing `requireUser` session check).

- [ ] **Step 1: Create the route**

```typescript
import { NextResponse } from "next/server";
import { getOverlordState } from "@/lib/data/overlord";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await requireUser();
  const state = await getOverlordState();
  return NextResponse.json(state);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/overlord/state/route.ts
git commit -m "feat(overlord): add GET /api/overlord/state endpoint"
```

---

## Task 7: Terminal Card Component

**Files:**
- Create: `components/overlord-terminal-card.tsx`

- [ ] **Step 1: Create the card**

```typescript
import { Activity, AlertTriangle, CheckCircle, Clock, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { TerminalSnapshot } from "@/lib/view-models";

const STATUS_ICON = {
  active: <Activity className="h-3.5 w-3.5 text-emerald-400" />,
  idle: <Clock className="h-3.5 w-3.5 text-zinc-400" />,
  blocked: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
  done: <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />,
  offline: <WifiOff className="h-3.5 w-3.5 text-zinc-600" />,
} as const;

const STATUS_TONE = {
  active: "green",
  idle: "zinc",
  blocked: "amber",
  done: "zinc",
  offline: "zinc",
} as const satisfies Record<TerminalSnapshot["status"], "green" | "amber" | "zinc">;

type Props = {
  current: TerminalSnapshot;
  history: TerminalSnapshot[];
};

export function OverlordTerminalCard({ current, history }: Props) {
  return (
    <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-50">{current.label}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{current.terminalId}</p>
        </div>
        <Badge tone={STATUS_TONE[current.status]}>
          <span className="flex items-center gap-1">
            {STATUS_ICON[current.status]}
            {current.status}
          </span>
        </Badge>
      </div>

      {current.currentTask && (
        <p className="line-clamp-2 text-xs text-zinc-300">{current.currentTask}</p>
      )}

      <div className="grid grid-cols-2 gap-1 text-xs text-zinc-500">
        {current.repo && <span>repo: {current.repo}</span>}
        {current.agentRole && <span>role: {current.agentRole}</span>}
        {current.contextPct != null && (
          <span className={current.contextPct >= 80 ? "text-amber-400" : ""}>
            ctx: {current.contextPct}%
          </span>
        )}
        <span className="col-span-2 text-right">{formatRelativeTime(current.pushedAt)}</span>
      </div>

      {history.length > 0 && (
        <ol className="grid gap-1 border-t border-zinc-800 pt-2">
          {history.map((snap) => (
            <li key={snap.id} className="flex items-center justify-between gap-2 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                {STATUS_ICON[snap.status]}
                {snap.status}
                {snap.currentTask ? ` — ${snap.currentTask.slice(0, 40)}` : ""}
              </span>
              <span>{formatRelativeTime(snap.pushedAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/overlord-terminal-card.tsx
git commit -m "feat(overlord): add OverlordTerminalCard component"
```

---

## Task 8: Overlord Panel Widget

**Files:**
- Create: `components/overlord-panel.tsx`

This is the **self-contained, embeddable widget**. It polls `/api/overlord/state` via React Query. Drop `<OverlordPanel />` anywhere.

- [ ] **Step 1: Create the panel**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { Monitor } from "lucide-react";
import { OverlordTerminalCard } from "@/components/overlord-terminal-card";
import type { OverlordState } from "@/lib/view-models";

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes — cheap, not real-time

async function fetchOverlordState(): Promise<OverlordState> {
  const res = await fetch("/api/overlord/state");
  if (!res.ok) throw new Error(`overlord state fetch failed: ${res.status}`);
  const data = await res.json();
  // Deserialize Date strings
  return {
    ...data,
    fetchedAt: new Date(data.fetchedAt),
    terminals: data.terminals.map((t: { current: OverlordState["terminals"][number]["current"]; history: OverlordState["terminals"][number]["history"] }) => ({
      current: { ...t.current, pushedAt: new Date(t.current.pushedAt) },
      history: t.history.map((h: OverlordState["terminals"][number]["history"][number]) => ({ ...h, pushedAt: new Date(h.pushedAt) })),
    })),
  };
}

export function OverlordPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["overlord-state"],
    queryFn: fetchOverlordState,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });

  return (
    <section className="grid gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Monitor className="h-4 w-4 text-indigo-300" />
        Overlord — Active Terminals
      </div>

      {isLoading && (
        <p className="text-xs text-zinc-500">Loading terminal state…</p>
      )}

      {isError && (
        <p className="text-xs text-red-400">Failed to load terminal state.</p>
      )}

      {data && data.terminals.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          No terminals reporting. Push a heartbeat to <code>/api/overlord/push</code>.
        </div>
      )}

      {data && data.terminals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.terminals.map(({ current, history }) => (
            <OverlordTerminalCard
              key={current.terminalId}
              current={current}
              history={history}
            />
          ))}
        </div>
      )}

      {data && (
        <p className="text-right text-xs text-zinc-600">
          Polled every 2 min · Last: {data.fetchedAt.toLocaleTimeString()}
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/overlord-panel.tsx
git commit -m "feat(overlord): add OverlordPanel client widget"
```

---

## Task 9: Wire into Dashboard Page

**Files:**
- Modify: `app/(app)/page.tsx`

- [ ] **Step 1: Import and render `<OverlordPanel>` in the dashboard**

In `app/(app)/page.tsx`, add the import:

```typescript
import { OverlordPanel } from "@/components/overlord-panel";
```

Then add it inside the `<div className="grid gap-6 p-4 md:p-6">`, just before the `<header>` block or after the main grid:

```tsx
<OverlordPanel />
```

The full updated return should look like:

```tsx
return (
  <div className="grid gap-6 p-4 md:p-6">
    <OverlordPanel />
    <header className="flex flex-wrap items-end justify-between gap-4">
      ...
    </header>
    ...
  </div>
);
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/page.tsx
git commit -m "feat(overlord): wire OverlordPanel into dashboard home"
```

---

## Task 10: Env + Vercel Config

**Files:**
- No code changes — env var wiring

- [ ] **Step 1: Add `OVERLORD_PUSH_SECRET` to local `.env`**

Generate a secret and add to `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output. Add to `.env`:

```
OVERLORD_PUSH_SECRET=<paste-generated-secret>
```

- [ ] **Step 2: Add to Vercel project env vars**

In Vercel dashboard → project → Settings → Environment Variables, add:

```
OVERLORD_PUSH_SECRET = <same secret>
```

Set for Production + Preview + Development.

- [ ] **Step 3: Verify typecheck and build pass**

```bash
pnpm typecheck
pnpm build
```

Expected: both complete with no errors.

- [ ] **Step 4: Deploy to Vercel**

```bash
git push
```

Expected: Vercel auto-deploy triggers, build passes, new `/api/overlord/push` and `/api/overlord/state` routes are live.

---

## Task 11: Agent Push Script (PowerShell)

**Files:**
- Create: `scripts/overlord-push.ps1`

This is the script agents/Codex call to push a heartbeat. Drop it in `legion-swarm/scripts/` or call it from any agent session.

- [ ] **Step 1: Create the script**

```powershell
# overlord-push.ps1
# Usage: .\overlord-push.ps1 -TerminalId "codex-helm-1" -Label "Helm Dashboard — Codex" -Status active -CurrentTask "implementing overlord" -Repo "Helm-Dashboard" -AgentRole "coder" -ContextPct 42
param(
  [Parameter(Mandatory)][string]$TerminalId,
  [Parameter(Mandatory)][string]$Label,
  [Parameter(Mandatory)][ValidateSet("active","idle","blocked","done","offline")][string]$Status,
  [string]$CurrentTask = "",
  [string]$Repo = "",
  [string]$AgentRole = "",
  [int]$ContextPct = -1,
  [string]$BaseUrl = $env:OVERLORD_BASE_URL,
  [string]$Secret = $env:OVERLORD_PUSH_SECRET
)

if (-not $BaseUrl) { Write-Error "OVERLORD_BASE_URL not set"; exit 1 }
if (-not $Secret)  { Write-Error "OVERLORD_PUSH_SECRET not set"; exit 1 }

$body = @{
  terminalId  = $TerminalId
  label       = $Label
  status      = $Status
  currentTask = if ($CurrentTask) { $CurrentTask } else { $null }
  repo        = if ($Repo)        { $Repo }        else { $null }
  agentRole   = if ($AgentRole)   { $AgentRole }   else { $null }
  contextPct  = if ($ContextPct -ge 0) { $ContextPct } else { $null }
  meta        = @{}
} | ConvertTo-Json

try {
  $response = Invoke-RestMethod `
    -Uri "$BaseUrl/api/overlord/push" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $Secret"; "Content-Type" = "application/json" } `
    -Body $body
  Write-Host "[overlord] pushed: $($response | ConvertTo-Json -Compress)"
} catch {
  Write-Warning "[overlord] push failed (non-fatal): $_"
}
```

- [ ] **Step 2: Copy to legion-swarm scripts**

```bash
cp Helm-Dashboard/scripts/overlord-push.ps1 legion-swarm/scripts/overlord-push.ps1
```

- [ ] **Step 3: Set env vars for local use**

Add to your shell profile or `.env`:

```
OVERLORD_BASE_URL=https://<your-vercel-url>
OVERLORD_PUSH_SECRET=<same secret as above>
```

- [ ] **Step 4: Test a push**

```powershell
.\scripts\overlord-push.ps1 `
  -TerminalId "test-terminal-1" `
  -Label "Test Terminal" `
  -Status active `
  -CurrentTask "testing overlord push" `
  -Repo "Helm-Dashboard" `
  -AgentRole "coder" `
  -ContextPct 12
```

Expected output: `[overlord] pushed: {"ok":true}`

Then open the dashboard — the terminal card should appear within the next poll (or immediately on page load).

- [ ] **Step 5: Commit**

```bash
git add scripts/overlord-push.ps1
git commit -m "feat(overlord): add PowerShell push script for agent heartbeats"
```

---

## Self-Review

**Spec coverage:**
- ✅ Cheap call every X minutes — React Query `refetchInterval: 2 * 60 * 1000`, server-side is a single indexed query
- ✅ Log of previous known states — `history` field (last 5 snapshots per terminal)
- ✅ Standalone / embeddable — `<OverlordPanel />` is a single import, no page-level coupling
- ✅ Stored online in Vercel — Neon DB (existing), deployed via git push
- ✅ Agent push mechanism — `overlord-push.ps1` + `/api/overlord/push` with shared secret auth
- ✅ Context % surfaced — `contextPct` field, amber color at ≥80%

**Gaps / notes:**
- The `DISTINCT ON` query in `getOverlordState` is Postgres-specific (fine — already on Neon/Postgres). If the query needs tuning, add an index on `(terminal_id, pushed_at DESC)` — not included here because Drizzle doesn't support partial indexes easily; add it manually in a follow-up migration if needed.
- Poll interval is hardcoded at 2 minutes in the widget. To make it configurable, pass a `pollIntervalMs` prop to `<OverlordPanel pollIntervalMs={5 * 60 * 1000} />` — simple prop addition, not in scope unless needed.
- No pruning of old snapshots — the table will grow indefinitely. A cron to delete rows older than 7 days is a natural follow-up.
