# Graph Report - C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator  (2026-05-19)

## Corpus Check
- 74 files · ~44,041 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 165 nodes · 196 edges · 57 communities detected
- Extraction: 59% EXTRACTED · 41% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 27 edges
2. `GET()` - 20 edges
3. `requireUser()` - 20 edges
4. `assertProjectOwner()` - 13 edges
5. `getOperationsState()` - 8 edges
6. `refreshProjectSnapshots()` - 7 edges
7. `computeProductProgress()` - 6 edges
8. `POST()` - 5 edges
9. `connectVercelToken()` - 5 edges
10. `linkProjectRepo()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `ProtectedLayout()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\app\(app)\layout.tsx → C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\lib\session.ts
- `GET()` --calls--> `listVercelProjects()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\app\api\vercel\projects\route.ts → C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\lib\integrations\vercel.ts
- `DashboardPage()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\app\(app)\page.tsx → C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\lib\session.ts
- `SettingsPage()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\app\(app)\settings\page.tsx → C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\lib\session.ts
- `SettingsPage()` --calls--> `getProjectSummaries()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\app\(app)\settings\page.tsx → C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\.worktrees\state-aggregator\lib\data\projects.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (20): getDb(), connectVercelToken(), linkProjectRepo(), linkVercelProject(), refreshGithub(), refreshProjectSnapshots(), refreshVercel(), assertProjectOwner() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (6): assigneeName(), getOperationsState(), getResponsibilityBucket(), terminalAssignee(), getOverlordState(), GET()

### Community 2 - "Community 2"
Cohesion: 0.31
Nodes (7): getOpenPullRequests(), githubForInstallation(), githubInstallUrl(), listInstallationRepos(), privateKey(), safeGithubUrl(), SettingsPage()

### Community 3 - "Community 3"
Cohesion: 0.28
Nodes (6): DashboardPage(), deploymentField(), getProjectDetail(), getProjectSummaries(), toSummary(), getGlobalTodos()

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (3): parseEnv(), parseOverlordPushEnv(), POST()

### Community 5 - "Community 5"
Cohesion: 0.6
Nodes (5): computeProductProgress(), maturityFromSignals(), providerLabel(), scoreProvider(), stageFromPercent()

### Community 6 - "Community 6"
Cohesion: 0.5
Nodes (4): apiBase(), latestVercelDeployment(), listVercelProjects(), vercelFetch()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (0):

### Community 8 - "Community 8"
Cohesion: 0.83
Nodes (3): decryptSecret(), encryptSecret(), keyFromEnv()

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (2): deserializeState(), fetchOverlordState()

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (0):

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (0):

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (0):

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (0):

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (0):

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0):

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): ProtectedLayout()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0):

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0):

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0):

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0):

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0):

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0):

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0):

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0):

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0):

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0):

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0):

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0):

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0):

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0):

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0):

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0):

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0):

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0):

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0):

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0):

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0):

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0):

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0):

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0):

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0):

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0):

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0):

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0):

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0):

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0):

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0):

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0):

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0):

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0):

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0):

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0):

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0):

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0):

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0):

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0):

## Knowledge Gaps
- **Thin community `Community 15`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `layout.tsx`, `ProtectedLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `page.tsx`, `LoginPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `AppShell()`, `app-shell.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `query-provider.tsx`, `QueryProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `dashboard-widget.tsx`, `DashboardWidget()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `project-form.tsx`, `ProjectForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `sprint-form.tsx`, `SprintForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `todo-form.tsx`, `TodoForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `Badge()`, `badge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `Button()`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `card.tsx`, `Card()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `chip.tsx`, `Chip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `input.tsx`, `Input()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `select-field.tsx`, `SelectField()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `text-field.tsx`, `TextField()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `index.ts`, `hasDatabaseUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `product-progress.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `todo-list.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `task-form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `view-models.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `auth-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `enums.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `integration-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `overlord-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `product-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `codex-dialogue-check.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `codex-handoff.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `codex-watchdog-check.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `overlord-push.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `next-auth.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 31`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `requireUser()` connect `Community 0` to `Community 16`, `Community 1`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `getDb()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`getDb()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `GET()` (e.g. with `requireUser()` and `getDb()`) actually correct?**
  _`GET()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `requireUser()` (e.g. with `ProtectedLayout()` and `DashboardPage()`) actually correct?**
  _`requireUser()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `assertProjectOwner()` (e.g. with `getDb()` and `linkProjectRepo()`) actually correct?**
  _`assertProjectOwner()` has 12 INFERRED edges - model-reasoned connections that need verification._
