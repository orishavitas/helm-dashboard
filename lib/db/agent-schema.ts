import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const agentSessionStatus = pgEnum("agent_session_status", [
  "pending",
  "running",
  "done",
  "error",
  "stopped",
]);

export const agentEventType = pgEnum("agent_event_type", [
  "text",
  "tool_use",
  "tool_result",
  "error",
  "done",
]);

/**
 * One row per Claude Code agent invocation.
 * `projectId` is nullable — sessions can be scoped to a project or global.
 */
export const agentSessions = pgTable("agent_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id"),
  prompt: text("prompt").notNull(),
  model: text("model").notNull().default("claude-sonnet-4-6"),
  status: agentSessionStatus("status").notNull().default("pending"),
  error: text("error"),
  startedAt: timestamp("started_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Streamed events from a Claude Code agent session — appended as they arrive.
 * `payload` holds the full event object from the Anthropic SDK.
 */
export const agentEvents = pgTable("agent_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => agentSessions.id, { onDelete: "cascade" }),
  type: agentEventType("type").notNull(),
  text: text("text"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
