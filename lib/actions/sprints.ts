"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { sprints } from "@/lib/db/schema";
import { assertProjectOwner } from "@/lib/ownership";
import { requireUser } from "@/lib/session";

const sprintSchema = z.object({
  name: z.string().trim().min(1).max(80),
  goal: z.string().trim().max(500).optional(),
});

export async function createSprint(projectId: string, formData: FormData) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const input = sprintSchema.parse(Object.fromEntries(formData));

  const [existing] = await getDb()
    .select({ id: sprints.id })
    .from(sprints)
    .where(and(eq(sprints.projectId, projectId), isNull(sprints.closedAt)))
    .limit(1);
  if (existing) {
    throw new Error("This project already has an open sprint.");
  }

  await getDb().insert(sprints).values({
    projectId,
    name: input.name,
    goal: input.goal || null,
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function closeSprint(projectId: string, sprintId: string) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);

  await getDb()
    .update(sprints)
    .set({ closedAt: new Date() })
    .where(and(eq(sprints.id, sprintId), eq(sprints.projectId, projectId), isNull(sprints.closedAt)));

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}
