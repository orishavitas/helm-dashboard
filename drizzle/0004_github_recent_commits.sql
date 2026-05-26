ALTER TABLE "github_repo_snapshots"
ADD COLUMN IF NOT EXISTS "recent_commits" jsonb DEFAULT '[]'::jsonb NOT NULL;
