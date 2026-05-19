# TODO — Helm Dashboard

## Sprint 01: Overlord Monitor

### Runtime verified

- [x] Create `.env.local` — required values:
  ```
  DATABASE_URL=<neon-pooled-url>
  DATABASE_URL_UNPOOLED=<neon-direct-url>
  AUTH_SECRET=<32+ char secret>
  AUTH_URL=http://localhost:3000
  GOOGLE_CLIENT_ID=<google-oauth>
  GOOGLE_CLIENT_SECRET=<google-oauth>
  GITHUB_APP_ID=<id>
  GITHUB_APP_PRIVATE_KEY=<pem>
  GITHUB_APP_CLIENT_ID=<id>
  GITHUB_APP_CLIENT_SECRET=<secret>
  GITHUB_APP_SLUG=<slug>
  ENCRYPTION_KEY=<32+ char key>
  OVERLORD_PUSH_SECRET=<16+ char secret>
  OVERLORD_BASE_URL=http://localhost:3000
  ```
- [ ] Run `corepack pnpm db:migrate` (not run in the 2026-05-19 smoke test; DB catalog already shows `terminal_snapshots`)
- [x] Run `scripts/overlord-push.ps1` with real env — 2026-05-19 Codex smoke push returned `{"ok":true}` and inserted `codex-smoke-20260519`
- [x] Confirm `terminal_snapshots` table exists in Neon

### Ready to do (env unblocked)

- [ ] Deploy the `lib/auth.ts` Auth.js Drizzle adapter table-mapping fix to Vercel production
- [ ] Test full browser login flow (Google OAuth → dashboard)
- [ ] Verify `GET /api/overlord/state` returns data after push from an authenticated browser session
- [ ] Verify polling interval works (2-minute auto-refresh in `overlord-panel.tsx`)
- [ ] Mark sprint done: update `DOCS/sprints/2026-05-06-helm-dashboard-sprint-01-overlord-monitor.md`

### Code quality (non-blocking)

- [x] Run `corepack pnpm typecheck` + `corepack pnpm lint` after Auth.js adapter fix — passed 2026-05-19
- [ ] Re-run `corepack pnpm build`; local build runner timed out twice before compilation output on 2026-05-19, while typecheck/lint passed
- [ ] Resolve Windows path casing warning (Documents vs documents) — low priority

## Done ✅

- [x] DB schema + Drizzle foundation
- [x] Auth.js (Google) integration
- [x] Overlord DB schema (`terminal_snapshots`, `terminal_status` enum)
- [x] `drizzle/0001_overlord.sql` scoped migration
- [x] `POST /api/overlord/push` with bearer auth
- [x] `GET /api/overlord/state` with `requireUser()`
- [x] `<OverlordPanel />` + `<OverlordTerminalCard />` UI
- [x] Dashboard widget registry architecture (`dashboard-layout.tsx`, `dashboard-widget.tsx`)
- [x] Product progress TypeScript model (stages + maturity)
- [x] Project cards with stage, maturity, percent, missing signals
- [x] `scripts/overlord-push.ps1` push script
- [x] `concept-preview.html` static preview
- [x] Helm UI primitives: Card, Chip, Input
- [x] CSS design tokens in `app/globals.css`
- [x] Graphify: `graphify-out/`, `AGENTS.md`, `.codex/hooks.json`
- [x] Fix Overlord push env over-validation (`parseOverlordPushEnv()`)
- [x] All static checks: typecheck ✅ lint ✅ build ✅
- [x] 2026-05-19 operability smoke: `/login` 200, protected routes 307, DB `select 1`, Overlord table present, invalid push 401, valid push 200
- [x] 2026-05-19 OAuth deployment config triage: Google app is External/Testing with test users; Vercel env had whitespace and was missing `AUTH_TRUST_HOST=true`
- [x] 2026-05-19 Google callback root cause: Auth.js `DrizzleAdapter` was defaulting to `user`/`account`/`session` tables; fixed `lib/auth.ts` to map Helm's `users`/`accounts`/`sessions`/`verification_tokens` tables explicitly
