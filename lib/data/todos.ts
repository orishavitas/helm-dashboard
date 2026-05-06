import { and, asc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { todos } from "@/lib/db/schema";
import type { TodoItem } from "@/lib/view-models";

export async function getGlobalTodos(userId: string): Promise<TodoItem[]> {
  const rows = await getDb()
    .select()
    .from(todos)
    .where(and(eq(todos.ownerId, userId), isNull(todos.projectId)))
    .orderBy(asc(todos.sortOrder), asc(todos.createdAt));

  return rows.map((todo) => ({
    id: todo.id,
    title: todo.title,
    done: todo.done,
  }));
}
