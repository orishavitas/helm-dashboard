# Helm Dashboard

Helm is a root-level Next.js App Router app coexisting with the Python file-management agent. It is a single-user developer command center for project, sprint, task, todo, GitHub, and Vercel visibility.

## Stack
- Next.js 15, React 19, TypeScript, Tailwind, shadcn-compatible local UI primitives, lucide icons.
- Auth.js v5 with Google OAuth and database sessions.
- Drizzle ORM with Neon Postgres.
- GitHub App installation access through Octokit.
- Vercel token access encrypted with AES-256-GCM via `ENCRYPTION_KEY`.

## Commands
- `corepack pnpm install`
- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm build`
- `corepack pnpm dev`

## Environment
The Helm variables are appended to `.env.example`. App queries use `DATABASE_URL`; migrations use `DATABASE_URL_UNPOOLED`. Auth, Google OAuth, GitHub App, Vercel, and encryption values must be present before live use.
Overlord heartbeat pushes require `OVERLORD_PUSH_SECRET`; local push scripts can use `OVERLORD_BASE_URL` to target the app.

## Notes
- The web app uses flat root directories: `app/`, `components/`, `lib/`, and `drizzle/`.
- The lint script is scoped to Helm TypeScript paths so it does not traverse legacy Python temp directories that can be inaccessible on Windows.
- GitHub and Vercel credentials stay server-side. Vercel tokens are stored encrypted; GitHub stores installation IDs.
- Local development can boot without `AUTH_SECRET`; production still requires a real secret.
- Agent terminals can push status snapshots with `scripts/overlord-push.ps1`; the dashboard polls `/api/overlord/state` every 2 minutes.
