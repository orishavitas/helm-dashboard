import { relations } from "drizzle-orm";

import { projects, sprints, tasks, todos } from "@/lib/db/product-schema";

export * from "@/lib/db/auth-schema";
export * from "@/lib/db/enums";
export * from "@/lib/db/integration-schema";
export * from "@/lib/db/overlord-schema";
export * from "@/lib/db/product-schema";

export const projectRelations = relations(projects, ({ many }) => ({
  sprints: many(sprints),
  tasks: many(tasks),
  todos: many(todos),
}));
