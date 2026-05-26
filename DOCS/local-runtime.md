# Helm Local Runtime

Sprint 03 adds a local-only runtime profile for embedded terminal work. The cloud dashboard remains the production-safe profile; terminal and future agent/vault routes are only exposed when `HELM_PROFILE=local`.

## Environment

Set these values in `.env.local` for local runtime work:

```ini
HELM_PROFILE=local
HELM_LOCAL_PORT=3001
TERMINAL_SHELL=powershell.exe
TERMINAL_CWD=C:\Users\OriShavit\Documents\GitHub
```

The app still needs the normal Helm auth/database environment for protected pages.

## Commands

```powershell
corepack pnpm dev:helm
```

Runs `server.mjs` in development mode. The custom server:

- loads `.env.local` with Next's env loader
- serves the Next.js App Router app
- handles websocket upgrades for `/ws/terminal/:sessionId`
- rejects terminal websocket upgrades unless `HELM_PROFILE=local`

```powershell
corepack pnpm start:helm
```

Runs the same local server with `NODE_ENV=production` after a build.

## Terminal Route

`/terminal` is a protected app route and only renders in local profile. The page connects to `/ws/terminal/main` and opens a PowerShell PTY from `TERMINAL_CWD`.

Session behavior:

- maximum 4 PTY sessions in the pool
- idle sessions are eligible for cleanup after 5 minutes
- browser resize sends terminal dimensions to the PTY
- closing the websocket terminates the PTY session

## Verification

Minimum checks after terminal changes:

```powershell
corepack pnpm exec tsc -p tsconfig.test.json
node --test .tmp\test-dist\tests\*.test.js
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
corepack pnpm dev:helm
```

Then open `http://127.0.0.1:3001/terminal`, sign in if needed, and verify that typing `Get-ChildItem` returns a directory listing.
