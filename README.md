# file-management-agent

## Goal
Sort unsorted files into correct Dropbox folders, maintain product line folder structure, and sync Gmail/Drive/Monday with local libraries.

## Repo Map
- `docs/` - PRD, roadmap, architecture, and Helm dashboard notes.
- `workflows/` - Core automation logic.
- `integrations/` - External service adapters.
- `tests/` - Automated tests.
- `app/`, `components/`, `lib/`, `drizzle/` - Helm dashboard web app.

## Quick Start
1. Install dependencies:
   - Python agent: use the existing `.venv` or `uv` flow from `CLAUDE.md`.
   - Helm dashboard: `corepack pnpm install`.
2. Configure environment variables:
   - Python agent paths remain in `.env.example`.
   - Helm dashboard env contract is documented in `docs/helm-dashboard.md`.
3. Run automation:
   - Python agent: `python agent.py --help`.
   - Helm dashboard: `corepack pnpm dev`.
