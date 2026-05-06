<!-- KICKSTART_FILE: product-brief | PROJECT: helm | VERSION: 1.0 -->

# Product Brief — helm

---

## 1. Overview {#overview}

| Field | Value |
|-------|-------|
| Project Name | helm |
| Version | 1.0 — Initial Brief |
| Date | 2026-04-30 |
| Author | Ori Shavit |

**One-liner:** A personal developer dashboard that unifies project tracking, sprint management, Git activity, and Vercel deploy status in one place.

---

## 2. Problem Statement {#problem}

### The Problem
A solo developer running multiple projects simultaneously has no single place to see project status, active sprints, task queues, deploy health, and open PRs together. This information lives across GitHub, Vercel, a local todo list, and mental context — all of which must be manually stitched together at the start of every work session.

The result: 10–15 minutes of "context loading" before every session — checking deploy status, scanning open PRs, remembering where a sprint left off. This is waste that compounds daily.

### Why Now
GitHub Apps API and Vercel REST API are mature and well-documented. Next.js App Router with server components makes this kind of multi-source dashboard architecturally clean to build. Neon's serverless Postgres is free-tier viable for single-user tooling. The cost to build this is an order of magnitude lower than it was two years ago.

### Current Alternatives
- **GitHub Projects / Linear** — task tracking only, no Vercel integration, no personal multi-repo overview
- **Vercel Dashboard** — deploy status only, no task/sprint context
- **Notion** — manual, no live data
- **Mental model + browser tabs** — the current approach; slow and fragile

None of these combine sprint progress + live Git state + deploy health in a single view scoped to one developer's actual project set.

---

## 3. Target Users {#users}

### Primary User
- **Who:** Solo developer / indie builder with 3–10 active projects
- **Context:** Start-of-session orientation; mid-session status check; end-of-sprint review
- **Goal:** Know exactly where every project stands without opening 4 different tabs
- **Pain:** Context switching and re-orientation overhead at every session boundary

### Secondary User(s)
- Future: small R&D team (2–4 people) sharing visibility on sprint progress. Multi-user auth seam is in the schema but no team UI in MVP.

### Out-of-Scope Users
- Non-technical stakeholders (no reporting views, no public dashboards)
- Teams using Jira or Linear (different problem, different scale)
- Anyone needing time tracking or billing

---

## 4. Value Proposition {#value-prop}

**Core value:** One authenticated view that shows you exactly where every project stands — sprint, tasks, last deploy, and open PRs — in under 5 seconds.

### User Benefits
- Session start goes from 15 minutes of tab-switching to a single dashboard load
- Vercel deploy status and GitHub PR state visible alongside sprint tasks — no context switching
- Todos persist with project context, not in a disconnected notes app
- Sprint state (open/closed, task completion) always reflects current reality

---

## 5. Goals & Success Metrics {#goals}

### Launch Goals (MVP)
| Goal | Metric | Target |
|------|--------|--------|
| All active projects visible in one view | Projects on dashboard | 100% of linked projects shown |
| Deploy status live per project | Latency from Vercel API | < 5 seconds to load dashboard |
| Sprint + task state accurate | Data freshness | < 60 seconds stale on page load |
| Auth works reliably | Login failure rate | < 0.1% |

### Long-Term Goals
After MVP: add team access (invite-based, scoped per project). After that: notification layer (Slack/email digest on deploy failures, PR merges). Potential I3 integration seam if the Compulocks platform grows to need a developer workspace layer.

---

## 6. Constraints {#constraints}

### Hard Constraints
- **Timeline:** MVP in 2–4 weeks solo build
- **Team:** Solo developer (Ori Shavit)
- **Budget/Infra:** Vercel free/hobby tier, Neon free tier for dev, minimal running cost
- **Compliance:** No sensitive user data beyond Google identity. No payment data. HTTPS only.

### Technical Constraints
- Must run on Vercel (serverless, no long-running processes)
- Neon Postgres — serverless-compatible query patterns only (no persistent connections; use connection pooling via Neon's pooler endpoint)
- GitHub App installation required per user — one-time setup step, not zero-friction
- Vercel API key must be manually added in settings (no OAuth flow for Vercel in MVP)

---

## 7. Out of Scope {#out-of-scope}

- Time tracking of any kind
- Mobile app (responsive web is acceptable but mobile-native is out)
- Non-GitHub Git providers (GitLab, Bitbucket)
- Billing, paid tiers, or subscription management
- Public project pages or stakeholder reporting
- AI features (summarization, auto-triage, etc.) — defer to future version
- Notifications / webhooks (polling-based refresh only in MVP)
- CI/CD pipeline visibility beyond Vercel deployments

---

## 8. Open Questions {#questions}

| Question | Owner | Due |
|----------|-------|-----|
| Should GitHub App be org-scoped or user-scoped installation? User-scoped is simpler for solo dev. | Ori | Before GitHub integration build |
| Vercel API: poll on page load or cache with revalidation? Recommend ISR with 60s revalidation. | Ori | Before Vercel integration build |
| Sprint board: kanban columns or list view as default? [ASSUMED: list view, kanban is Phase 2] | Ori | Before sprint board build |
