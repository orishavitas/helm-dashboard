import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { projectStatus, taskPriority, taskStatus } from "@/lib/db/enums";
import { users } from "@/lib/db/auth-schema";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: projectStatus("status").default("active").notNull(),
    githubRepoOwner: text("github_repo_owner"),
    githubRepoName: text("github_repo_name"),
    vercelProjectId: text("vercel_project_id"),
    vercelProjectName: text("vercel_project_name"),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueLiveProjectName: uniqueIndex("projects_owner_name_live_unique").on(table.ownerId, table.name).where(sql`${table.deletedAt} is null`),
  }),
);

export const sprints = pgTable(
  "sprints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    goal: text("goal"),
    startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
    closedAt: timestamp("closed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    oneOpenSprint: uniqueIndex("sprints_one_open_per_project").on(table.projectId).where(sql`${table.closedAt} is null`),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    sprintId: uuid("sprint_id").references(() => sprints.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    notes: text("notes"),
    status: taskStatus("status").default("todo").notNull(),
    priority: taskPriority("priority").default("medium").notNull(),
    assignee: text("assignee"),
    agentRole: text("agent_role"),
    source: text("source").default("manual").notNull(),
    sourceRef: text("source_ref"),
    sourceUrl: text("source_url"),
    blockedReason: text("blocked_reason"),
    finishedAt: timestamp("finished_at", { mode: "date" }),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueLiveSourceRef: uniqueIndex("tasks_source_ref_live_unique")
      .on(table.source, table.sourceRef)
      .where(sql`${table.deletedAt} is null and ${table.sourceRef} is not null`),
  }),
);

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  done: boolean("done").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
