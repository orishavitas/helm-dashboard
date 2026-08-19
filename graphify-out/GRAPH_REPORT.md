# Graph Report - Helm-Dashboard  (2026-08-18)

## Corpus Check
- 167 files · ~62,554 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1376 nodes · 2120 edges · 149 communities (138 shown, 11 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 151 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `319b453c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 128|Community 128]]
- [[_COMMUNITY_Community 129|Community 129]]
- [[_COMMUNITY_Community 130|Community 130]]
- [[_COMMUNITY_Community 131|Community 131]]
- [[_COMMUNITY_Community 132|Community 132]]
- [[_COMMUNITY_Community 133|Community 133]]
- [[_COMMUNITY_Community 134|Community 134]]
- [[_COMMUNITY_Community 135|Community 135]]
- [[_COMMUNITY_Community 136|Community 136]]
- [[_COMMUNITY_Community 137|Community 137]]
- [[_COMMUNITY_Community 138|Community 138]]
- [[_COMMUNITY_Community 139|Community 139]]
- [[_COMMUNITY_Community 140|Community 140]]
- [[_COMMUNITY_Community 141|Community 141]]
- [[_COMMUNITY_Community 142|Community 142]]
- [[_COMMUNITY_Community 143|Community 143]]
- [[_COMMUNITY_Community 144|Community 144]]
- [[_COMMUNITY_Community 145|Community 145]]
- [[_COMMUNITY_Community 146|Community 146]]
- [[_COMMUNITY_Community 149|Community 149]]
- [[_COMMUNITY_Community 160|Community 160]]

## God Nodes (most connected - your core abstractions)
1. `requireUser()` - 62 edges
2. `getDb()` - 60 edges
3. `GET()` - 52 edges
4. `getDb()` - 37 edges
5. `assertProjectOwner()` - 22 edges
6. `cn()` - 22 edges
7. `requireUser()` - 21 edges
8. `POST()` - 18 edges
9. `compilerOptions` - 17 edges
10. `Helm State Aggregator Implementation Plan` - 16 edges

## Surprising Connections (you probably didn't know these)
- `ProtectedLayout()` --calls--> `requireUser()`  [INFERRED]
  app/(app)/layout.tsx → lib/session.ts
- `GET()` --calls--> `getObsidianClient()`  [INFERRED]
  app/api/vercel/projects/route.ts → lib/vault/obsidian-rest.ts
- `GET()` --calls--> `listVercelProjects()`  [INFERRED]
  app/api/vercel/projects/route.ts → lib/integrations/vercel.ts
- `POST()` --calls--> `requireUser()`  [INFERRED]
  app/api/agents/stop/[id]/route.ts → lib/session.ts
- `GET()` --calls--> `requireUser()`  [INFERRED]
  app/api/agents/stream/[id]/route.ts → lib/session.ts

## Import Cycles
- None detected.

## Communities (149 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (8): collectNotes(), GET(), abortSession(), hasController(), registerController(), readVaultNote(), readVaultTree(), searchVaultNotes()

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (13): parseEnv(), parseLocalProfileEnv(), parseOperationsImportEnv(), parseOverlordPushEnv(), ProtectedLayout(), TerminalPage(), emptyToNull(), POST() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (10): assigneeName(), getOperationsState(), getResponsibilityBucket(), terminalMatchesProject(), getOverlordState(), clean(), deriveTerminalPresence(), groupTerminalPresence() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (24): appendAgentEvent(), createAgentSession(), getAgentEvents(), getAgentSession(), listAgentSessions(), updateAgentSession(), getDb(), linkProjectRepo() (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.60
Nodes (4): decryptSecret(), encryptSecret(), keyFromEnv(), connectVercelToken()

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (7): adaptNodePty(), spawnNodePty(), decodeTerminalClientMessage(), handleTerminalUpgrade(), isPositiveInteger(), isRecord(), terminalSessionIdFromUrl()

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (16): asObject(), asString(), coerceGithubCommits(), coerceGithubPullRequests(), deriveGithubSnapshotState(), firstLine(), normalizeCommit(), normalizePullRequest() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (5): Audit trail — orchestrator dissent, recorded, Shepard-Commander's live verification (in-session, 2026-08-18), Smoke Verification Addendum — 2026-08-18, Status after this addendum, Why this proves authenticated verification

### Community 8 - "Community 8"
Cohesion: 0.42
Nodes (8): ConvertTo-ProjectPayload(), Get-BlockedReason(), Get-GitState(), Get-LatestSprintFile(), Get-RelativePath(), Get-StableTaskRef(), Get-TaskStatus(), Get-TaskTitle()

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (3): ConnectionState, statusClassName(), XtermPane()

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (5): buildGraph(), extractTags(), extractWikilinks(), stemFromPath(), stripFrontmatter()

### Community 75 - "Community 75"
Cohesion: 0.08
Nodes (31): AgentEventStream(), AgentEventStreamProps, DisplayEvent, StreamState, AgentRunner(), AgentRunnerProps, AgentRunnerEvent, RunAgentOptions (+23 more)

### Community 77 - "Community 77"
Cohesion: 0.06
Nodes (33): 2026-05-06 (Codex session), 2026-05-14 (Codex session), 2026-05-18, 2026-05-18 (earlier — Codex session), 2026-05-19, 2026-05-20, 2026-05-26 (session 2 — Sprint 03 fixes + Sprint 04 + Sprint 05), Added (+25 more)

### Community 78 - "Community 78"
Cohesion: 0.06
Nodes (31): 1. MVP Vision Statement, 2. MVP Scope, 3. Architecture Overview, 4. Feature Set with Priority, 5. Sprint Plan, 6. MVP Screen Descriptions, 7. Technical Decisions, 8. Risk Register (+23 more)

### Community 79 - "Community 79"
Cohesion: 0.07
Nodes (29): 1. Overview {#overview}, 2. Tech Stack {#tech-stack}, 3. Data Models {#data-models}, 4. API Design {#api}, 5. Authentication & Authorization {#auth}, 6. Environment Variables {#env}, 7. Performance Targets {#performance}, 8. Third-Party Services {#third-party} (+21 more)

### Community 80 - "Community 80"
Cohesion: 0.07
Nodes (29): 1. Overview {#overview}, 2. Visual Language {#visual-language}, 3. Component Patterns {#components}, 4. Layout System {#layouts}, 5. Interaction Model {#interactions}, 6. Screen Inventory {#screens}, 7. Accessibility {#accessibility}, Animation Principles (+21 more)

### Community 81 - "Community 81"
Cohesion: 0.07
Nodes (28): dependencies, @anthropic-ai/sdk, @auth/drizzle-adapter, class-variance-authority, clsx, dotenv, drizzle-orm, lucide-react (+20 more)

### Community 82 - "Community 82"
Cohesion: 0.11
Nodes (17): ProjectCard(), providerTone(), statusTone(), TodoList(), averageProgress(), DashboardWidgetConfig, DashboardWidgetContext, DashboardWidgetDefinition (+9 more)

### Community 83 - "Community 83"
Cohesion: 0.08
Nodes (25): 1. Overview {#overview}, 2. Functional Requirements {#functional-requirements}, 3. User Stories {#user-stories}, 4. Non-Functional Requirements {#non-functional}, 5. Edge Cases & Error States {#edge-cases}, 6. Data Requirements {#data}, 7. Integration Requirements {#integrations}, 8. Release Phases {#phases} (+17 more)

### Community 84 - "Community 84"
Cohesion: 0.11
Nodes (18): adaptNodePty(), createTerminalPool(), spawnNodePty(), TerminalDisposable, TerminalPool, TerminalPoolOptions, TerminalProcess, TerminalProcessListeners (+10 more)

### Community 85 - "Community 85"
Cohesion: 0.05
Nodes (89): connectVercelToken(), linkProjectRepo(), linkVercelProject(), refreshGithub(), refreshProjectSnapshots(), refreshVercel(), createProject(), projectSchema (+81 more)

### Community 86 - "Community 86"
Cohesion: 0.14
Nodes (17): statuses, TaskList(), ProjectIntegrationForms(), SprintForm(), TaskForm(), TodoForm(), cn(), TaskItem (+9 more)

### Community 87 - "Community 87"
Cohesion: 0.14
Nodes (16): ForceGraph2D, GraphLinkDatum, GraphNodeDatum, KnowledgeGraphProps, KnowledgeGraph, collectNotes(), GET(), buildGraph() (+8 more)

### Community 88 - "Community 88"
Cohesion: 0.09
Nodes (21): 1. Overview {#overview}, 2. Architecture Diagram {#diagram}, 3. Services & Responsibilities {#services}, 4. Data Flow {#data-flow}, 5. Directory Structure {#directory-structure}, 6. Infrastructure & Deployment {#infrastructure}, 7. Security Architecture {#security}, Auth.js (Google OAuth) (+13 more)

### Community 89 - "Community 89"
Cohesion: 0.10
Nodes (20): Architectural Decisions (immutable without sign-off), Completion Anchors, Critical Implementation Notes, Current Status (2026-05-26), Env parsing split (2026-05-18), Helm Dashboard — CLAUDE.md, Key Files, Next Steps (+12 more)

### Community 90 - "Community 90"
Cohesion: 0.10
Nodes (20): 1. Overview {#overview}, 2. Problem Statement {#problem}, 3. Target Users {#users}, 4. Value Proposition {#value-prop}, 5. Goals & Success Metrics {#goals}, 6. Constraints {#constraints}, 7. Out of Scope {#out-of-scope}, 8. Open Questions {#questions} (+12 more)

### Community 91 - "Community 91"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 92 - "Community 92"
Cohesion: 0.10
Nodes (19): Current Baseline, Data Model, Derived Status Rules, File Structure, Helm State Aggregator Implementation Plan, Operating Principle, Risks And Guardrails, Rollout Order (+11 more)

### Community 93 - "Community 93"
Cohesion: 0.10
Nodes (19): Claude tasks — Sprint 03 (DO NOT duplicate), Claude tasks — Sprint 04 (DO NOT duplicate), Claude tasks — Sprint 05 (DO NOT duplicate), Claude tasks — Sprint 06 (DO NOT duplicate), Codex tasks — Sprint 03, Codex tasks — Sprint 04, Codex tasks — Sprint 05, Codex tasks — Sprint 06 (+11 more)

### Community 95 - "Community 95"
Cohesion: 0.14
Nodes (8): getObsidianClient(), ObsidianRestClient, deserializeState(), fetchOverlordState(), apiBase(), latestVercelDeployment(), listVercelProjects(), vercelFetch()

### Community 96 - "Community 96"
Cohesion: 0.06
Nodes (30): ProtectedLayout(), AppShell(), envSchema, LocalProfileEnv, localProfileEnvSchema, operationsImportEnvSchema, optionalNonEmptyString, overlordPushEnvSchema (+22 more)

### Community 97 - "Community 97"
Cohesion: 0.07
Nodes (32): emptyToNull(), importSchema, POST(), projectImportSchema, resolveOwner(), splitRepo(), taskImportSchema, upsertProject() (+24 more)

### Community 98 - "Community 98"
Cohesion: 0.12
Nodes (15): Changes, Concept Preview Completion - 2026-05-14, Failures / Blockers, Google OAuth Callback Fix - 2026-05-19, Last Run - helm-dashboard, Methodology, Next Safe Step, OAuth Config Triage - 2026-05-19 (+7 more)

### Community 99 - "Community 99"
Cohesion: 0.13
Nodes (14): aliases, components, lib, ui, utils, rsc, $schema, style (+6 more)

### Community 100 - "Community 100"
Cohesion: 0.20
Nodes (11): deserializeState(), fetchOverlordState(), OverlordPanel(), SerializedSnapshot, SerializedState, OverlordTerminalCard(), Props, STATUS_ICON (+3 more)

### Community 102 - "Community 102"
Cohesion: 0.13
Nodes (14): File Structure, Overlord Monitor — Implementation Plan, Self-Review, Task 10: Env + Vercel Config, Task 11: Agent Push Script (PowerShell), Task 1: DB Schema — `terminal_snapshots` table, Task 2: Drizzle Migration, Task 3: View Models (+6 more)

### Community 103 - "Community 103"
Cohesion: 0.13
Nodes (14): Code quality (non-blocking), Done ✅, Ready to do (env unblocked), Runtime verified, Smoke test required (Shepard-Commander), Sprint 01: Overlord Monitor, Sprint 02: GitHub Project Tracking and Live Terminal Presence, Sprint 03 — Local Runtime & Terminal Embedding ✅ Verified (2026-05-26) (+6 more)

### Community 105 - "Community 105"
Cohesion: 0.12
Nodes (22): GET(), GET(), DashboardPage(), DashboardWidgetGrid(), assigneeName(), getOperationsState(), getResponsibilityBucket(), terminalMatchesProject() (+14 more)

### Community 106 - "Community 106"
Cohesion: 0.14
Nodes (17): ProductProgressBlockers(), ProductProgressSummary(), computeProductProgress(), maturityFromSignals(), PRODUCT_STAGES, ProductProgress, ProductProgressInput, ProductProgressSignal (+9 more)

### Community 107 - "Community 107"
Cohesion: 0.15
Nodes (12): compilerOptions, incremental, jsx, module, moduleResolution, noEmit, outDir, rootDir (+4 more)

### Community 108 - "Community 108"
Cohesion: 0.17
Nodes (11): Acceptance Criteria, Constraints, Context, Inputs, Notes, Objective, Out of Scope, Scope (+3 more)

### Community 110 - "Community 110"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, drizzle-kit, eslint, eslint-config-next, postcss, tailwindcss, @types/node (+4 more)

### Community 111 - "Community 111"
Cohesion: 0.17
Nodes (11): 10. Deployment Checklist {#deploy-checklist}, 2. Prerequisites {#prerequisites}, 3. Initial Setup {#setup}, 4. Build Order {#build-order}, 5. Environment Variables {#env-vars}, 6. Available Scripts {#scripts}, 7. MCP Servers for Claude Code {#mcp-servers}, 8. Agent Decision Rules {#agent-instructions} (+3 more)

### Community 112 - "Community 112"
Cohesion: 0.17
Nodes (11): Task 10 â€” PowerShell push script, Task 11 â€” KB update, Task 1 â€” DB schema: `terminal_snapshots` table + enum, Task 2 â€” Drizzle migration, Task 3 â€” View models, Task 4 â€” Data layer: `lib/data/overlord.ts`, Task 5 â€” Push API: `POST /api/overlord/push`, Task 6 â€” State API: `GET /api/overlord/state` (+3 more)

### Community 113 - "Community 113"
Cohesion: 0.17
Nodes (11): 2026-05-19 Codex update, Bash tool note, Code fix applied, Current git state, Quartet created (all new — did not exist before), Remaining verification, Session Handoff — Helm Dashboard, State updated (+3 more)

### Community 115 - "Community 115"
Cohesion: 0.18
Nodes (10): any route from loading in a real browser, Artifacts, Bottom line, Console errors captured, Deviation from task instructions, Helm-Dashboard Smoke Test Report — 2026-08-13, Result: BLOCKED — server starts fine, but auth misconfiguration prevents, Root cause (+2 more)

### Community 116 - "Community 116"
Cohesion: 0.20
Nodes (9): Changed Files, Commands Run, Follow-ups, monday Update, Result: {TASK-ID}, Results, Risks, Summary (+1 more)

### Community 118 - "Community 118"
Cohesion: 0.22
Nodes (6): githubInstallUrl(), DashboardPage(), safeGithubUrl(), SettingsPage(), getProjectSummaries(), getGlobalTodos()

### Community 119 - "Community 119"
Cohesion: 0.22
Nodes (9): scripts, build, db:generate, db:migrate, dev, dev:helm, lint, start:helm (+1 more)

### Community 120 - "Community 120"
Cohesion: 0.42
Nodes (8): ConvertTo-ProjectPayload(), Get-BlockedReason(), Get-GitState(), Get-LatestSprintFile(), Get-RelativePath(), Get-StableTaskRef(), Get-TaskStatus(), Get-TaskTitle()

### Community 121 - "Community 121"
Cohesion: 0.22
Nodes (8): Context Notes, Decisions Made, Files Already Modified Before This Handoff, Files Modified This Session, Session Log - 2026-05-21, State at Handoff, Verification Evidence, What Was Accomplished

### Community 122 - "Community 122"
Cohesion: 0.25
Nodes (7): Concept, Failures, Implementation, Local Commits, Overlord Monitor Tracking - Helm-Dashboard, Remaining Risk, Verification / Tests

### Community 123 - "Community 123"
Cohesion: 0.29
Nodes (6): Completion Anchors, Current Helm State, Key Sprint 02 Files, Nexus Dispatch Contract, Required Result Fields, Vault Ingest (Automatic)

### Community 124 - "Community 124"
Cohesion: 0.52
Nodes (6): getOpenPullRequests(), getRecentCommits(), githubForInstallation(), listInstallationRepos(), privateKey(), refreshGithub()

### Community 125 - "Community 125"
Cohesion: 0.29
Nodes (6): Criteria Results, Defects, Evidence Checked, Recommendation, Review: {TASK-ID}, Verdict

### Community 126 - "Community 126"
Cohesion: 0.29
Nodes (6): Current Blocker, Next Safe Step, Pickup, Session Log - 2026-05-26, Verification, Work Performed

### Community 127 - "Community 127"
Cohesion: 0.33
Nodes (5): Commands, Environment, Helm Dashboard, Notes, Stack

### Community 128 - "Community 128"
Cohesion: 0.33
Nodes (5): Commands, Environment, Helm Local Runtime, Terminal Route, Verification

### Community 129 - "Community 129"
Cohesion: 0.33
Nodes (5): name, packageManager, private, type, version

### Community 130 - "Community 130"
Cohesion: 0.33
Nodes (5): Current Blocker, Next Safe Step, Pickup, Session Log - 2026-05-22, Work Performed

### Community 131 - "Community 131"
Cohesion: 0.33
Nodes (5): Implementation, Remaining, Scope, Sprint 02 - GitHub Project Tracking and Live Terminal Presence, Verification

### Community 132 - "Community 132"
Cohesion: 0.33
Nodes (5): Completion Log, Sprint 001 — helm-dashboard, Task 001 — Add snapshot refresh route handlers, Task 002 — Wire snapshot refresh into project detail page, Task 003 — Dashboard: trigger snapshot refresh per project on load

### Community 133 - "Community 133"
Cohesion: 0.32
Nodes (4): TerminalLoader(), TerminalLoaderProps, XtermPane, Card()

### Community 135 - "Community 135"
Cohesion: 0.40
Nodes (4): file-management-agent, Goal, Quick Start, Repo Map

### Community 136 - "Community 136"
Cohesion: 0.50
Nodes (3): dialect, entries, version

### Community 137 - "Community 137"
Cohesion: 0.11
Nodes (19): DashboardWidget(), DashboardWidgetSize, TerminalRepoGroup, OperationsProjectState, OperationsState, OperationsTask, ResponsibilityBucket, Props (+11 more)

### Community 160 - "Community 160"
Cohesion: 0.22
Nodes (8): Dev server status, Helm-Dashboard Interactive Smoke Retest — 2026-08-13, Step 1 — `/login` renders cleanly, Steps 2–3 — Four protected routes, unauthenticated, Summary, TODO.md status, What changed since the failed Sprint 4 attempt, What this retest does NOT and cannot prove

## Knowledge Gaps
- **548 isolated node(s):** `PreToolUse`, `KnowledgeGraph`, `NoteResponse`, `SearchResult`, `createSchema` (+543 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 97`, `Community 6`, `Community 10`, `Community 118`, `Community 124`, `Community 95`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `getSession()` connect `Community 97` to `Community 0`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `requireUser()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`requireUser()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `GET()` (e.g. with `getAgentSession()` and `listAgentSessions()`) actually correct?**
  _`GET()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 36 inferred relationships involving `getDb()` (e.g. with `appendAgentEvent()` and `createAgentSession()`) actually correct?**
  _`getDb()` has 36 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PreToolUse`, `KnowledgeGraph`, `NoteResponse` to the rest of the system?**
  _548 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._