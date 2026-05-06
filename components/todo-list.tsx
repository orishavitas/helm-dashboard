import { CheckCircle2, Circle } from "lucide-react";

import { updateTodoDone } from "@/lib/actions/todos";
import { Button } from "@/components/ui/button";
import type { TodoItem } from "@/lib/view-models";

export function TodoList({ todos }: { todos: TodoItem[] }) {
  return (
    <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
      {todos.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">No todos.</p>
      ) : (
        todos.map((todo) => (
          <div key={todo.id} className="flex items-center justify-between gap-3 p-3">
            <span className={todo.done ? "text-sm text-zinc-500 line-through" : "text-sm text-zinc-100"}>
              {todo.title}
            </span>
            <form action={updateTodoDone.bind(null, todo.id, !todo.done)}>
              <Button type="submit" variant="ghost" aria-label={todo.done ? "Mark todo open" : "Mark todo done"}>
                {todo.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
