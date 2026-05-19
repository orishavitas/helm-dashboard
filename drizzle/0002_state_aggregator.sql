ALTER TABLE "tasks" ADD COLUMN "assignee" text;
ALTER TABLE "tasks" ADD COLUMN "agent_role" text;
ALTER TABLE "tasks" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;
ALTER TABLE "tasks" ADD COLUMN "source_ref" text;
ALTER TABLE "tasks" ADD COLUMN "source_url" text;
ALTER TABLE "tasks" ADD COLUMN "blocked_reason" text;
ALTER TABLE "tasks" ADD COLUMN "finished_at" timestamp;
