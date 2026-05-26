# Graph Report - C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard  (2026-05-26)

## Corpus Check
- 92 files Â· ~60,344 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 231 nodes Â· 300 edges Â· 63 communities detected
- Extraction: 66% EXTRACTED Â· 34% INFERRED Â· 0% AMBIGUOUS Â· INFERRED: 101 edges (avg confidence: 0.8)
- Token cost: 0 input Â· 0 output

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
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 31 edges
2. `GET()` - 27 edges
3. `requireUser()` - 20 edges
4. `assertProjectOwner()` - 14 edges
5. `POST()` - 10 edges
6. `getOperationsState()` - 10 edges
7. `ConvertTo-ProjectPayload()` - 8 edges
8. `refreshProjectSnapshots()` - 7 edges
9. `toSummary()` - 7 edges
10. `upsertProject()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ProtectedLayout()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\app\(app)\layout.tsx â†’ C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\lib\session.ts
- `DashboardPage()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\app\(app)\page.tsx â†’ C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\lib\session.ts
- `DashboardPage()` --calls--> `getOperationsState()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\app\(app)\page.tsx â†’ C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\lib\data\operations.ts
- `SettingsPage()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\app\(app)\settings\page.tsx â†’ C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\lib\session.ts
- `GET()` --calls--> `requireUser()`  [INFERRED]
  C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\app\api\vercel\projects\route.ts â†’ C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard\lib\session.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (20): getDb(), connectVercelToken(), linkProjectRepo(), linkVercelProject(), refreshProjectSnapshots(), refreshVercel(), ProtectedLayout(), assertProjectOwner() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (8): decryptSecret(), encryptSecret(), keyFromEnv(), GET(), apiBase(), latestVercelDeployment(), listVercelProjects(), vercelFetch()

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (10): assigneeName(), getOperationsState(), getResponsibilityBucket(), terminalMatchesProject(), getOverlordState(), clean(), deriveTerminalPresence(), groupTerminalPresence() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (7): adaptNodePty(), spawnNodePty(), decodeTerminalClientMessage(), handleTerminalUpgrade(), isPositiveInteger(), isRecord(), terminalSessionIdFromUrl()

### Community 4 - "Community 4"
Cohesion: 0.26
Nodes (10): parseEnv(), parseOperationsImportEnv(), parseOverlordPushEnv(), emptyToNull(), POST(), resolveOwner(), splitRepo(), upsertProject() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (11): asObject(), asString(), coerceGithubCommits(), coerceGithubPullRequests(), deriveGithubSnapshotState(), firstLine(), normalizeCommit(), normalizePullRequest() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (6): githubInstallUrl(), DashboardPage(), safeGithubUrl(), SettingsPage(), getProjectSummaries(), getGlobalTodos()

### Community 7 - "Community 7"
Cohesion: 0.42
Nodes (8): ConvertTo-ProjectPayload(), Get-BlockedReason(), Get-GitState(), Get-LatestSprintFile(), Get-RelativePath(), Get-StableTaskRef(), Get-TaskStatus(), Get-TaskTitle()

### Community 8 - "Community 8"
Cohesion: 0.52
Nodes (6): getOpenPullRequests(), getRecentCommits(), githubForInstallation(), listInstallationRepos(), privateKey(), refreshGithub()

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (5): computeProductProgress(), maturityFromSignals(), providerLabel(), scoreProvider(), stageFromPercent()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (0):

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (0):

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (2): deserializeState(), fetchOverlordState()

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (0):

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (0):

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (0):

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0):

### Community 17 - "Community 17"
Cohesion: 0.67
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

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0):

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (0):

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (0):

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (0):

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (0):

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (0):

## Knowledge Gaps
- **Thin community `Community 18`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `page.tsx`, `LoginPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `AppShell()`, `app-shell.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `product-progress.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `query-provider.tsx`, `QueryProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `dashboard-widget.tsx`, `DashboardWidget()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `project-form.tsx`, `ProjectForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `sprint-form.tsx`, `SprintForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `todo-form.tsx`, `TodoForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `operations-dashboard.tsx`, `OperationsDashboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `project-state-widget.tsx`, `Count()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `responsibility-widget.tsx`, `Total()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `Badge()`, `badge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `Button()`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `card.tsx`, `Card()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `chip.tsx`, `Chip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `input.tsx`, `Input()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `select-field.tsx`, `SelectField()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `text-field.tsx`, `TextField()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `todo-list.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `task-form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `task-queue-widget.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `view-models.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `auth-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `enums.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `integration-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `overlord-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `product-schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `codex-dialogue-check.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `codex-handoff.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `codex-watchdog-check.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `overlord-push.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `run-helm-server.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `next-auth.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `getDb()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `toSummary()` connect `Community 5` to `Community 0`, `Community 9`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 30 inferred relationships involving `getDb()` (e.g. with `GET()` and `resolveOwner()`) actually correct?**
  _`getDb()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `GET()` (e.g. with `requireUser()` and `getDb()`) actually correct?**
  _`GET()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `requireUser()` (e.g. with `ProtectedLayout()` and `DashboardPage()`) actually correct?**
  _`requireUser()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `assertProjectOwner()` (e.g. with `GET()` and `getDb()`) actually correct?**
  _`assertProjectOwner()` has 13 INFERRED edges - model-reasoned connections that need verification._
