# Decisions — helm-dashboard

Architectural and product decisions that must not be reversed without Legion/Shepard-Commander sign-off.

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-05 | Snapshot tables are the source of truth for GitHub/Vercel data — no live API calls in RSC renders | Keeps RSC fast; external API latency is decoupled via refresh-then-read |
| 2026-05-05 | Vercel token encrypted with AES-256-GCM in DB, never in plaintext | Security requirement from PRD |
| 2026-05-05 | One open sprint per project enforced by partial unique index in DB | Enforced at DB level, not just app level |
| 2026-05-05 | All mutations through Server Actions only — no public REST API | MVP scope; simplifies auth enforcement |
| 2026-05-05 | GitHub App auth via installation ID stored in `userIntegrations`, not per-project | One installation covers all user repos |
| 2026-05-05 | Soft delete on projects and tasks (`deletedAt`) — hard delete on todos | Recoverability for project data; todos are ephemeral |
