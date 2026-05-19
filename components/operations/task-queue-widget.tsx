import { ListChecks } from "lucide-react";

import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import type { DashboardWidgetSize } from "@/components/dashboard/dashboard-widget";
import { Chip } from "@/components/ui/chip";
import type { OperationsState, OperationsTask } from "@/lib/view-models";

type Props = {
  tasks: OperationsState["tasks"];
  size?: DashboardWidgetSize;
};

const columns = [
  { key: "working", label: "Working", tone: "blue" },
  { key: "blocked", label: "Blocked", tone: "red" },
  { key: "pending", label: "Pending", tone: "amber" },
  { key: "finished", label: "Finished", tone: "green" },
] as const satisfies Array<{
  key: keyof OperationsState["tasks"];
  label: string;
  tone: React.ComponentProps<typeof Chip>["tone"];
}>;

function TaskRow({ task, blocked }: { task: OperationsTask; blocked?: boolean }) {
  return (
    <li className="grid min-w-0 gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-zinc-100" title={task.title}>
          {task.title}
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="truncate">{task.projectName}</span>
          <span className="text-zinc-700">/</span>
          <span className="truncate">{task.assignee ?? "Unassigned"}</span>
        </div>
      </div>
      {blocked && task.blockedReason && (
        <p className="line-clamp-2 rounded-md border border-red-900/60 bg-red-950/30 px-2 py-1.5 text-xs text-red-200">
          {task.blockedReason}
        </p>
      )}
    </li>
  );
}

export function TaskQueueWidget({ tasks, size = "full" }: Props) {
  const total = tasks.working.length + tasks.blocked.length + tasks.pending.length + tasks.finished.length;

  return (
    <DashboardWidget
      title="Task queue"
      eyebrow="Flow"
      icon={<ListChecks className="h-4 w-4 text-amber-300" />}
      meta={`${total} task${total === 1 ? "" : "s"} shown`}
      size={size}
      className="h-full"
    >
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = tasks[column.key];

          return (
            <section key={column.key} className="grid min-w-0 content-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <header className="flex items-center justify-between gap-3">
                <h3 className="truncate text-xs font-semibold uppercase text-zinc-500">{column.label}</h3>
                <Chip tone={column.tone}>{columnTasks.length}</Chip>
              </header>
              {columnTasks.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-800 p-3 text-xs text-zinc-600">No {column.label.toLowerCase()} tasks.</p>
              ) : (
                <ul className="grid gap-2">
                  {columnTasks.slice(0, 6).map((task) => (
                    <TaskRow key={task.id} task={task} blocked={column.key === "blocked"} />
                  ))}
                </ul>
              )}
              {columnTasks.length > 6 && <div className="text-xs text-zinc-600">+{columnTasks.length - 6} more</div>}
            </section>
          );
        })}
      </div>
    </DashboardWidget>
  );
}
