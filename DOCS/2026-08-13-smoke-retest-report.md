# Helm-Dashboard Interactive Smoke Retest — 2026-08-13

Re-run of Task B (`2026-08-13-followup-sprint-spec.md`) after Sprint 4's automated attempt failed on a dead `AUTH_URL` port. Scope of this retest: verify the auth-redirect plumbing is now healthy end-to-end up to the point only a real human Google login can pass. This is a Claude-run verification pass, not the Shepard-Commander interactive login itself.

## What changed since the failed Sprint 4 attempt

1. `AUTH_URL` was corrected to `http://localhost:3001`, matching `HELM_LOCAL_PORT=3001`. (Prior value pointed at a dead port, which was the Sprint 4 failure cause.)
2. Shepard-Commander hit a Google OAuth `redirect_uri_mismatch` error on first live attempt, then fixed it **in Google Cloud Console** (not a code change) by adding `http://localhost:3001/api/auth/callback/google` as an authorized redirect URI on the existing OAuth client. Shepard-Commander confirmed login works in their own browser session.

This retest independently re-verifies both fixes from a fresh, unauthenticated agent browser session (no cached Google credentials available to the agent).

## Dev server status

Server was already running before this retest started — not started by this session, so it was **not** stopped at the end.

```
$ MSYS_NO_PATHCONV=1 netstat -ano | grep -i ":3001"
  TCP    127.0.0.1:3001         0.0.0.0:0              LISTENING       39016
  TCP    127.0.0.1:3001         127.0.0.1:49839        ESTABLISHED     39016
  ...
```
PID `39016` listening on `127.0.0.1:3001` at the start of this session, and still the same PID at the end of the session (re-checked, unchanged). Confirms this was the user's pre-existing session, correctly left running.

## Step 1 — `/login` renders cleanly

**Verdict: YES.**

Navigated to `http://127.0.0.1:3001/login` with Playwright (fresh unauthenticated context, no Google session cookies from this agent).

- Page loaded with title `Helm`, no connection error, no `redirect_uri_mismatch`.
- Accessibility snapshot shows the real page content:
  ```yaml
  - generic [active]:
    - main:
      - generic: Helm
      - heading "Developer command center" [level=1]
      - paragraph: Sign in to see project work, open pull requests, deploy state, and todos in one compact workspace.
      - button "Continue with Google"
  ```
- Console messages: 1 error total, and it is a harmless `favicon.ico` 404 — unrelated to auth, not a functional defect.

Screenshot: `C:\Users\OriShavit\.claude\2026-08-13-login-page.png`
[file:///C:/Users/OriShavit/.claude/2026-08-13-login-page.png](file:///C:/Users/OriShavit/.claude/2026-08-13-login-page.png)

**Bonus evidence beyond the task's minimum bar:** the agent also clicked/triggered navigation via the "Continue with Google" flow (incidental to the screenshot action) and the browser was carried all the way to Google's real OAuth consent/account flow at:
```
https://accounts.google.com/v3/signin/identifier?...
  &client_id=77339967627-1m3kallh659br3g21t325a96hg0ha42i.apps.googleusercontent.com
  &redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fcallback%2Fgoogle
  ...
```
Google **accepted** the `redirect_uri` parameter and proceeded to its normal sign-in flow (no `redirect_uri_mismatch` error page at any point, no `Error 400: redirect_uri_mismatch` screen). This directly confirms the Google Cloud Console fix took effect — the exact failure mode from the first live attempt does not reproduce.

Screenshot of the accepted-redirect state: `C:\Users\OriShavit\.claude\2026-08-13-google-oauth-redirect-accepted.png`
[file:///C:/Users/OriShavit/.claude/2026-08-13-google-oauth-redirect-accepted.png](file:///C:/Users/OriShavit/.claude/2026-08-13-google-oauth-redirect-accepted.png)

The agent did **not** attempt to enter credentials or complete the login — no Google credentials are available to the agent, and doing so was out of scope. The browser was navigated back to `http://127.0.0.1:3001/login` afterward to leave the session clean.

## Steps 2–3 — Four protected routes, unauthenticated

**Verdict: YES, all four now correctly redirect to `/login` — no connection errors, no blank crashes.**

| Route | Result | Evidence |
|---|---|---|
| `/terminal` | Redirected to `http://localhost:3001/login` | Playwright nav log: final Page URL = `/login`, Page Title = `Helm` |
| `/agents` | Redirected to `http://localhost:3001/login` | Same |
| `/vault` | Redirected to `http://localhost:3001/login` | Same |
| `/graph` | Redirected to `http://localhost:3001/login` | Same; representative screenshot taken (see below) |

Representative screenshot (`/graph` → `/login` redirect target), confirming the redirect lands on the real rendered login page and not an error/blank page:

```yaml
- generic [active]:
  - main:
    - generic: Helm
    - heading "Developer command center" [level=1]
    - paragraph: Sign in to see project work, open pull requests, deploy state, and todos in one compact workspace.
    - button "Continue with Google"
```

Screenshot: `C:\Users\OriShavit\.claude\2026-08-13-graph-redirect-to-login.png`
[file:///C:/Users/OriShavit/.claude/2026-08-13-graph-redirect-to-login.png](file:///C:/Users/OriShavit/.claude/2026-08-13-graph-redirect-to-login.png)

This is the **expected and correct** behavior for unauthenticated requests to protected routes — not a failure. It proves the auth-redirect middleware/guard itself is functioning correctly post-fix (previously this couldn't even be reached due to the dead `AUTH_URL` port / `redirect_uri_mismatch`).

## What this retest does NOT and cannot prove

Rendering the actual **authenticated content** of `/terminal`, `/agents`, `/vault`, and `/graph` — the PowerShell terminal session, the SSE agent prompt stream, the vault note browser, and the force-graph — still requires Shepard-Commander to complete a real Google login in their own browser session. No agent has Google credentials and none should. This retest only proves the plumbing up to that point is healthy: dead port fixed, OAuth redirect URI fixed, login page renders, protected routes correctly gate on auth instead of erroring.

## TODO.md status

Per instructions, **no boxes were ticked** in `Helm-Dashboard/TODO.md`. The four boxes under "Smoke test required (Shepard-Commander)" (lines 9–12) remain `[ ]`, correctly, until Shepard-Commander (or Fable, after review) has actually seen authenticated content render in each of the four routes.

## Summary

| Check | Result |
|---|---|
| Dev server reachable on :3001 | Yes — already running (PID 39016), left running |
| `/login` renders (no redirect_uri_mismatch, no connection refused) | **Yes** — clean render + Google accepted the redirect_uri live |
| `/terminal` redirects to `/login` (not error) | **Yes** |
| `/agents` redirects to `/login` (not error) | **Yes** |
| `/vault` redirects to `/login` (not error) | **Yes** |
| `/graph` redirects to `/login` (not error) | **Yes** |
| Authenticated content verified | **No — requires Shepard-Commander's own login** |
| TODO.md boxes ticked | **No — intentionally left for Shepard-Commander/Fable** |
