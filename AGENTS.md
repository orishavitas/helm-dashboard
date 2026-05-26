## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
---

## Nexus Dispatch Contract

This repo uses Nexus for task dispatch and verification.

**Dispatch source:** .agent-harness/inbox/{task-id}.md — read the task packet before starting any work.
**Writeback:** .agent-harness/outbox/{task-id}.result.md — populate all required fields, no placeholders.
**Evidence:** .agent-harness/artifacts/{task-id}/test_results.txt — save test output here.
**monday:** Mirror-only behind NEXUS_MONDAY_ENABLED=false. Do not read monday for dispatch, state, or acceptance criteria.

### Required Result Fields

- summary, changed_files, commands_run, esults, isks, ollow_ups, monday_update

### Vault Ingest (Automatic)

Every session triggers vault ingest at Stop via session_stop.py → ault_ingest_agent.py (Mapper role).

**Manual re-run if hook failed:**
`ash
python C:\Users\OriShavit\Documents\GitHub\project_nexus\scripts\vault_ingest_agent.py --runtime codex --session-id manual --repo-path C:\Users\OriShavit\Documents\GitHub\Helm-Dashboard
`

**Constraint:** Do not write directly to system/, projects/, or aw/repos/ in the vault.

### Completion Anchors

Every completed task must update TODO.md, MEMORY.md, and CHANGELOG.md before claiming done.
Name the completing agent and session date in each update.
