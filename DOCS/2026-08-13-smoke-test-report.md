# Helm-Dashboard Smoke Test Report — 2026-08-13

Task 4.1 of the Legion cleanup plan. Dormant since 2026-05-26; Sprints 03-05
(embedded terminal, agent runner, vault browser, knowledge graph) claimed
complete but never had a four-route browser smoke test run. This is that
run.

## Result: BLOCKED — server starts fine, but auth misconfiguration prevents
## any route from loading in a real browser

All four routes FAIL. Not "blank page with 200" — worse: the server itself
is healthy (confirmed via curl), but a stale environment variable makes
every authenticated route unreachable from a browser.

| Route | Verdict | Reason |
|---|---|---|
| `/terminal` | **FAIL** | `net::ERR_CONNECTION_REFUSED` — redirected to dead port |
| `/agents` | **FAIL** | `net::ERR_CONNECTION_REFUSED` — redirected to dead port |
| `/vault` | **FAIL** | `net::ERR_CONNECTION_REFUSED` — redirected to dead port |
| `/graph` | **FAIL** | `net::ERR_CONNECTION_REFUSED` — redirected to dead port |

## Root cause

`.env.local` contains a stale/mismatched auth origin:

```
AUTH_URL=http://localhost:3006
...
HELM_LOCAL_PORT=3001
```

The dev server (`pnpm dev:helm` → `scripts/run-helm-server.mjs` →
`server.mjs`) correctly binds and listens on `127.0.0.1:3001`
(`HELM_LOCAL_PORT`). Confirmed via server log:

```
Helm local runtime ready: http://127.0.0.1:3001
 ○ Compiling /middleware ...
 ✓ Compiled /middleware in 720ms (465 modules)
```

But `lib/auth.ts` (NextAuth v5 / Auth.js) reads `AUTH_URL` for constructing
absolute redirect URLs on unauthenticated requests, independent of the
request's actual origin. Every protected route therefore 307-redirects to
`http://localhost:3006/login` — a port nothing listens on — instead of
`http://127.0.0.1:3001/login`.

Verified with curl (which does not auto-follow redirects to a dead host, so
it still reports the redirect cleanly):

```
$ curl -s -D - -o /dev/null http://127.0.0.1:3001/terminal --max-time 5
HTTP/1.1 307 Temporary Redirect
location: http://localhost:3006/login
set-cookie: authjs.csrf-token=...
set-cookie: authjs.callback-url=http%3A%2F%2Flocalhost%3A3006; ...
```

```
$ curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3006/login --max-time 5
HTTP 000   (curl exit 7 — connection refused, nothing listening on 3006)
```

A real browser (Playwright/Chromium) follows the redirect and hard-fails:

```
Error: browserBackend.callTool: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3001/terminal
Call log:
  - navigating to "http://127.0.0.1:3001/terminal", waiting until "domcontentloaded"
```

Identical failure reproduced for `/agents`, `/vault`, and `/graph` —
`middleware.ts` gates every non-public path through `auth()`, so all
protected routes hit the same broken redirect.

Confirmed the server itself is not the problem: `/login` (an explicitly
public path in `middleware.ts`) loads correctly on port 3001 directly
(HTTP 200, and Playwright navigation succeeded, page title "Helm").
Screenshot: [`smoke-20260813/login-page.png`](smoke-20260813/login-page.png).

Fix is one line: set `AUTH_URL=http://localhost:3001` (or make it dynamic /
match `HELM_LOCAL_PORT`) in `.env.local`. Not applied here — out of scope
for a smoke test, and this is a local dev env file, not something to edit
without the owning developer's say-so.

## What could not be tested even in principle

`lib/auth.ts` has no dev-mode auth bypass — the only configured provider is
Google OAuth (`providers: hasGoogle ? [Google(...)] : []`), and
`session.strategy` depends on `hasDatabaseUrl()`. Even with `AUTH_URL`
fixed, reaching any of the four routes would require completing a real
Google OAuth consent flow. That's out of scope for an automated smoke
test regardless of the port bug, so the four routes' actual content
(xterm pane, agents session list, vault tree, force-graph canvas) remains
functionally unverified pending either a fixed `AUTH_URL` + manual OAuth
login, or a test-mode auth bypass added to `lib/auth.ts`.

## Deviation from task instructions

Per instructions, `/agents` was never going to be submitted a real prompt
(would call the Anthropic API and spend credits) — moot here since the
route was unreachable before that question could even arise.

## Server startup log (full, `server.log`)

```
> helm-dashboard@0.1.0 dev:helm C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard
> node scripts/run-helm-server.mjs development

◇ injected env (25) from .env.local // tip: multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: multiple files { path: ['.env.local', '.env'] }
Helm local runtime ready: http://127.0.0.1:3001
 ○ Compiling /middleware ...
 ✓ Compiled /middleware in 720ms (465 modules)
```

Full log: [`smoke-20260813/server.log`](smoke-20260813/server.log)

## Console errors captured

Only console error seen (on the reachable `/login` page) was benign:

```
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found)
  @ http://127.0.0.1:3001/favicon.ico:0
```

No favicon.ico present in the project — cosmetic, unrelated to the routing
blocker.

## Artifacts

- [`DOCS/smoke-20260813/server.log`](smoke-20260813/server.log) — full dev
  server startup log
- [`DOCS/smoke-20260813/login-page.png`](smoke-20260813/login-page.png) —
  screenshot of the one page that *did* load (`/login`, public route,
  proves the server/Next.js app itself renders correctly; the blocker is
  routing/auth config, not the app)

No screenshots exist for `/terminal`, `/agents`, `/vault`, `/graph` —
they never rendered; the browser never got past `ERR_CONNECTION_REFUSED`.

## Bottom line

Do not tick Sprints 03-05 off as verified. The embedded terminal, agent
runner, vault browser, and knowledge graph features are all unverified —
not because they're broken, but because the local auth redirect
configuration (`AUTH_URL=http://localhost:3006` vs. actual
`HELM_LOCAL_PORT=3001`) makes every protected route unreachable in a
browser. Recommend: fix `AUTH_URL` in `.env.local`, then either complete a
real Google OAuth login or add a dev-mode auth bypass, then re-run this
smoke test before crediting Sprints 03-05 as done.
