import { Monitor } from "lucide-react";

import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { Chip } from "@/components/ui/chip";
import { formatRelativeTime } from "@/lib/utils";
import type { TerminalRepoGroup } from "@/lib/terminal-presence";

type Props = {
  groups: TerminalRepoGroup[];
};

const statusTone = {
  active: "green",
  idle: "zinc",
  blocked: "red",
  done: "blue",
  offline: "amber",
} as const;

function metaString(meta: Record<string, unknown>, key: string) {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function compactHistory(history: TerminalRepoGroup["assignees"][number]["terminals"][number]["history"]) {
  return history.slice(0, 3);
}

export function TerminalPresenceWidget({ groups }: Props) {
  const terminalCount = groups.reduce((total, group) => total + group.terminalCount, 0);
  const offlineCount = groups.reduce((total, group) => total + group.offlineCount, 0);

  return (
    <DashboardWidget
      title="Terminal presence"
      eyebrow="Repos and assignees"
      icon={<Monitor className="h-4 w-4 text-indigo-300" />}
      meta={`${terminalCount} terminal${terminalCount === 1 ? "" : "s"} / ${offlineCount} offline`}
      size="full"
    >
      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">No terminal heartbeats yet.</p>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <section key={group.repo} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{group.repo}</h3>
                  <p className="mt-1 text-xs text-zinc-600">
                    {group.activeCount} active / {group.offlineCount} offline / {group.terminalCount} total
                  </p>
                </div>
                <Chip tone={group.offlineCount > 0 ? "amber" : "green"}>{group.offlineCount > 0 ? "stale heartbeat" : "live"}</Chip>
              </div>
              <div className="grid gap-3">
                {group.assignees.map((assignee) => (
                  <div key={`${group.repo}-${assignee.assignee}`} className="grid gap-2">
                    <div className="text-xs font-medium uppercase text-zinc-500">{assignee.assignee}</div>
                    {assignee.terminals.map(({ current, history }) => (
                      <div
                        key={current.terminalId}
                        className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-start"
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-semibold text-zinc-100">{current.label}</span>
                            <Chip tone={statusTone[current.status]}>{current.status}</Chip>
                          </div>
                          <div className="mt-1 truncate font-mono text-[11px] text-zinc-600">{current.terminalId}</div>
                        </div>
                        <div className="min-w-0 text-xs">
                          <div className="line-clamp-2 text-zinc-300">{current.currentTask ?? "No current task"}</div>
                          <div className="mt-1 truncate text-zinc-600">{metaString(current.meta, "branch") ?? current.agentRole ?? "No role"}</div>
                        </div>
                        <ol className="grid gap-1 text-xs text-zinc-600">
                          {compactHistory(history).length === 0 ? (
                            <li>No prior heartbeat</li>
                          ) : (
                            compactHistory(history).map((snapshot) => (
                              <li key={snapshot.id} className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0">{snapshot.status}</span>
                                <span className="truncate">{snapshot.currentTask ?? "No task"}</span>
                              </li>
                            ))
                          )}
                        </ol>
                        <div className="text-right text-xs text-zinc-500">{formatRelativeTime(current.pushedAt)}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
