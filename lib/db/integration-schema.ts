import { integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "@/lib/db/auth-schema";
import { provider, snapshotStatus } from "@/lib/db/enums";
import { projects } from "@/lib/db/product-schema";

export const userIntegrations = pgTable(
  "user_integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: provider("provider").notNull(),
    installationId: text("installation_id"),
    encryptedToken: text("encrypted_token"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    oneProviderPerUser: uniqueIndex("user_integrations_user_provider_idx").on(table.userId, table.provider),
  }),
);

export const githubRepoSnapshots = pgTable(
  "github_repo_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    openPrCount: integer("open_pr_count").default(0).notNull(),
    openPrs: jsonb("open_prs").$type<Array<Record<string, unknown>>>().default([]).notNull(),
    status: snapshotStatus("status").default("missing").notNull(),
    error: text("error"),
    fetchedAt: timestamp("fetched_at", { mode: "date" }),
  },
  (table) => ({
    projectIdx: uniqueIndex("github_repo_snapshots_project_idx").on(table.projectId),
  }),
);

export const vercelDeploymentSnapshots = pgTable(
  "vercel_deployment_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    deployment: jsonb("deployment").$type<Record<string, unknown> | null>(),
    status: snapshotStatus("status").default("missing").notNull(),
    error: text("error"),
    fetchedAt: timestamp("fetched_at", { mode: "date" }),
  },
  (table) => ({
    projectIdx: uniqueIndex("vercel_deployment_snapshots_project_idx").on(table.projectId),
  }),
);
