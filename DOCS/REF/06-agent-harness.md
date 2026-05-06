<!-- KICKSTART_FILE: agent-harness | PROJECT: helm | VERSION: 1.0 -->

# Agent Harness — helm

This file tells Claude Code exactly how to set up and start building helm.
**Read this file first. Then read all other files before writing any code.**

```
01-product-brief.md       → What and why
02-prd.md                 → What to build (requirements, acceptance criteria)
03-tech-specs.md          → How to build it (stack, data models, APIs)
04-design-guide.md        → How it should look (UI/UX, dark theme)
05-system-architecture.md → How it's structured (services, data flow, directory)
06-agent-harness.md       → THIS FILE — setup, build order, env vars
```

---

## 2. Prerequisites {#prerequisites}

```bash
node --version   # >=20.0.0
pnpm --version   # >=9.0.0
```

No Docker required — Neon is remote, no local DB container needed.

```bash
# Install pnpm if needed
npm install -g pnpm@latest
```

---

## 3. Initial Setup {#setup}

```bash
# 1. Scaffold Next.js app
pnpx create-next-app@latest helm \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \    # [ASSUMED: no src dir — keep flat per 05-system-architecture.md]
  --no-turbopack # use stable webpack for now

cd helm

# 2. Install core dependencies
pnpm add \
  next-auth@beta \
  drizzle-orm \
  @neondatabase/serverless \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  zod \
  @octokit/app \
  @octokit/rest \
  lucide-react \
  class-variance-authority \
  clsx \
  tailwind-merge

pnpm add -D \
  drizzle-kit \
  @types/node

# 3. Install shadcn/ui
pnpx shadcn@latest init
# Choose: Dark, CSS variables, zinc base color
# Install components as needed:
pnpx shadcn@latest add button input badge card sheet dialog toast

# 4. Copy env template
cp .env.example .env.local
# Fill in all required values — see Section 5

# 5. Run DB migrations (after filling DATABASE_URL_UNPOOLED in .env.local)
pnpm db:migrate

# 6. Start dev server
pnpm dev
```

---

## 4. Build Order {#build-order}

Build in this exact sequence. Each phase must be complete and working before starting the next. Do not skip ahead.

```
═══ PHASE 1 — Foundation ══════════════════════════════════════

  □ Directory structure per 05-system-architecture.md §5
  □ drizzle.config.ts setup
  □ lib/db/schema.ts — all tables (users, projects, project_members,
    sprints, tasks, todos, user_integrations)
  □ First migration: pnpm db:generate && pnpm db:migrate
  □ lib/db/index.ts — Neon serverless client + Drizzle init
  □ lib/crypto.ts — AES-256-GCM encrypt/decrypt helpers
  □ .env.example with all variables
  □ middleware.ts — protect all routes except /login, /api/auth

═══ PHASE 2 — Auth ════════════════════════════════════════════

  □ lib/auth.ts — Auth.js v5 config (Google provider)
  □ app/api/auth/[...nextauth]/route.ts
  □ app/(auth)/login/page.tsx — Google sign-in button
  □ Verify: sign in, session persists, user row created in DB
  □ Test: unauthenticated request to / redirects to /login

═══ PHASE 3 — Projects CRUD ═══════════════════════════════════

  □ lib/actions/projects.ts — createProject, updateProject, deleteProject
  □ components/project/ProjectForm.tsx — Sheet with form fields
  □ app/(dashboard)/layout.tsx — Sidebar shell (static links for now)
  □ app/(dashboard)/page.tsx — Dashboard RSC, queries projects
  □ components/project/ProjectCard.tsx — name, status, placeholder for sprint/deploy data
  □ app/(dashboard)/projects/[id]/page.tsx — Project detail skeleton
  □ Verify: create, edit, soft-delete a project. Cards appear on dashboard.

═══ PHASE 4 — Sprints & Tasks ═════════════════════════════════

  □ lib/actions/sprints.ts — createSprint, closeSprint, updateSprint
  □ lib/actions/tasks.ts — createTask, updateTask, deleteTask
  □ components/sprint/SprintHeader.tsx — progress bar + controls
  □ components/sprint/SprintTaskList.tsx — task list + inline quick-add
  □ components/task/TaskRow.tsx — title, status badge, priority dot
  □ components/task/TaskStatusBadge.tsx — click-to-cycle status
  □ Wire into project detail page
  □ Verify: create sprint, add tasks, cycle status, progress updates

═══ PHASE 5 — Todos ═══════════════════════════════════════════

  □ lib/actions/todos.ts — createTodo, toggleTodo, deleteTodo
  □ components/todo/TodoList.tsx — checklist with add input
  □ Wire global todos to dashboard sidebar or dashboard page
  □ Wire project todos to project detail
  □ Verify: add, check, uncheck, delete todos

═══ PHASE 6 — GitHub Integration ══════════════════════════════

  □ lib/github/app.ts — GitHub App client (Octokit App + installationClient)
  □ app/api/github/app/install/route.ts — redirect to install URL
  □ app/api/github/app/callback/route.ts — store installation_id
  □ app/api/github/[owner]/[repo]/pulls/route.ts — open PRs, 60s cache
  □ app/api/github/[owner]/[repo]/commits/route.ts — last 5 commits, 60s cache
  □ app/api/github/repos/route.ts — repo picker list
  □ components/github/PRList.tsx — PR cards
  □ components/github/CommitList.tsx — commit list (monospace)
  □ Wire repo picker into ProjectForm
  □ Wire GitHub section into project detail
  □ Verify: install app, link repo, PRs and commits appear on project page

═══ PHASE 7 — Vercel Integration ══════════════════════════════

  □ app/settings/page.tsx — Settings page with Vercel token input
  □ lib/actions/projects.ts — saveVercelToken (encrypt + upsert)
  □ app/api/vercel/projects/route.ts — project picker list
  □ app/api/vercel/deployments/[id]/route.ts — last 3 deploys, 60s cache
  □ components/vercel/DeployStatus.tsx — deployment cards with status colors
  □ Wire Vercel project picker into ProjectForm
  □ Wire deploy section into project detail + project card on dashboard
  □ Verify: add token, link project, deployment status shows on dashboard

═══ PHASE 8 — Polish ══════════════════════════════════════════

  □ Skeleton loading states for GitHub/Vercel sections
  □ Empty states for all major sections (no projects, no sprint, no tasks)
  □ Error boundaries on GitHub/Vercel sections (graceful degradation)
  □ Toast notifications for all mutations (success + error)
  □ Sidebar project list: live project names with status dots
  □ Dashboard project card: complete layout with all data
  □ Keyboard navigation audit
  □ Mobile: basic usability at 375px (no full redesign, just not broken)

═══ PHASE 9 — Hardening ════════════════════════════════════════

  □ Zod validation on all Server Actions (verify no unvalidated inputs)
  □ Auth check on all Server Actions (verify no missing session guards)
  □ Route Handler: verify userId ownership before returning data
  □ Review all DB queries: confirm `deletedAt IS NULL` filters present
  □ Encryption: verify Vercel token round-trips correctly
  □ Test: sign out → attempt direct URL to /projects/[id] → redirect to login
  □ Test: create project, close browser, reopen → session persists
  □ Production build: pnpm build — must have zero errors
```

---

## 5. Environment Variables {#env-vars}

```env
# ── App ───────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<run: openssl rand -base64 32>

# ── Database ──────────────────────────────────────
# Pooler endpoint — use for all app queries
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/helm?sslmode=require
# Direct endpoint — use for migrations only (drizzle-kit)
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/helm?sslmode=require

# ── Google OAuth ──────────────────────────────────
AUTH_GOOGLE_ID=<from Google Cloud Console — OAuth 2.0 Client ID>
AUTH_GOOGLE_SECRET=<from Google Cloud Console — OAuth 2.0 Client Secret>
# Authorized redirect URI to add in Google Console:
# http://localhost:3000/api/auth/callback/google

# ── GitHub App ────────────────────────────────────
GITHUB_APP_ID=<numeric App ID from GitHub App settings>
# Private key: paste PEM content, replace newlines with \n
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----
GITHUB_APP_CLIENT_ID=<OAuth Client ID from GitHub App settings>
GITHUB_APP_CLIENT_SECRET=<OAuth Client Secret from GitHub App settings>
GITHUB_APP_NAME=<slug name of your GitHub App — for install URL>
# Derived: https://github.com/apps/${GITHUB_APP_NAME}/installations/new

# ── Encryption ────────────────────────────────────
# 32-byte hex string for AES-256 encryption of Vercel token
ENCRYPTION_KEY=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

---

## 6. Available Scripts {#scripts}

Add these to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

Note: `db:migrate` must use `DATABASE_URL_UNPOOLED` (direct connection). Set this in `drizzle.config.ts`:
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
```

---

## 7. MCP Servers for Claude Code {#mcp-servers}

Recommended `.mcp.json` for this project:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL_UNPOOLED}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}"
      }
    }
  }
}
```

---

## 8. Agent Decision Rules {#agent-instructions}

| If... | Then... |
|-------|---------|
| A requirement in `02-prd.md` is unclear | Implement the most conservative interpretation. Add `// TODO: clarify — <question>` comment. Do not block. |
| UI component not specified in `04-design-guide.md` | Use the nearest matching pattern in the guide. Dark theme, zinc palette, indigo accent. |
| GitHub API returns 403 (rate limit or auth) | Return empty array with `{ error: 'github_unavailable' }`. UI shows cached data or empty state — never crashes. |
| Vercel token missing | Return `{ connected: false }`. Component renders "Add Vercel token in Settings" — no API call attempted. |
| Server Action mutates data | Always: 1) validate session, 2) validate input with Zod, 3) verify ownership, 4) write to DB. Never skip step. |
| Adding a new DB table or column | Generate a new migration with `pnpm db:generate`. Never use `db:push` in production. |
| `[ASSUMED]` item encountered | Implement as specified. Leave the `[ASSUMED]` comment in place for Ori to review. |

---

## 9. Test Harness {#test-harness}

MVP uses manual testing against dev server. Add automated tests in Phase 2.

### Manual Test Checklist (run before each production deploy)
```
Auth:
  □ Sign in with Google — user row created
  □ Sign out — session cleared
  □ Visit / while signed out — redirected to /login
  □ Refresh page while signed in — session persists

Projects:
  □ Create project (no integrations) — appears on dashboard
  □ Edit project name — updates everywhere
  □ Soft delete project — disappears from dashboard

Sprints + Tasks:
  □ Create sprint — appears on project page
  □ Add task via quick-add — task appears, sprint progress updates
  □ Cycle task status — updates immediately
  □ Close sprint — archived, prompt to create new one

GitHub:
  □ Link repo to project — PR list appears
  □ PRs show correct count on dashboard card
  □ Commits list shows last 5 with correct data

Vercel:
  □ Add token in Settings — token encrypted, stored
  □ Link Vercel project — latest deploy appears
  □ Deploy status badge matches Vercel dashboard

Security:
  □ Sign out, manually navigate to /projects/[id] — redirect to login
  □ Confirm no tokens logged to console anywhere
```

---

## 10. Deployment Checklist {#deploy-checklist}

Before pushing to production:

```
□ pnpm build — zero TypeScript errors, zero build errors
□ pnpm typecheck — zero type errors
□ pnpm lint — zero lint errors
□ All env vars set in Vercel dashboard (not just .env.local)
□ DATABASE_URL points to production Neon branch
□ DATABASE_URL_UNPOOLED set for migrations
□ AUTH_SECRET is a long random string (not a dev placeholder)
□ ENCRYPTION_KEY is a fresh 32-byte hex string for production
□ Google OAuth redirect URI updated to production domain in Google Console
□ DB migrations run against production: DATABASE_URL_UNPOOLED=<prod> pnpm db:migrate
□ Manual test checklist passed against production after first deploy
```
