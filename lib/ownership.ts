import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export async function assertProjectOwner(projectId: string, userId: string) {
  const [project] = await getDb()
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}
