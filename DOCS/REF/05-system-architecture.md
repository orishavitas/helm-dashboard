<!-- KICKSTART_FILE: system-architecture | PROJECT: helm | VERSION: 1.0 -->

# System Architecture — helm

---

## 1. Overview {#overview}

helm is a single Next.js application. There is no separate backend service. All data access, auth, and external API proxying happens through Next.js Server Components, Server Actions, and Route Handlers. This is not an architectural compromise — it's the correct choice for a single-user personal tool deployed on Vercel.

→ See: `03-tech-specs.md` for specific technology versions and data models.
→ See: `06-agent-harness.md` for how to set up and run this system locally.

---

## 2. Architecture Diagram {#diagram}

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   React Server Components (initial HTML + RSC payload)      │
│   Client Components (TanStack Query, interactive UI)         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (Vercel Edge)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS APP (Vercel Serverless)                 │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │  RSC + Layouts   │  │  Route Handlers (/api/*)         │  │
│  │  (data fetching) │  │  - Auth.js callbacks             │  │
│  └──────────────────┘  │  - GitHub proxy                  │  │
│                         │  - Vercel proxy                  │  │
│  ┌──────────────────┐  │  - GitHub App webhook/callback   │  │
│  │  Server Actions  │  └──────────────────────────────────┘  │
│  │  (mutations)     │                                        │
│  └──────────────────┘                                        │
└────────┬───────────────────────────────────────────────────┘
         │
    ┌────┴──────────────────────────────────────────────┐
    │               EXTERNAL SERVICES                   │
    │                                                   │
    │  ┌──────────────┐  ┌─────────────┐  ┌──────────┐ │
    │  │  Neon DB     │  │  GitHub     │  │  Vercel  │ │
    │  │  (Postgres)  │  │  App API    │  │  API     │ │
    │  └──────────────┘  └─────────────┘  └──────────┘ │
    │                                                   │
    │  ┌──────────────┐                                 │
    │  │  Google      │                                 │
    │  │  OAuth       │                                 │
    │  └──────────────┘                                 │
    └───────────────────────────────────────────────────┘
```

---

## 3. Services & Responsibilities {#services}

### Next.js App (Single Service)
- **Type:** Full-stack Next.js 15 (App Router, RSC)
- **Hosts:** Vercel (serverless functions + Edge network)
- **Responsibilities:**
  - Render all UI (RSC for initial data, Client Components for interactivity)
  - Handle all mutations via Server Actions (Drizzle + Neon)
  - Proxy GitHub and Vercel API calls server-side (tokens never leave the server)
  - Auth via Auth.js (Google OAuth, session cookies)
- **Stateless:** Yes — all state in Neon DB or Auth.js session cookie

### Neon (PostgreSQL)
- **Type:** Serverless Postgres
- **Endpoint:** Pooler endpoint for app queries; direct endpoint for migrations only
- **Responsibility:** Primary datastore for all helm entities (projects, sprints, tasks, todos, users, integrations)
- **Connection:** `@neondatabase/serverless` HTTP driver (no persistent TCP connection; required for Vercel serverless)

### GitHub App
- **Type:** External service
- **Auth:** JWT (signed with private key) → installation access token
- **Responsibility:** Provide repo data: open PRs, recent commits, branch list
- **Caching:** Next.js fetch cache, 60s revalidation
- **Note:** User must install the GitHub App once — generates installation_id stored in DB

### Vercel REST API
- **Type:** External service
- **Auth:** Bearer token (user-supplied, stored encrypted in DB)
- **Responsibility:** Provide deployment status per Vercel project
- **Caching:** Next.js fetch cache, 60s revalidation

### Auth.js (Google OAuth)
- **Type:** Library + external OAuth provider
- **Responsibility:** Sign in via Google, create/update user record on sign-in, issue httpOnly session cookie
- **Session storage:** Encrypted JWT in cookie (stateless — no DB session table needed)

---

## 4. Data Flow {#data-flow}

### User loads dashboard
```
1. Browser requests GET /
2. Next.js RSC renders Layout + Dashboard page
3. Server-side parallel fetches:
   a. DB: SELECT projects WHERE userId = session.userId AND deletedAt IS NULL
   b. For each project with githubRepo: fetch /api/github/[owner]/[repo]/pulls (cached 60s)
   c. For each project with vercelProjectId: fetch /api/vercel/deployments/[id] (cached 60s)
4. RSC serializes data → HTML + RSC payload
5. Browser renders; TanStack Query hydrated for client interactions
```

### User creates a task
```
1. User types in quick-add input, presses Enter
2. Client calls Server Action: createTask({ projectId, sprintId, title, priority: 'medium' })
3. Server Action:
   a. Validates session (throws if no session)
   b. Validates input with Zod
   c. Verifies projectId belongs to session.userId
   d. INSERT into tasks, returns created task
4. TanStack Query optimistic update: task appears immediately in list
5. On server response: confirm or rollback optimistic update
```

### User cycles task status
```
1. User clicks status badge on a task
2. Client calls Server Action: updateTask(id, { status: nextStatus })
3. Optimistic update: badge changes immediately
4. Server confirms; revalidates sprint progress counter
```

### GitHub App install flow
```
1. User clicks "Connect GitHub" in project settings
2. Browser redirects to GITHUB_APP_INSTALL_URL
3. User authorizes on GitHub
4. GitHub redirects to /api/github/app/callback?installation_id=xxx
5. Route Handler:
   a. Validates session
   b. Stores installation_id in projects record (if projectId in state param)
      OR in users record for global installation
   c. Redirects back to project page
```

### Vercel token storage
```
1. User submits Vercel API token in Settings
2. Server Action: saveVercelToken(token)
3. Server encrypts token: AES-256-GCM with ENCRYPTION_KEY
4. UPSERT into user_integrations (provider='vercel')
5. Client receives { success: true } — token never returned to client
```

---

## 5. Directory Structure {#directory-structure}

```
helm/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Authenticated shell (sidebar)
│   │   ├── page.tsx                  # Dashboard — all projects
│   │   └── projects/
│   │       └── [id]/
│   │           ├── page.tsx          # Project detail
│   │           └── sprints/
│   │               └── [sprintId]/
│   │                   └── page.tsx  # Sprint detail (if separated)
│   ├── settings/
│   │   └── page.tsx                  # Settings page
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts          # Auth.js handler
│       ├── github/
│       │   ├── repos/route.ts        # List user repos
│       │   ├── app/
│       │   │   ├── install/route.ts  # Redirect to GitHub App install
│       │   │   └── callback/route.ts # Post-install callback
│       │   └── [owner]/[repo]/
│       │       ├── pulls/route.ts    # Open PRs
│       │       └── commits/route.ts  # Recent commits
│       └── vercel/
│           ├── projects/route.ts     # List Vercel projects
│           └── deployments/[id]/route.ts  # Deploy status
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   ├── project/
│   │   ├── ProjectCard.tsx           # Dashboard card
│   │   ├── ProjectForm.tsx           # Create/edit project sheet
│   │   └── ProjectDetail.tsx         # Full project layout
│   ├── sprint/
│   │   ├── SprintHeader.tsx          # Sprint name, progress, controls
│   │   └── SprintTaskList.tsx        # Task list + quick-add
│   ├── task/
│   │   ├── TaskRow.tsx               # Single task row
│   │   └── TaskStatusBadge.tsx       # Clickable status cycle
│   ├── github/
│   │   ├── PRList.tsx                # Open PR cards
│   │   └── CommitList.tsx            # Recent commits
│   ├── vercel/
│   │   └── DeployStatus.tsx          # Deployment cards
│   ├── todo/
│   │   └── TodoList.tsx              # Checklist component
│   └── layout/
│       ├── Sidebar.tsx               # Left nav
│       └── PageHeader.tsx            # Consistent page header
│
├── lib/
│   ├── db/
│   │   ├── index.ts                  # Neon client + Drizzle init
│   │   └── schema.ts                 # Drizzle schema (all tables)
│   ├── actions/                      # Server Actions
│   │   ├── projects.ts
│   │   ├── sprints.ts
│   │   ├── tasks.ts
│   │   └── todos.ts
│   ├── github/
│   │   ├── app.ts                    # GitHub App client (Octokit)
│   │   └── queries.ts                # PR, commit, repo fetch helpers
│   ├── vercel/
│   │   └── queries.ts                # Vercel API fetch helpers
│   ├── auth.ts                       # Auth.js config
│   ├── crypto.ts                     # AES-256 encrypt/decrypt helpers
│   └── utils.ts                      # Shared utilities
│
├── drizzle/
│   └── migrations/                   # Auto-generated migration files
│
├── drizzle.config.ts                 # Drizzle Kit config
├── auth.ts                           # Auth.js export (re-export from lib/auth)
├── middleware.ts                     # Protect all routes except /login, /api/auth
├── .env.example                      # All required env vars (no values)
└── package.json
```

---

## 6. Infrastructure & Deployment {#infrastructure}

### Environments
| Env | Purpose | URL |
|-----|---------|-----|
| local | Development | `localhost:3000` |
| preview | PR review deploys | `helm-git-[branch]-ori.vercel.app` |
| production | Live | `helm.vercel.app` (or custom domain) |

### Deployment Pipeline
```
git push → Vercel Git integration detects push
→ If branch: creates preview deployment
→ If main: deploys to production automatically
→ Neon DB migrations run manually before first deploy of any schema change
   (pnpm db:migrate against production DATABASE_URL_UNPOOLED)
```

### No Infrastructure as Code (MVP)
Vercel and Neon are both managed. No Terraform needed. Env vars managed in Vercel dashboard.

---

## 7. Security Architecture {#security}

- **Auth:** httpOnly session cookie via Auth.js — no JWT in localStorage, no XSS risk
- **Route protection:** `middleware.ts` blocks all non-`/login` and non-`/api/auth` routes for unauthenticated users
- **Data isolation:** Every DB query includes `userId = session.userId` — server-enforced
- **Token security:** Vercel token encrypted AES-256-GCM before DB write; GitHub App private key in env var only
- **HTTPS:** Enforced by Vercel on all endpoints
- **CORS:** Next.js Route Handlers return only to same origin; no `Access-Control-Allow-Origin: *`
- **Input validation:** All Server Actions validate input with Zod before DB write
- **Secrets:** All secrets in Vercel environment variables — never in source code
- **Dependencies:** Dependabot enabled on GitHub repo for automated vulnerability alerts
