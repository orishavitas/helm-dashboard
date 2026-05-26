## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Current Helm State

- Sprint 02 is implemented locally: cached GitHub PR/commit drill-downs, `recent_commits` snapshot storage, project card/detail GitHub activity, and grouped terminal presence by repo/assignee.
- Terminal presence derives `offline` at read time when the latest heartbeat is older than 10 minutes; the heartbeat push protocol remains unchanged.
- `corepack pnpm build` uses `next build --turbopack`; the standard webpack build path hung before compilation in this environment while Turbopack completed cleanly.
- `scripts/helm-sync-local.ps1` is still one-way into Helm through `POST /api/operations/import` and uses stable source refs for delete-free upserts.
- Remaining review item: authenticated browser visual verification for `/` and `/projects/[id]`.

## Key Sprint 02 Files

- `lib/github-snapshot.ts`
- `lib/terminal-presence.ts`
- `app/api/github/repos/[projectId]/pull-requests/route.ts`
- `app/api/github/repos/[projectId]/commits/route.ts`
- `DOCS/sprints/2026-05-20-helm-dashboard-sprint-02-github-terminal-presence.md`

---

## Nexus Dispatch Contract

This repo uses Nexus for task dispatch and verification.

**Dispatch source:** .agent-harness/inbox/{task-id}.md â€” read the task packet before starting any work.
**Writeback:** .agent-harness/outbox/{task-id}.result.md â€” populate all required fields, no placeholders.
**Evidence:** .agent-harness/artifacts/{task-id}/test_results.txt â€” save test output here.
**monday:** Mirror-only behind NEXUS_MONDAY_ENABLED=false. Do not read monday for dispatch, state, or acceptance criteria.

### Required Result Fields

- summary, changed_files, commands_run,
esults,
isks, ollow_ups, monday_update

### Vault Ingest (Automatic)

Every session triggers vault ingest at Stop via session_stop.py â†’ ault_ingest_agent.py (Mapper role).

**Manual re-run if hook failed:**
`ash
python C:\Users\OriShavit\Documents\GitHub\project_nexus\scripts\vault_ingest_agent.py --runtime codex --session-id manual --repo-path C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard
`

**Constraint:** Do not write directly to system/, projects/, or
aw/repos/ in the vault.

### Completion Anchors

Every completed task must update TODO.md, MEMORY.md, and CHANGELOG.md before claiming done.
Name the completing agent and session date in each update.
