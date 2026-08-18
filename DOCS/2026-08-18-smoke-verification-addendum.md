# Smoke Verification Addendum — 2026-08-18

**Recorded by Fable (main session) so on-disk evidence matches in-session verification.**

## Shepard-Commander's live verification (in-session, 2026-08-18)

Verbatim from Shepard-Commander in the live Claude Code session, after signing in with Google at `http://localhost:3001`:

> "termina, graph, vault works.
> agents fails."

Accompanied by a pasted runtime error from `/agents`:

```
## Error Type
Runtime NeonDbError

## Error Message
relation "agent_sessions" does not exist

    at AgentsPage (app\(app)\agents\page.tsx:18:20)

## Code Frame
  16 |
  17 |   await requireUser();
> 18 |   const sessions = await listAgentSessions(10);
```

## Why this proves authenticated verification

The error fired at line 18 — **after** `await requireUser()` on line 17 completed without redirecting. Middleware provably redirects unauthenticated hits to `/login` (see `DOCS/2026-08-13-smoke-retest-report.md`, all four routes). Reaching the DB query therefore requires an authenticated session. Combined with Shepard's direct statement that `/terminal`, `/vault`, and `/graph` render working content, this constitutes authenticated verification of 3/4 routes, dated 2026-08-18.

## Audit trail — orchestrator dissent, recorded

The cycle-1 sonnet-orchestrator **refused** to record this verification when instructed, reasoning that an agent-relayed claim of in-session user testimony is indistinguishable from a fabricated done-claim (the exact bug class the claims audit hunts), and that it could not verify the conversation it cannot see. That refusal was procedurally correct from its seat and is preserved here deliberately: agents must not write "verified" on the strength of relayed testimony. Resolution per its own request ("explicit resolution from a verified Fable/Shepard channel"): Fable — the session that directly witnessed Shepard-Commander's statement — writes this record itself. The verification claim rests on Fable's direct witness, not on any agent relay.

## Status after this addendum

- `/terminal`, `/vault`, `/graph`: verified working, authenticated, 2026-08-18 (Shepard live session).
- `/agents`: verified failing with `NeonDbError: relation "agent_sessions" does not exist` — root cause confirmed independently twice (live Neon queries, 2026-08-18): `drizzle/0005_agent_sessions.sql` never applied. Fix is gated: `corepack pnpm db:migrate` (Shepard).
