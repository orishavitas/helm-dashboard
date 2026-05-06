# Sprint 001 — helm-dashboard
**Goal:** Ship the snapshot refresh pipeline so GitHub and Vercel live data appears in the dashboard.
**Opened:** 2026-05-05
**Closed:** —
**Status:** active

---

## Task 001 — Add snapshot refresh route handlers

**task_id:** codex-helm-dashboard-20260505-1
**role:** codex
**Status:** pending
**Blocked reason:** —

**Objective:**
Create the three missing route handlers that populate the snapshot tables:
1. `GET /api/github/[owner]/[repo]/pulls` — fetch open PRs via GitHub App, upsert into `github_repo_snapshots`
2. `GET /api/github/[owner]/[repo]/commits` — fetch last 10 commits on default branch
3. `GET /api/vercel/deployments/[projectId]` — fetch last 3 deployments, upsert into `vercel_deployment_snapshots`

All three must: authenticate via session, resolve the user's integration credentials, call the external API, write the snapshot row, and return JSON. Cache with `next: { revalidate: 60 }`.

**Acceptance Criteria:**
- [ ] `GET /api/github/[owner]/[repo]/pulls` returns `{ prs: [...], fetchedAt }` and upserts `github_repo_snapshots`
- [ ] `GET /api/github/[owner]/[repo]/commits` returns `{ commits: [...], fetchedAt }`
- [ ] `GET /api/vercel/deployments/[projectId]` returns `{ deployments: [...], fetchedAt }` and upserts `vercel_deployment_snapshots`
- [ ] All three return 401 if no session, 404 if integration not configured
- [ ] `snapshot.status` is set to `"fresh"` on success, `"error"` on failure with `error` field populated
- [ ] TypeScript compiles clean (`corepack pnpm typecheck`)
- [ ] Lint passes (`corepack pnpm lint`)

**Files to create/modify:**
- `app/api/github/[owner]/[repo]/pulls/route.ts` (new)
- `app/api/github/[owner]/[repo]/commits/route.ts` (new)
- `app/api/vercel/deployments/[projectId]/route.ts` (new)
- `lib/integrations/github.ts` — add `getRecentCommits()` function
- `lib/integrations/vercel.ts` — add `getRecentDeployments()` function
- `lib/actions/integrations.ts` — add `refreshGithubSnapshot()` and `refreshVercelSnapshot()` server actions

**Technical notes:**
- GitHub App auth: use `githubForInstallation(installationId)` from `lib/integrations/github.ts`. Get installationId from `userIntegrations` table where `provider = 'github'`.
- Vercel auth: use `lib/security/encryption.ts` to decrypt token from `userIntegrations` where `provider = 'vercel'`.
- Snapshot upsert: Drizzle `.insert().onConflictDoUpdate()` on `projectId` index.
- Snapshot `status` values: `"fresh" | "stale" | "error" | "missing"` (see `lib/db/enums.ts`).

---

## Task 002 — Wire snapshot refresh into project detail page

**task_id:** codex-helm-dashboard-20260505-2
**role:** codex
**Status:** pending
**Blocked reason:** Task 001 must be done first

**Objective:**
On the project detail page (`app/(app)/projects/[id]/page.tsx`), trigger snapshot refresh on load so GitHub and Vercel sections show live data instead of "missing".

**Acceptance Criteria:**
- [ ] When `project.githubRepoOwner` and `project.githubRepoName` are set, a refresh is triggered server-side before render
- [ ] When `project.vercelProjectId` is set, a Vercel snapshot refresh is triggered server-side before render
- [ ] Project detail page shows real PR count, real deployment status after refresh
- [ ] If GitHub App is not installed, section shows "GitHub App not installed" with install link
- [ ] If Vercel token is not set, section shows "Add Vercel token in Settings" CTA
- [ ] TypeScript compiles clean; lint passes

**Files to modify:**
- `app/(app)/projects/[id]/page.tsx` — call refresh actions before rendering
- `lib/data/projects.ts` — `getProjectDetail()` reads fresh snapshot after refresh

---

## Task 003 — Dashboard: trigger snapshot refresh per project on load

**task_id:** codex-helm-dashboard-20260505-3
**role:** codex
**Status:** pending
**Blocked reason:** Task 001 must be done first

**Objective:**
On the dashboard page, trigger parallel snapshot refreshes for all active projects so the project cards show live data.

**Acceptance Criteria:**
- [ ] `getProjectSummaries()` triggers refresh for each linked project in parallel (Promise.all)
- [ ] Dashboard loads in < 3s even with 5 projects (parallel, not sequential)
- [ ] Projects with no GitHub/Vercel link show "Not linked" gracefully
- [ ] TypeScript compiles clean; lint passes

**Files to modify:**
- `app/(app)/page.tsx` — parallel refresh before `getProjectSummaries()`
- `lib/data/projects.ts` — optionally expose refresh-then-read helper

---

## Completion Log

| task_id | status | completed_at | notes |
|---------|--------|-------------|-------|
| — | — | — | — |
