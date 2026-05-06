<!-- KICKSTART_FILE: prd | PROJECT: helm | VERSION: 1.0 -->

# Product Requirements Document — helm

---

## 1. Overview {#overview}

This PRD defines what helm must do. It is the source of truth for feature scope and acceptance criteria.

→ See: `01-product-brief.md` for problem context and goals.
→ See: `03-tech-specs.md` for implementation approach.

---

## 2. Functional Requirements {#functional-requirements}

Requirements use MoSCoW priority: **Must / Should / Could / Won't**

### Authentication {#req-auth}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-001 | User must be able to sign in with Google OAuth | Must | Via Auth.js v5 |
| F-002 | User session must persist across browser reloads | Must | httpOnly cookie |
| F-003 | User must be able to sign out | Must | |
| F-004 | Unauthenticated requests to protected routes must redirect to `/login` | Must | |
| F-005 | User profile (name, avatar, email) must be stored on first login | Must | Upsert on sign-in |

### Projects {#req-projects}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-010 | User must be able to create a project with name, description, and status | Must | |
| F-011 | User must be able to link a GitHub repo to a project | Must | Repo picker from installed GitHub App |
| F-012 | User must be able to link a Vercel project to a project | Must | Selected from Vercel API list |
| F-013 | User must be able to set project status: active / paused / archived | Must | |
| F-014 | User must be able to view all their projects on the dashboard | Must | |
| F-015 | User must be able to edit and delete projects | Must | Soft delete |
| F-016 | Project list must show status indicator, last deploy state, open PR count | Must | |

### Sprints {#req-sprints}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-020 | User must be able to create a sprint within a project | Must | Name + optional date range |
| F-021 | User must be able to open and close sprints | Must | One open sprint per project at a time |
| F-022 | Sprint must show task completion progress (N done / M total) | Must | |
| F-023 | User must be able to view sprint history (closed sprints) | Should | |
| F-024 | Sprint date range must be optional | Must | [ASSUMED] |

### Tasks {#req-tasks}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-030 | User must be able to create tasks within a sprint or directly on a project | Must | |
| F-031 | Task must have: title, status, priority, optional description, optional assignee | Must | |
| F-032 | Task status options: todo / in-progress / done / blocked | Must | |
| F-033 | Task priority options: low / medium / high / critical | Must | |
| F-034 | User must be able to reorder tasks by drag-and-drop | Should | Phase 2 if complex |
| F-035 | User must be able to move tasks between sprints | Should | |
| F-036 | Tasks must be filterable by status and priority | Should | |

### Todos {#req-todos}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-040 | User must be able to create todos scoped to a project | Must | |
| F-041 | User must be able to create global (cross-project) todos | Must | |
| F-042 | Todos must support: text, done state, manual order | Must | |
| F-043 | User must be able to reorder todos by drag-and-drop | Should | |
| F-044 | Completed todos must be visually distinct but not auto-deleted | Must | |

### GitHub Integration {#req-github}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-050 | User must be able to install the GitHub App and authorize repo access | Must | Redirect to GitHub install flow |
| F-051 | Project detail must show open PRs for the linked repo | Must | PR title, author, branch, status |
| F-052 | Project detail must show last 5 commits on default branch | Should | Commit hash, message, author, time |
| F-053 | Project detail must show open branch count | Could | |
| F-054 | GitHub data must refresh on page load with max 60s cache | Must | |

### Vercel Integration {#req-vercel}

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-060 | User must be able to add a Vercel API token in settings | Must | Stored encrypted in DB |
| F-061 | Project detail must show latest deployment status per environment | Must | production + preview |
| F-062 | Deployment entry must show: status, trigger (push/manual), branch, timestamp, URL | Must | |
| F-063 | Last 3 deployments must be visible per project | Should | |
| F-064 | Deployment status must use color coding: ready=green, error=red, building=yellow | Must | |

---

## 3. User Stories {#user-stories}

**US-001 — Morning session startup**
> As a developer, I want to open helm and immediately see all my active projects' sprint progress, deploy status, and open PRs, so that I can start working in under 60 seconds.

**Acceptance Criteria:**
- [ ] Given I'm authenticated, when I load `/`, then I see all active projects with sprint progress, last deploy status, and open PR count
- [ ] Given the page has loaded, when I look at a project card, then deploy status and PR count are visible without clicking into the project
- [ ] Given data is stale (>60s), when I load the page, then fresh data is fetched from GitHub and Vercel

---

**US-002 — Creating a new project**
> As a developer, I want to create a project and immediately link it to a GitHub repo and Vercel project, so that live data starts appearing right away.

**Acceptance Criteria:**
- [ ] Given I click "New Project", then I see a form with name, description, status, GitHub repo picker, and Vercel project picker
- [ ] Given I submit the form, when the project is created, then I'm redirected to the project detail page
- [ ] Given no GitHub App is installed, when I open the repo picker, then I see a prompt to install the GitHub App with a direct link

---

**US-003 — Sprint management**
> As a developer, I want to create sprints and track task completion within them, so that I have a clear definition of what I'm working on this week.

**Acceptance Criteria:**
- [ ] Given I'm on a project detail page, when I click "New Sprint", then I can enter a name and optional date range
- [ ] Given a sprint is open, when I add tasks to it, then sprint progress (N/M) updates immediately
- [ ] Given I click "Close Sprint", then the sprint is archived and I'm prompted to create the next one
- [ ] Given a project has one open sprint, I cannot open a second sprint without closing the first

---

**US-004 — Task triage**
> As a developer, I want to quickly add and update tasks in the current sprint, so that my task list reflects what I'm actually doing.

**Acceptance Criteria:**
- [ ] Given I'm on a sprint view, when I click "Add Task", then a quick-add input appears inline (no modal required)
- [ ] Given a task exists, when I click its status, then I can cycle through todo → in-progress → done without leaving the list
- [ ] Given I set a task to "done", then the sprint progress counter increments immediately

---

**US-005 — Vercel deploy awareness**
> As a developer, I want to see my latest deploy status without opening the Vercel dashboard, so that I know immediately if a push broke production.

**Acceptance Criteria:**
- [ ] Given I have a Vercel token configured, when I view a project, then I see the latest production deploy status
- [ ] Given a deploy failed, when I look at the project card on the dashboard, then the status indicator is red
- [ ] Given no Vercel token is set, when I view the Vercel section, then I see "Add Vercel token in Settings" CTA

---

## 4. Non-Functional Requirements {#non-functional}

### Performance
- Dashboard load time: < 2s (P95) on cold start
- Project detail load: < 1.5s (P95)
- API response time: < 100ms for DB-only endpoints; < 500ms for GitHub/Vercel proxied endpoints
- Concurrent users supported: 1 (MVP); 10 (Phase 2)

### Reliability
- Uptime target: 99.5% (Vercel hobby tier SLA)
- Data loss tolerance: RPO 24h (Neon automated backups)
- Recovery time objective: RTO 1h (redeploy from git)

### Security
- Auth method: Google OAuth via Auth.js v5, httpOnly session cookie
- Data encryption: in transit (TLS enforced by Vercel), at rest (Neon encrypts at rest)
- PII stored: Google email, name, avatar URL. No passwords stored. Vercel API token stored encrypted.
- GitHub App private key stored as env var, never in DB

### Accessibility
- Target standard: WCAG 2.1 AA (best effort for MVP)
- Screen reader support: Yes — all interactive elements labeled
- Keyboard navigation: Yes — full keyboard nav for dashboard and task management

### Localization
- English only for MVP
- RTL support: No

---

## 5. Edge Cases & Error States {#edge-cases}

| Scenario | Expected Behavior |
|----------|-------------------|
| GitHub API rate limit hit | Show cached data with "rate limit — data may be stale" banner. Log error. |
| Vercel API token invalid/expired | Show "Vercel token invalid — update in Settings" warning per project |
| GitHub App uninstalled by user | Show "GitHub App not installed" on affected projects, with reinstall link |
| Project has no open sprint | Show "No active sprint — create one" CTA in sprint section |
| No projects exist | Show empty state with "Create your first project" CTA |
| Network error on dashboard load | Show last cached data + error toast "Could not refresh — showing last known state" |
| Session expired mid-session | Redirect to `/login`, preserve last visited URL for post-auth redirect |
| Task quick-add submitted empty | Prevent submit, no error shown (silent no-op) |

---

## 6. Data Requirements {#data}

### Data the System Collects
| Data Point | Source | Purpose | Retention |
|-----------|--------|---------|-----------|
| Google email | OAuth | Identity, login | Lifetime of account |
| Google name + avatar | OAuth | Display in UI | Lifetime of account |
| Project metadata | User input | Core feature | Until deleted |
| Sprint data | User input | Core feature | Until deleted |
| Task data | User input | Core feature | Until deleted |
| Todo data | User input | Core feature | Until deleted |
| GitHub repo link (owner/repo string) | User input | Integration config | Until project deleted |
| Vercel project ID | User input | Integration config | Until project deleted |
| Vercel API token | User input | API calls | Until user removes it |
| GitHub App installation ID | GitHub OAuth | API auth | Until app uninstalled |

### Data the System Must NOT Collect
- Raw passwords (OAuth only)
- GitHub private keys in DB (env var only)
- Any payment data
- User browsing/behavior analytics in MVP

---

## 7. Integration Requirements {#integrations}

| Service | Purpose | Type | Notes |
|---------|---------|------|-------|
| Google OAuth | Authentication | OAuth2 via Auth.js | Scopes: email, profile |
| GitHub App | Repo data (PRs, commits, branches) | REST API v3 + JWT auth | Requires one-time install per user |
| Vercel REST API | Deploy status per project | REST API | Bearer token auth; user-supplied token |

---

## 8. Release Phases {#phases}

### Phase 1 — MVP
**Goal:** Working personal dev dashboard — all projects, sprints, tasks, todos, GitHub PRs, Vercel deploys visible in one place.
**Includes:** F-001–F-016, F-020–F-024, F-030–F-033, F-040–F-044, F-050–F-054, F-060–F-064
**Excludes:** Drag-and-drop reordering (F-034, F-043), move tasks between sprints (F-035), task filtering (F-036), sprint history view (F-023)

### Phase 2
**Goal:** Team access — invite a collaborator to a specific project with scoped visibility.
**Includes:** Project membership UI, invite flow, per-member role assignment, scoped data access
**Excludes:** Admin panel, billing, SSO
