import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", [
  "active",
  "paused",
  "archived",
]);
export const taskStatus = pgEnum("task_status", [
  "todo",
  "in-progress",
  "done",
  "blocked",
]);
export const taskPriority = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const provider = pgEnum("provider", ["github", "vercel"]);
export const snapshotStatus = pgEnum("snapshot_status", [
  "fresh",
  "stale",
  "error",
  "missing",
]);
