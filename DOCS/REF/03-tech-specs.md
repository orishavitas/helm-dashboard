<!-- KICKSTART_FILE: tech-specs | PROJECT: helm | VERSION: 1.0 -->

# Technical Specifications — helm

---

## 1. Overview {#overview}

This document defines the technical decisions for building helm.
It is the source of truth for stack choices, data models, and API contracts.

→ See: `02-prd.md` for what needs to be built.
→ See: `05-system-architecture.md` for how services connect.

---

## 2. Tech Stack {#tech-stack}

### Frontend + Backend (unified — Next.js App Router)
| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 15.x | Vercel-native, RSC, API routes + server actions in one app |
| Language | TypeScript | 5.x | Type safety across data models, API contracts, and UI |
| Styling | Tailwind CSS + shadcn/ui | Tailwind 3.x | Fast composable UI, no lock-in, consistent with mrd-producer-webapp |
| Server state | TanStack Query (React Query) | 5.x | Caching, revalidation, background refresh for GitHub/Vercel data |
| Auth | Auth.js v5 (NextAuth) | 5.x | Google OAuth built-in, session management, Edge-compatible |
| ORM | Drizzle ORM | 0.30.x | SQL-first, type-safe, lightweight, serverless-friendly (no connection pool overhead) |
| Runtime | Node.js | 20.x | |

### Data
| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Primary DB | Neon (PostgreSQL) | Postgres 16 | Already available, serverless, free tier, pgvector-ready for future |
| Cache | None (MVP) | — | TanStack Query handles client-side caching; Next.js fetch cache for server |
| Search | None (MVP) | — | |
| File Storage | None (MVP) | — | No file uploads in scope |

### DevOps
| Layer | Technology | Notes |
|-------|-----------|-------|
| Hosting | Vercel | Obvious fit — Vercel API integration, Edge network, free hobby tier |
| CI/CD | Vercel Git integration | Auto-deploy on push to main; preview deploys on PRs |
| Monitoring | None (MVP) | Add Sentry in Phase 2 |
| Package manager | pnpm | Consistent with existing Ori repos |

---

## 3. Data Models {#data-models}

```typescript
// ── users ────────────────────────────────────────────────────────
interface User {
  id: string;           // UUID, PK
  email: string;        // unique, from Google
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── projects ─────────────────────────────────────────────────────
interface Project {
  id: string;                                     // UUID, PK
  userId: string;                                 // FK → users.id
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'archived';       // default: 'active'
  githubOwner: string | null;                     // e.g. "oriShavit"
  githubRepo: string | null;                      // e.g. "helm"
  githubInstallationId: string | null;            // GitHub App installation ID
  vercelProjectId: string | null;                 // Vercel project ID string
  deletedAt: Date | null;                         // soft delete
  createdAt: Date;
  updatedAt: Date;
}

// ── project_members ──────────────────────────────────────────────
// Schema seam for Phase 2 team access — not used in MVP UI
interface ProjectMember {
  id: string;                              // UUID, PK
  projectId: string;                       // FK → projects.id
  userId: string;                          // FK → users.id
  role: 'owner' | 'member' | 'viewer';    // default: 'member'
  createdAt: Date;
}

// ── sprints ──────────────────────────────────────────────────────
interface Sprint {
  id: string;                              // UUID, PK
  projectId: string;                       // FK → projects.id
  name: string;
  status: 'open' | 'closed';              // default: 'open'; one open per project
  startDate: Date | null;
  endDate: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── tasks ────────────────────────────────────────────────────────
interface Task {
  id: string;                                              // UUID, PK
  projectId: string;                                       // FK → projects.id
  sprintId: string | null;                                 // FK → sprints.id; null = backlog
  assigneeId: string | null;                               // FK → users.id
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';   // default: 'todo'
  priority: 'low' | 'medium' | 'high' | 'critical';      // default: 'medium'
  sortOrder: number;                                       // for manual ordering
  deletedAt: Date | null;                                  // soft delete
  createdAt: Date;
  updatedAt: Date;
}

// ── todos ────────────────────────────────────────────────────────
interface Todo {
  id: string;           // UUID, PK
  userId: string;       // FK → users.id
  projectId: string | null;  // null = global todo
  text: string;
  done: boolean;        // default: false
  sortOrder: number;    // for manual ordering
  createdAt: Date;
  updatedAt: Date;
}

// ── user_integrations ────────────────────────────────────────────
// Stores per-user integration tokens encrypted at rest
interface UserIntegration {
  id: string;                    // UUID, PK
  userId: string;                // FK → users.id
  provider: 'vercel' | 'github'; // github = App installation record
  encryptedToken: string | null; // AES-256 encrypted; null for GitHub App (uses installation ID)
  metadata: Record<string, unknown> | null; // provider-specific extras as JSON
  createdAt: Date;
  updatedAt: Date;
}
```

### Relationships
```
User          1──* Project          (user owns many projects)
User          1──* ProjectMember    (user can be member of many projects)
Project       1──* ProjectMember    (project has many members)
Project       1──* Sprint           (project has many sprints)
Project       1──* Task             (project has many tasks, via backlog)
Sprint        1──* Task             (sprint has many tasks)
Project       1──* Todo             (project has scoped todos)
User          1──* Todo             (user has global todos)
User          1──* UserIntegration  (user has many integration records)
```

### Database Schema Notes
- All tables use UUID primary keys (gen_random_uuid())
- Soft deletes via `deletedAt` timestamp (nullable); always filter `WHERE deleted_at IS NULL`
- `sortOrder` columns use float (1.0, 2.0, ...) to allow fractional insertion for reordering without renumbering
- Neon pooler endpoint (`/pooler`) used for serverless; direct connection only for migrations
- All timestamps are stored as UTC

---

## 4. API Design {#api}

### Approach
Next.js App Router is used for all data access. Server Actions handle mutations (create/update/delete). Route Handlers (`/app/api/...`) are used for:
1. Auth callbacks (Auth.js)
2. GitHub/Vercel proxy endpoints (to keep tokens server-side)
3. Any webhook endpoints

No public REST API in MVP — all data access is through RSC + Server Actions.

### Server Actions (Mutations)

#### Projects
| Action | Input | Notes |
|--------|-------|-------|
| `createProject(data)` | name, description?, status, githubOwner?, githubRepo?, vercelProjectId? | Returns created project |
| `updateProject(id, data)` | Partial project fields | |
| `deleteProject(id)` | id | Soft delete |
| `linkGitHub(projectId, owner, repo, installationId)` | — | Updates github fields |
| `linkVercel(projectId, vercelProjectId)` | — | Updates vercel field |

#### Sprints
| Action | Input | Notes |
|--------|-------|-------|
| `createSprint(data)` | projectId, name, startDate?, endDate? | Validates one open sprint rule |
| `closeSprint(id)` | id | Sets status='closed', closedAt=now() |
| `updateSprint(id, data)` | Partial sprint fields | |

#### Tasks
| Action | Input | Notes |
|--------|-------|-------|
| `createTask(data)` | projectId, sprintId?, title, priority, status | |
| `updateTask(id, data)` | Partial task fields including status | |
| `deleteTask(id)` | id | Soft delete |

#### Todos
| Action | Input | Notes |
|--------|-------|-------|
| `createTodo(data)` | text, projectId? | projectId null = global |
| `toggleTodo(id)` | id | Flips done boolean |
| `deleteTodo(id)` | id | Hard delete |
| `reorderTodos(ids)` | ordered id array | Updates sortOrder |

### Route Handlers (API Routes)

#### GitHub Proxy
```
GET /api/github/repos
  → Lists repos accessible via the user's GitHub App installation
  → Auth: session required

GET /api/github/[owner]/[repo]/pulls
  → Returns open PRs for a repo
  → Auth: session required
  → Cache: 60s revalidation

GET /api/github/[owner]/[repo]/commits
  → Returns last 10 commits on default branch
  → Auth: session required
  → Cache: 60s revalidation
```

#### Vercel Proxy
```
GET /api/vercel/projects
  → Lists user's Vercel projects (requires stored token)
  → Auth: session required

GET /api/vercel/deployments/[projectId]
  → Returns last 3 deployments for a project
  → Auth: session required
  → Cache: 60s revalidation
```

#### GitHub App
```
GET /api/github/app/install
  → Redirects to GitHub App installation URL

GET /api/github/app/callback
  → Receives installation_id after GitHub App install
  → Stores installation ID against user record
```

---

## 5. Authentication & Authorization {#auth}

### Auth Method
Google OAuth via Auth.js v5. Session stored as signed, httpOnly JWT cookie. No custom session DB table required — Auth.js handles this.

### Token Lifecycle
- Session TTL: 30 days (rolling)
- Storage: httpOnly, Secure, SameSite=Lax cookie managed by Auth.js
- No refresh token complexity — re-auth on expiry

### Authorization Rules
- All data is scoped to `session.user.id` at the server action / route handler level
- No row can be read or mutated unless `userId = session.user.id` (enforced in every query)
- `project_members` table exists in schema but no member-access query paths in MVP — owner only

### Vercel Token Handling
- Token stored encrypted (AES-256-GCM) in `user_integrations` table
- Encryption key sourced from `ENCRYPTION_KEY` env var (32-byte hex string)
- Token decrypted server-side only, never sent to client
- Client receives only a boolean `vercelConnected: true/false`

---

## 6. Environment Variables {#env}

```env
# ── App ───────────────────────────────────────────
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<32-char random string>

# ── Database ──────────────────────────────────────
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/helm?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/helm?sslmode=require&pgbouncer=true
# Use DATABASE_URL for app queries (pooler), DATABASE_URL_UNPOOLED for migrations

# ── Auth ──────────────────────────────────────────
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# ── GitHub App ────────────────────────────────────
GITHUB_APP_ID=<from GitHub App settings>
GITHUB_APP_PRIVATE_KEY=<PEM key, base64 encoded>
GITHUB_APP_CLIENT_ID=<from GitHub App settings>
GITHUB_APP_CLIENT_SECRET=<from GitHub App settings>
GITHUB_APP_INSTALL_URL=https://github.com/apps/<app-name>/installations/new

# ── Encryption ────────────────────────────────────
ENCRYPTION_KEY=<64-char hex string — 32 bytes>
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Performance Targets {#performance}

| Operation | Target | Strategy |
|-----------|--------|---------|
| Dashboard RSC load | < 2s | Parallel data fetching; DB queries ≤ 3 round trips via joins |
| Project detail RSC load | < 1.5s | GitHub/Vercel data fetched in parallel server-side |
| Task status update | < 200ms perceived | Optimistic update via TanStack Query mutation |
| GitHub/Vercel API proxy | < 500ms | Next.js fetch cache with 60s revalidation |
| Sprint progress counter | Instant | Derived from task count query on server, no polling |

### Caching Strategy
- Next.js `fetch` with `{ next: { revalidate: 60 } }` for all GitHub and Vercel API calls
- TanStack Query on client for task/todo mutations with optimistic updates
- No Redis in MVP — Next.js data cache is sufficient for single-user load

---

## 8. Third-Party Services {#third-party}

| Service | SDK/Package | Usage |
|---------|------------|-------|
| Auth.js | `next-auth` v5 | Google OAuth, session management |
| Drizzle ORM | `drizzle-orm`, `drizzle-kit` | DB queries, migrations |
| Neon | `@neondatabase/serverless` | Serverless Postgres driver |
| GitHub REST API | `@octokit/app`, `@octokit/rest` | GitHub App auth, PR/commit data |
| shadcn/ui | Component CLI + `class-variance-authority` | UI components |
| TanStack Query | `@tanstack/react-query` | Client-side server state |
| Zod | `zod` | Schema validation on server actions |
