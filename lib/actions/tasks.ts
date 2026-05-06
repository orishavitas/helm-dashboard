"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { assertProjectOwner } from "@/lib/ownership";
import { requireUser } from "@/lib/session";

const taskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(800).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  sprintId: z.string().uuid().optional().or(z.literal("")),
});

export async function createTask(projectId: string, formData: FormData) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const input = taskSchema.parse(Object.fromEntries(formData));

  await getDb().insert(tasks).values({
    projectId,
    sprintId: input.sprintId || null,
    title: input.title,
    notes: input.notes || null,
    priority: input.priority,
  });
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateTaskStatus(projectId: string, taskId: string, status: "todo" | "in-progress" | "done" | "blocked") {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);

  await getDb()
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId), isNull(tasks.deletedAt)));

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateTask(projectId: string, taskId: string, formData: FormData) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const input = taskSchema.parse(Object.fromEntries(formData));

  await getDb()
    .update(tasks)
    .set({
      title: input.title,
      notes: input.notes || null,
      priority: input.priority,
      sprintId: input.sprintId || null,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId), isNull(tasks.deletedAt)));

  revalidatePath(`/projects/${projectId}`);
}
