# Helm State Aggregator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate Helm with a live cross-project operating picture: all project states, open/working terminals, finished tasks, pending tasks, blockers, and responsibility.

**Architecture:** Helm starts as a read-through aggregator over existing sources of truth, then stores normalized snapshots in its database for fast dashboard rendering. Existing `projects`, `sprints`, `tasks`, `todos`, and `terminal_snapshots` remain the core model; this plan adds ownership/source fields, sync adapters, and dashboard widgets that explain where each state came from.

**Tech Stack:** Next.js 15 App Router, Auth.js, Drizzle ORM, Neon PostgreSQL, Vercel production deployment, existing Overlord heartbeat API, GitHub/Vercel integrations, PowerShell local agent scripts.

---

## Operating Principle

Helm is the command dashboard, not the only system of record.

- GitHub remains the source for repo/PR/deploy-linked work.
- Nexus/Legion task packets and sprint files remain the source for agent-dispatched work.
- Vercel remains the source for deployment state.
- Terminal heartbeats remain the source for live agent presence.
- Helm stores normalized state, responsibility, and dashboard-ready snapshots so the operator has one place to see what is happening.

The first implementation should avoid two-way sync. Writeback can be added later after the dashboard state is trustworthy.

---

## Current Baseline

Already present:

- `projects`: project registry with repo and Vercel fields.
- `sprints`: one open sprint per project.
- `tasks`: task rows with `todo`, `in-progress`, `done`, `blocked`.
- `todos`: user/project reminders.
- `github_repo_snapshots`: open PR count and raw PR metadata.
- `vercel_deployment_snapshots`: latest deploy metadata.
- `terminal_snapshots`: Overlord terminal heartbeat history.
- `scripts/overlord-push.ps1`: local terminal heartbeat sender.
- `components/dashboard/*`: widget layout shell.
- `components/overlord-panel.tsx`: live terminal widget.
- `lib/data/projects.ts`: project summary query and product progress computation.
- `lib/data/overlord.ts`: latest terminal state + history query.

Main gaps:

- No explicit responsibility fields on tasks.
- No normalized source reference for imported work.
- No project-wide queue view aggregating all pending/done/blocked tasks.
- No stale/offline terminal policy.
- No importer for local repos/sprint files/task packets.
- No dashboard widget that joins task state, terminal state, and ownership.

---

## File Structure

| File | Role |
|------|------|
| `lib/db/product-schema.ts` | Add task ownership/source fields |
| `lib/db/overlord-schema.ts` | Optionally extend terminal snapshots with ownership/source metadata |
| `lib/db/schema.ts` | Re-export unchanged schemas after modifications |
| `lib/view-models.ts` | Add queue/responsibility/dashboard state view models |
| `lib/data/operations.ts` | New aggregate query layer for projects/tasks/terminals/responsibility |
| `lib/data/projects.ts` | Reuse current summaries; do not duplicate project progress logic |
| `lib/data/overlord.ts` | Add stale/offline classification helper |
| `app/api/operations/state/route.ts` | Auth-gated API returning global operating state |
| `components/operations/operations-dashboard.tsx` | New top-level operations widget group |
| `components/operations/task-queue-widget.tsx` | Pending/working/done/blocked task widget |
| `components/operations/responsibility-widget.tsx` | Person/agent responsibility matrix |
| `components/operations/project-state-widget.tsx` | All projects with derived health/status |
| `components/operations/terminal-presence-widget.tsx` | Terminal presence grouped by repo/task |
| `scripts/helm-sync-local.ps1` | Local scanner that imports repo/sprint/task state |
| `scripts/overlord-push.ps1` | Extend heartbeat metadata without breaking existing arguments |
| `drizzle/0002_state_aggregator.sql` | Migration for new ownership/source fields |
| `DOCS/sprints/2026-05-19-helm-state-aggregator.md` | Sprint tracker for this phase |

---

## Data Model

### Task Ownership

Add these fields to `tasks`:

```ts
assignee: text("assignee"),
agentRole: text("agent_role"),
source: text("source").default("manual").notNull(),
sourceRef: text("source_ref"),
sourceUrl: text("source_url"),
blockedReason: text("blocked_reason"),
finishedAt: timestamp("finished_at", { mode: "date" }),
```

Meaning:

- `assignee`: human or agent name, such as `Ori`, `Codex`, `Claude`, `Legion`.
- `agentRole`: role context, such as `frontend`, `operator`, `qa`, `planner`.
- `source`: `manual`, `github`, `nexus`, `legion`, `monday`, `vercel`, or `local`.
- `sourceRef`: stable external id, such as issue number, packet id, sprint task id.
- `sourceUrl`: link to GitHub issue/PR, Vercel deployment, or local doc path where applicable.
- `blockedReason`: human-readable blocker shown in the dashboard.
- `finishedAt`: completion timestamp for finished-task reporting.

### Terminal Responsibility

Keep terminal ownership inside `terminal_snapshots.meta` first to avoid another migration:

```json
{
  "assignee": "Codex",
  "sourceRef": "helm-state-aggregator",
  "branch": "master",
  "cwd": "C:\\Users\\OriShavit\\Documents\\GitHub\\Helm-Dashboard",
  "lastCommand": "corepack pnpm lint"
}
```

If this becomes heavily queried, promote `assignee`, `sourceRef`, and `branch` into columns later.

### Derived Status Rules

- Project is `blocked` if any active sprint task is `blocked` or current terminal for that repo is `blocked`.
- Project is `working` if any current terminal for that repo is `active` or any sprint task is `in-progress`.
- Project is `pending` if it has `todo` tasks but no active terminal.
- Project is `healthy/idle` if there are no blockers and no active tasks.
- Terminal is `offline` if latest push is older than the configured threshold, even if latest status says `active`.
- Finished tasks are tasks with `status = done`, sorted by `finishedAt` when present, otherwise `updatedAt`.

---

## Task 1: Add Ownership And Source Fields

**Files:**
- Modify: `lib/db/product-schema.ts`
- Modify: `lib/view-models.ts`
- Create: `drizzle/0002_state_aggregator.sql`

- [ ] **Step 1: Add fields to `lib/db/product-schema.ts`**

Inside the `tasks` table, add:

```ts
  assignee: text("assignee"),
  agentRole: text("agent_role"),
  source: text("source").default("manual").notNull(),
  sourceRef: text("source_ref"),
  sourceUrl: text("source_url"),
  blockedReason: text("blocked_reason"),
  finishedAt: timestamp("finished_at", { mode: "date" }),
```

- [ ] **Step 2: Extend `TaskItem` in `lib/view-models.ts`**

```ts
export type TaskItem = {
  id: string;
  title: string;
  notes: string | null;
  status: "todo" | "in-progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string | null;
  agentRole: string | null;
  source: string;
  sourceRef: string | null;
  sourceUrl: string | null;
  blockedReason: string | null;
  finishedAt: Date | null;
};
```

- [ ] **Step 3: Update task mapping in `lib/data/projects.ts`**

Update the `mapTask` return object:

```ts
  const mapTask = (task: (typeof taskRows)[number]): TaskItem => ({
    id: task.id,
    title: task.title,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    agentRole: task.agentRole,
    source: task.source,
    sourceRef: task.sourceRef,
    sourceUrl: task.sourceUrl,
    blockedReason: task.blockedReason,
    finishedAt: task.finishedAt,
  });
```

- [ ] **Step 4: Create `drizzle/0002_state_aggregator.sql`**

```sql
ALTER TABLE "tasks" ADD COLUMN "assignee" text;
ALTER TABLE "tasks" ADD COLUMN "agent_role" text;
ALTER TABLE "tasks" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;
ALTER TABLE "tasks" ADD COLUMN "source_ref" text;
ALTER TABLE "tasks" ADD COLUMN "source_url" text;
ALTER TABLE "tasks" ADD COLUMN "blocked_reason" text;
ALTER TABLE "tasks" ADD COLUMN "finished_at" timestamp;
```

- [ ] **Step 5: Verify**

```powershell
corepack pnpm typecheck
corepack pnpm lint
```

Expected: both pass.

- [ ] **Step 6: Commit**

```powershell
git add lib/db/product-schema.ts lib/view-models.ts lib/data/projects.ts drizzle/0002_state_aggregator.sql
git commit -m "feat(operations): add task ownership fields"
```

---

## Task 2: Add Global Operating State Query

**Files:**
- Create: `lib/data/operations.ts`
- Modify: `lib/view-models.ts`

- [ ] **Step 1: Add operations view models**

Append to `lib/view-models.ts`:

```ts
export type OperationsTask = TaskItem & {
  projectId: string;
  projectName: string;
  sprintName: string | null;
  updatedAt: Date;
};

export type ResponsibilityBucket = {
  assignee: string;
  activeTerminals: number;
  workingTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  finishedTasks: number;
};

export type OperationsProjectState = ProjectSummary & {
  derivedState: "blocked" | "working" | "pending" | "idle";
  activeTerminalCount: number;
  blockedTaskCount: number;
  pendingTaskCount: number;
  workingTaskCount: number;
  finishedTaskCount: number;
};

export type OperationsState = {
  fetchedAt: Date;
  projects: OperationsProjectState[];
  terminals: OverlordState["terminals"];
  tasks: {
    working: OperationsTask[];
    pending: OperationsTask[];
    blocked: OperationsTask[];
    finished: OperationsTask[];
  };
  responsibility: ResponsibilityBucket[];
};
```

- [ ] **Step 2: Create `lib/data/operations.ts`**

Implement `getOperationsState(userId: string)` by combining:

- `getProjectSummaries(userId)`
- `getOverlordState()`
- all non-deleted tasks for the user's projects

The function must return:

- projects with `derivedState`
- terminals from Overlord
- grouped tasks: `working`, `pending`, `blocked`, `finished`
- responsibility buckets by `assignee`

- [ ] **Step 3: Verify**

```powershell
corepack pnpm typecheck
corepack pnpm lint
```

Expected: both pass.

- [ ] **Step 4: Commit**

```powershell
git add lib/data/operations.ts lib/view-models.ts
git commit -m "feat(operations): aggregate project and task state"
```

---

## Task 3: Add Auth-Gated Operations API

**Files:**
- Create: `app/api/operations/state/route.ts`

- [ ] **Step 1: Create route**

```ts
import { NextResponse } from "next/server";

import { getOperationsState } from "@/lib/data/operations";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const state = await getOperationsState(user.id);
  return NextResponse.json(state);
}
```

- [ ] **Step 2: Verify unauthenticated behavior**

```powershell
node -e "fetch('http://127.0.0.1:3000/api/operations/state',{redirect:'manual'}).then(r=>console.log(r.status, r.headers.get('location')))"
```

Expected: unauthenticated request redirects to `/login` or returns the same auth-gated behavior as `/api/overlord/state`.

- [ ] **Step 3: Static verification**

```powershell
corepack pnpm typecheck
corepack pnpm lint
```

- [ ] **Step 4: Commit**

```powershell
git add app/api/operations/state/route.ts
git commit -m "feat(operations): add state API"
```

---

## Task 4: Extend Terminal Heartbeat Metadata

**Files:**
- Modify: `scripts/overlord-push.ps1`

- [ ] **Step 1: Add optional script parameters**

Add these parameters:

```powershell
  [string]$Assignee = "",
  [string]$SourceRef = "",
  [string]$Branch = "",
  [string]$LastCommand = "",
  [string]$Cwd = (Get-Location).Path,
```

- [ ] **Step 2: Populate `meta` in the payload**

Replace `meta = @{}` with:

```powershell
  meta = @{
    assignee = if ($Assignee) { $Assignee } else { $null }
    sourceRef = if ($SourceRef) { $SourceRef } else { $null }
    branch = if ($Branch) { $Branch } else { $null }
    lastCommand = if ($LastCommand) { $LastCommand } else { $null }
    cwd = if ($Cwd) { $Cwd } else { $null }
  }
```

- [ ] **Step 3: Smoke test local push**

```powershell
.\scripts\overlord-push.ps1 `
  -TerminalId "codex-helm-local" `
  -Label "Helm Dashboard - Codex" `
  -Status active `
  -CurrentTask "state aggregator planning" `
  -Repo "Helm-Dashboard" `
  -AgentRole "codex" `
  -Assignee "Codex" `
  -SourceRef "helm-state-aggregator" `
  -Branch "master"
```

Expected: `[overlord] pushed: {"ok":true}`.

- [ ] **Step 4: Commit**

```powershell
git add scripts/overlord-push.ps1
git commit -m "feat(overlord): enrich terminal heartbeat metadata"
```

---

## Task 5: Build Operations Widgets

**Files:**
- Create: `components/operations/operations-dashboard.tsx`
- Create: `components/operations/task-queue-widget.tsx`
- Create: `components/operations/responsibility-widget.tsx`
- Create: `components/operations/project-state-widget.tsx`
- Create: `components/operations/terminal-presence-widget.tsx`
- Modify: `app/(app)/page.tsx`

- [ ] **Step 1: Create task queue widget**

Create `components/operations/task-queue-widget.tsx` with four compact columns:

- Working
- Blocked
- Pending
- Finished

Each row must show task title, project, assignee, and blocked reason when present.

- [ ] **Step 2: Create responsibility widget**

Create `components/operations/responsibility-widget.tsx` with one row per assignee:

- assignee
- active terminals
- working tasks
- pending tasks
- blocked tasks
- finished tasks

- [ ] **Step 3: Create project state widget**

Create `components/operations/project-state-widget.tsx` with:

- project name
- derived state
- active terminals
- working/pending/blocked/done counts
- product progress stage from existing `productProgress`

- [ ] **Step 4: Create terminal presence widget**

Create `components/operations/terminal-presence-widget.tsx` with:

- terminal label
- status
- repo
- current task
- assignee from `meta.assignee`
- pushed timestamp

- [ ] **Step 5: Create `operations-dashboard.tsx`**

```tsx
import type { OperationsState } from "@/lib/view-models";
import { ProjectStateWidget } from "@/components/operations/project-state-widget";
import { ResponsibilityWidget } from "@/components/operations/responsibility-widget";
import { TaskQueueWidget } from "@/components/operations/task-queue-widget";
import { TerminalPresenceWidget } from "@/components/operations/terminal-presence-widget";

type Props = {
  state: OperationsState;
};

export function OperationsDashboard({ state }: Props) {
  return (
    <section className="space-y-4">
      <ProjectStateWidget projects={state.projects} />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <TaskQueueWidget tasks={state.tasks} />
        <ResponsibilityWidget responsibility={state.responsibility} />
      </div>
      <TerminalPresenceWidget terminals={state.terminals} />
    </section>
  );
}
```

- [ ] **Step 6: Wire into `app/(app)/page.tsx`**

Fetch operations state server-side:

```ts
const operationsState = await getOperationsState(user.id);
```

Render it below the existing dashboard summary:

```tsx
<OperationsDashboard state={operationsState} />
```

- [ ] **Step 7: Verify**

```powershell
corepack pnpm typecheck
corepack pnpm lint
```

Then verify `/` in an authenticated browser.

- [ ] **Step 8: Commit**

```powershell
git add app/(app)/page.tsx components/operations lib/data/operations.ts lib/view-models.ts
git commit -m "feat(operations): add state dashboard widgets"
```

---

## Task 6: Add Local Sync Path

**Files:**
- Create: `scripts/helm-sync-local.ps1`
- Create: `config/helm-projects.example.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create project config example**

`config/helm-projects.example.json`:

```json
{
  "projects": [
    {
      "name": "Helm-Dashboard",
      "path": "C:\\Users\\OriShavit\\Documents\\GitHub\\Helm-Dashboard",
      "repo": "orishavitas/helm-dashboard",
      "vercelProject": "helm-dashboard",
      "owner": "Ori"
    }
  ]
}
```

- [ ] **Step 2: Ignore local real config**

Add to `.gitignore`:

```gitignore
config/helm-projects.local.json
```

- [ ] **Step 3: Create `scripts/helm-sync-local.ps1`**

The first version should:

- Read `config/helm-projects.local.json`.
- For each configured repo, upsert `projects` by name.
- If `DOCS/sprints/*.md` exists, create/update one open sprint by latest sprint file name.
- Parse Markdown checkboxes into `tasks`.
- Preserve manual task edits unless `source = local` and `sourceRef` matches.

Required CLI shape:

```powershell
.\scripts\helm-sync-local.ps1 -Config config\helm-projects.local.json -BaseUrl https://helm-dashboard-ten.vercel.app
```

- [ ] **Step 4: Commit**

```powershell
git add scripts/helm-sync-local.ps1 config/helm-projects.example.json .gitignore
git commit -m "feat(operations): add local project sync config"
```

---

## Task 7: Add Secure Import API

**Files:**
- Modify: `lib/env.ts`
- Create: `app/api/operations/import/route.ts`

- [ ] **Step 1: Add import env parser**

```ts
const operationsImportEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPERATIONS_IMPORT_SECRET: z.string().min(16),
});

export function parseOperationsImportEnv() {
  return operationsImportEnvSchema.parse(process.env);
}
```

- [ ] **Step 2: Create import route**

The route should:

- Require `Authorization: Bearer ${OPERATIONS_IMPORT_SECRET}`.
- Accept normalized project/task payloads only.
- Upsert project rows by owner + name.
- Upsert imported task rows by `source + sourceRef`.
- Never delete tasks in v1; stale detection is safer than destructive sync.

- [ ] **Step 3: Verify invalid auth**

```powershell
node -e "fetch('http://127.0.0.1:3000/api/operations/import',{method:'POST',headers:{authorization:'Bearer wrong'}}).then(r=>console.log(r.status))"
```

Expected: `401`.

- [ ] **Step 4: Commit**

```powershell
git add lib/env.ts app/api/operations/import/route.ts
git commit -m "feat(operations): add secure import endpoint"
```

---

## Task 8: Deploy And Verify

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `TODO.md`
- Modify: `.codex/state/TASK_STATE.md`
- Modify: `.codex/state/LAST_RUN.md`

- [ ] **Step 1: Run static checks**

```powershell
corepack pnpm typecheck
corepack pnpm lint
git diff --check
```

Expected: all pass.

- [ ] **Step 2: Apply migration**

```powershell
corepack pnpm db:migrate
```

Expected: migration applies once. If the table columns already exist, stop and inspect migration state instead of editing blindly.

- [ ] **Step 3: Push terminal heartbeat**

```powershell
.\scripts\overlord-push.ps1 `
  -TerminalId "codex-helm-state-aggregator" `
  -Label "Helm State Aggregator - Codex" `
  -Status active `
  -CurrentTask "operations state verification" `
  -Repo "Helm-Dashboard" `
  -AgentRole "codex" `
  -Assignee "Codex" `
  -SourceRef "helm-state-aggregator"
```

Expected: `{"ok":true}`.

- [ ] **Step 4: Push and verify Vercel**

```powershell
git push origin master
vercel ls helm-dashboard
vercel inspect helm-dashboard-ten.vercel.app
```

Expected: latest production deployment is `Ready` and owns `https://helm-dashboard-ten.vercel.app`.

- [ ] **Step 5: Browser verification**

Open `https://helm-dashboard-ten.vercel.app/login`, sign in, then verify:

- all project states render
- open terminals render
- working tasks render
- finished tasks render
- pending tasks render
- blocked tasks render with reason when present
- responsibility matrix groups work by assignee

---

## Rollout Order

1. Data model ownership fields.
2. Global aggregate query.
3. Auth-gated operations API.
4. Heartbeat metadata enrichment.
5. Dashboard widgets.
6. Local sync script.
7. Secure import endpoint.
8. Migration, deploy, browser verification, and durable status updates.

This order produces usable value after Task 5 even before full local sync automation exists.

---

## Risks And Guardrails

- Do not make Helm the dispatch source for Nexus/Legion work in this phase.
- Do not read monday.com for dispatch. If Monday is used later, treat it as a mirror/status source only.
- Do not delete imported tasks in v1; stale detection is safer than destructive sync.
- Do not commit `config/helm-projects.local.json` or any Vercel/Neon/Auth secrets.
- Keep terminal heartbeat pushes non-fatal; agent work should not fail if Helm is temporarily unavailable.
- Keep widgets compact and operational. This is not a marketing dashboard.

---

## Self-Review

- Spec coverage: covers project states, open terminals, working tasks, finished tasks, pending tasks, blocked tasks, and responsibility.
- Placeholder scan: no open placeholders; local sync parsing is bounded by explicit file/config/API behavior.
- Type consistency: task ownership fields use the same names across schema, view models, query layer, and widgets.
- Scope check: this is one implementation plan with eight sequential tasks. Writeback to external systems is deliberately out of scope.
