CREATE TYPE "project_status" AS ENUM ('active', 'paused', 'archived');
CREATE TYPE "task_status" AS ENUM ('todo', 'in-progress', 'done', 'blocked');
CREATE TYPE "task_priority" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "provider" AS ENUM ('github', 'vercel');
CREATE TYPE "snapshot_status" AS ENUM ('fresh', 'stale', 'error', 'missing');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text,
  "email" text NOT NULL UNIQUE,
  "email_verified" timestamp,
  "image" text,
  "last_signed_in_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "accounts" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "provider_account_id")
);

CREATE TABLE "sessions" (
  "session_token" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "expires" timestamp NOT NULL
);

CREATE TABLE "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

CREATE TABLE "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "description" text,
  "status" "project_status" DEFAULT 'active' NOT NULL,
  "github_repo_owner" text,
  "github_repo_name" text,
  "vercel_project_id" text,
  "vercel_project_name" text,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "sprints" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "goal" text,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "closed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "sprints_one_open_per_project"
  ON "sprints" ("project_id")
  WHERE "closed_at" IS NULL;

CREATE TABLE "tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "sprint_id" uuid REFERENCES "sprints"("id") ON DELETE set null,
  "title" text NOT NULL,
  "notes" text,
  "status" "task_status" DEFAULT 'todo' NOT NULL,
  "priority" "task_priority" DEFAULT 'medium' NOT NULL,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "todos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "done" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "user_integrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "provider" "provider" NOT NULL,
  "installation_id" text,
  "encrypted_token" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "user_integrations_user_provider_idx"
  ON "user_integrations" ("user_id", "provider");

CREATE TABLE "github_repo_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "open_pr_count" integer DEFAULT 0 NOT NULL,
  "open_prs" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" "snapshot_status" DEFAULT 'missing' NOT NULL,
  "error" text,
  "fetched_at" timestamp
);

CREATE UNIQUE INDEX "github_repo_snapshots_project_idx"
  ON "github_repo_snapshots" ("project_id");

CREATE TABLE "vercel_deployment_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "deployment" jsonb,
  "status" "snapshot_status" DEFAULT 'missing' NOT NULL,
  "error" text,
  "fetched_at" timestamp
);

CREATE UNIQUE INDEX "vercel_deployment_snapshots_project_idx"
  ON "vercel_deployment_snapshots" ("project_id");
