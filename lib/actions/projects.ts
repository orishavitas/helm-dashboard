"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { assertProjectOwner } from "@/lib/ownership";
import { requireUser } from "@/lib/session";

const projectSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  status: z.enum(["active", "paused", "archived"]).default("active"),
});

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const input = projectSchema.parse(Object.fromEntries(formData));
  const [project] = await getDb()
    .insert(projects)
    .values({
      ownerId: user.id,
      name: input.name,
      description: input.description || null,
      status: input.status,
    })
    .returning({ id: projects.id });

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const input = projectSchema.parse(Object.fromEntries(formData));

  await getDb()
    .update(projects)
    .set({ ...input, description: input.description || null, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id), isNull(projects.deletedAt)));

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function softDeleteProject(projectId: string) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);

  await getDb()
    .update(projects)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath("/");
  redirect("/");
}
