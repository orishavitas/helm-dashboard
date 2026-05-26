-- Migration: agent_sessions + agent_events tables
-- Helm Dashboard Sprint 04 — Claude Code agent runner

CREATE TYPE "agent_session_status" AS ENUM (
  'pending',
  'running',
  'done',
  'error',
  'stopped'
);

CREATE TYPE "agent_event_type" AS ENUM (
  'text',
  'tool_use',
  'tool_result',
  'error',
  'done'
);

CREATE TABLE IF NOT EXISTS "agent_sessions" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id"   uuid,
  "prompt"       text NOT NULL,
  "model"        text NOT NULL DEFAULT 'claude-sonnet-4-6',
  "status"       "agent_session_status" NOT NULL DEFAULT 'pending',
  "error"        text,
  "started_at"   timestamp,
  "completed_at" timestamp,
  "created_at"   timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "agent_events" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id"  uuid NOT NULL REFERENCES "agent_sessions" ("id") ON DELETE CASCADE,
  "type"        "agent_event_type" NOT NULL,
  "text"        text,
  "payload"     jsonb NOT NULL DEFAULT '{}',
  "created_at"  timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "agent_events_session_idx"
  ON "agent_events" ("session_id", "created_at");
