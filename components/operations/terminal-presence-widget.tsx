import { Monitor } from "lucide-react";

import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { Chip } from "@/components/ui/chip";
import { formatRelativeTime } from "@/lib/utils";
import type { OverlordState } from "@/lib/view-models";

type Props = {
  terminals: OverlordState["terminals"];
};

const statusTone = {
  active: "green",
  idle: "zinc",
  blocked: "red",
  done: "blue",
  offline: "amber",
} as const satisfies Record<OverlordState["terminals"][number]["current"]["status"], React.ComponentProps<typeof Chip>["tone"]>;

function metaString(meta: Record<string, unknown>, key: string) {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export function TerminalPresenceWidget({ terminals }: Props) {
  return (
    <DashboardWidget
      title="Terminal presence"
      eyebrow="Open agents"
      icon={<Monitor className="h-4 w-4 text-indigo-300" />}
      meta={`${terminals.length} terminal${terminals.length === 1 ? "" : "s"} reporting`}
      size="full"
    >
      {terminals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">No terminal heartbeats yet.</p>
      ) : (
        <div className="grid gap-2">
          {terminals.map(({ current }) => {
            const assignee = metaString(current.meta, "assignee") ?? current.agentRole ?? "Unassigned";

            return (
              <div key={current.terminalId} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-100">{current.label}</span>
                    <Chip tone={statusTone[current.status]}>{current.status}</Chip>
                  </div>
                  <div className="mt-1 truncate font-mono text-[11px] text-zinc-600">{current.terminalId}</div>
                </div>
                <div className="min-w-0 text-xs">
                  <div className="truncate text-zinc-400">{current.repo ?? "No repo"}</div>
                  <div className="mt-1 truncate text-zinc-600">{assignee}</div>
                </div>
                <div className="min-w-0 text-xs">
                  <div className="truncate text-zinc-300">{current.currentTask ?? "No current task"}</div>
                  <div className="mt-1 truncate text-zinc-600">{metaString(current.meta, "branch") ?? current.agentRole ?? "No role"}</div>
                </div>
                <div className="text-right text-xs text-zinc-500">{formatRelativeTime(current.pushedAt)}</div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
