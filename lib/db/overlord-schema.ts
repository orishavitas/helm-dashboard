import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { terminalStatus } from "@/lib/db/enums";

export const terminalSnapshots = pgTable("terminal_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  terminalId: text("terminal_id").notNull(),
  label: text("label").notNull(),
  status: terminalStatus("status").default("offline").notNull(),
  currentTask: text("current_task"),
  repo: text("repo"),
  agentRole: text("agent_role"),
  contextPct: integer("context_pct"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}).notNull(),
  pushedAt: timestamp("pushed_at", { mode: "date" }).defaultNow().notNull(),
});
