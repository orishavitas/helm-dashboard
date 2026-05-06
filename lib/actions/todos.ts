"use server";

import { and, eq, isNull, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { todos } from "@/lib/db/schema";
import { assertProjectOwner } from "@/lib/ownership";
import { requireUser } from "@/lib/session";

const todoSchema = z.object({
  title: z.string().trim().min(1).max(140),
  projectId: z.string().uuid().optional().or(z.literal("")),
});

export async function createTodo(formData: FormData) {
  const user = await requireUser();
  const input = todoSchema.parse(Object.fromEntries(formData));
  const projectId = input.projectId || null;
  if (projectId) {
    await assertProjectOwner(projectId, user.id);
  }

  const [last] = await getDb()
    .select({ sortOrder: max(todos.sortOrder) })
    .from(todos)
    .where(projectId ? and(eq(todos.ownerId, user.id), eq(todos.projectId, projectId)) : and(eq(todos.ownerId, user.id), isNull(todos.projectId)));

  await getDb().insert(todos).values({
    ownerId: user.id,
    projectId,
    title: input.title,
    sortOrder: Number(last?.sortOrder ?? 0) + 1,
  });
  revalidatePath(projectId ? `/projects/${projectId}` : "/");
}

export async function updateTodoDone(todoId: string, done: boolean) {
  const user = await requireUser();
  await getDb()
    .update(todos)
    .set({ done, updatedAt: new Date() })
    .where(and(eq(todos.id, todoId), eq(todos.ownerId, user.id)));

  revalidatePath("/");
}

export async function updateTodo(todoId: string, formData: FormData) {
  const user = await requireUser();
  const title = z.string().trim().min(1).max(140).parse(formData.get("title"));
  await getDb()
    .update(todos)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(todos.id, todoId), eq(todos.ownerId, user.id)));

  revalidatePath("/");
}
