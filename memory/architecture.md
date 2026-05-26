# Helm Architecture Memory

## 2026-05-21 - Sprint 02 Handoff

- GitHub dashboard state is intentionally cached through `github_repo_snapshots`; project cards, project detail, and drill-down endpoints should agree from this table instead of calling GitHub independently during render.
- `recent_commits` was added in `drizzle/0004_github_recent_commits.sql` and already applied with `corepack pnpm db:migrate` during the Sprint 02 implementation session.
- Terminal liveness is derived in `lib/terminal-presence.ts`: if the latest heartbeat is older than 10 minutes, the read model reports `offline` and preserves the original reported status in `meta.reportedStatus`.
- Local sync remains delete-free and one-way into Helm. Match imported rows by stable `source` + `sourceRef`; do not make Helm the source of truth for repo/sprint/task files.
- Build note: keep `corepack pnpm build` on `next build --turbopack` unless the standard webpack build hang is diagnosed and fixed.
