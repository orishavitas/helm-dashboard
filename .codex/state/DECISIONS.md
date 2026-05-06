# Decisions - helm-dashboard

Architectural and product decisions that must not be reversed without Legion/Shepard-Commander sign-off.

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-05 | Snapshot tables are the source of truth for GitHub/Vercel data; no live API calls in RSC renders | Keeps RSC fast; external API latency is decoupled via refresh-then-read |
| 2026-05-05 | Vercel token encrypted with AES-256-GCM in DB, never in plaintext | Security requirement from PRD |
| 2026-05-05 | One open sprint per project enforced by partial unique index in DB | Enforced at DB level, not just app level |
| 2026-05-05 | All product mutations through Server Actions only | MVP scope; simplifies auth enforcement |
| 2026-05-05 | GitHub App auth via installation ID stored in `userIntegrations`, not per-project | One installation covers all user repos |
| 2026-05-05 | Soft delete on projects and tasks (`deletedAt`); hard delete on todos | Recoverability for project data; todos are ephemeral |
| 2026-05-06 | Overlord push API is the exception to the no-public-mutations rule and is protected by `OVERLORD_PUSH_SECRET` bearer auth | Agent terminals need a low-friction heartbeat endpoint outside browser sessions |
| 2026-05-06 | No remote git push for Helm-Dashboard unless a baseline project contract explicitly requires it | Local implementation and verification are enough for this sprint handoff; remote push remains a gate |
| 2026-05-06 | Every active repo must have `graphify-out/`, repo-local Graphify Codex guidance, and Graphify update hooks where supported | Architecture/codebase questions and post-code-change updates need a durable automated graph surface |
| 2026-05-06 | Codex must check usage/context every work round and at least every 5 minutes; at 75% context pause for status/quartet/handoff, at 90% session usage stop after checkpointing | Keeps Claude/Codex sync and restart safety intact during autonomous work |
