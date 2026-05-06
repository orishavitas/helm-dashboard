import { updateTaskStatus } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/lib/view-models";

const statuses = ["todo", "in-progress", "blocked", "done"] as const;

function priorityTone(priority: TaskItem["priority"]) {
  return priority === "critical" ? "red" : priority === "high" ? "amber" : "zinc";
}

export function TaskList({
  title,
  projectId,
  tasks,
}: {
  title: string;
  projectId: string;
  tasks: TaskItem[];
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      </div>
      <div className="divide-y divide-zinc-800">
        {tasks.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">No tasks.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="grid gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-zinc-100">{task.title}</div>
                  {task.notes && <div className="mt-1 text-sm text-zinc-500">{task.notes}</div>}
                </div>
                <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <form key={status} action={updateTaskStatus.bind(null, projectId, task.id, status)}>
                    <Button type="submit" variant={task.status === status ? "primary" : "secondary"}>
                      {status}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
