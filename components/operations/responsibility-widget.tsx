import { UsersRound } from "lucide-react";

import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import type { DashboardWidgetSize } from "@/components/dashboard/dashboard-widget";
import type { ResponsibilityBucket } from "@/lib/view-models";

type Props = {
  responsibility: ResponsibilityBucket[];
  size?: DashboardWidgetSize;
};

function Total({ value, label }: { value: number; label: string }) {
  return (
    <span className="grid justify-items-start gap-0.5 sm:justify-items-end">
      <span className="font-mono text-sm text-zinc-100">{value}</span>
      <span className="text-[10px] uppercase text-zinc-600">{label}</span>
    </span>
  );
}

export function ResponsibilityWidget({ responsibility, size = "full" }: Props) {
  return (
    <DashboardWidget
      title="Responsibility"
      eyebrow="Assignees"
      icon={<UsersRound className="h-4 w-4 text-blue-300" />}
      meta={`${responsibility.length} assignee${responsibility.length === 1 ? "" : "s"}`}
      size={size}
      className="h-full"
    >
      {responsibility.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">No assigned work or active terminals.</p>
      ) : (
        <div className="grid gap-2">
          {responsibility.map((bucket) => (
            <div key={bucket.assignee} className="grid min-w-0 gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-100">{bucket.assignee}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {bucket.workingTasks + bucket.pendingTasks + bucket.blockedTasks} open task
                  {bucket.workingTasks + bucket.pendingTasks + bucket.blockedTasks === 1 ? "" : "s"}
                </div>
              </div>
              <div className="grid min-w-0 grid-cols-3 gap-3 sm:grid-cols-5 sm:text-right">
                <Total label="term" value={bucket.activeTerminals} />
                <Total label="work" value={bucket.workingTasks} />
                <Total label="pend" value={bucket.pendingTasks} />
                <Total label="block" value={bucket.blockedTasks} />
                <Total label="done" value={bucket.finishedTasks} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
