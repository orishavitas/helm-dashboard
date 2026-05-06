CREATE TYPE "terminal_status" AS ENUM ('active', 'idle', 'blocked', 'done', 'offline');

CREATE TABLE "terminal_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "terminal_id" text NOT NULL,
  "label" text NOT NULL,
  "status" "terminal_status" DEFAULT 'offline' NOT NULL,
  "current_task" text,
  "repo" text,
  "agent_role" text,
  "context_pct" integer,
  "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "pushed_at" timestamp DEFAULT now() NOT NULL
);
