import { Activity, AlertTriangle, CheckCircle2, Clock, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { TerminalSnapshot } from "@/lib/view-models";

const STATUS_TONE = {
  active: "green",
  idle: "zinc",
  blocked: "amber",
  done: "zinc",
  offline: "zinc",
} as const satisfies Record<TerminalSnapshot["status"], "green" | "amber" | "zinc">;

const STATUS_ICON = {
  active: Activity,
  idle: Clock,
  blocked: AlertTriangle,
  done: CheckCircle2,
  offline: WifiOff,
} as const;

const STATUS_ICON_CLASS = {
  active: "text-emerald-300",
  idle: "text-zinc-400",
  blocked: "text-amber-300",
  done: "text-zinc-300",
  offline: "text-zinc-500",
} as const satisfies Record<TerminalSnapshot["status"], string>;

type Props = {
  current: TerminalSnapshot;
  history: TerminalSnapshot[];
};

function StatusIcon({ status, className }: { status: TerminalSnapshot["status"]; className?: string }) {
  const Icon = STATUS_ICON[status];
  return <Icon className={cn("h-3.5 w-3.5", STATUS_ICON_CLASS[status], className)} />;
}

function compactTask(task: string | null) {
  if (!task) {
    return "";
  }

  return task.length > 44 ? `${task.slice(0, 41)}...` : task;
}

export function OverlordTerminalCard({ current, history }: Props) {
  return (
    <article className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-50">{current.label}</h3>
          <p className="mt-1 truncate text-xs text-zinc-500">{current.terminalId}</p>
        </div>
        <Badge tone={STATUS_TONE[current.status]}>
          <span className="inline-flex items-center gap-1.5">
            <StatusIcon status={current.status} />
            {current.status}
          </span>
        </Badge>
      </div>

      <div className="min-h-10">
        <p className="line-clamp-2 text-sm text-zinc-300">{current.currentTask ?? "No active task reported."}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="min-w-0">
          <dt className="text-zinc-600">Repo</dt>
          <dd className="truncate text-zinc-400">{current.repo ?? "not reported"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-600">Role</dt>
          <dd className="truncate text-zinc-400">{current.agentRole ?? "not reported"}</dd>
        </div>
        <div>
          <dt className="text-zinc-600">Context</dt>
          <dd className={cn("font-medium text-zinc-400", current.contextPct != null && current.contextPct >= 80 && "text-amber-300")}>
            {current.contextPct == null ? "unknown" : `${current.contextPct}%`}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-600">Pushed</dt>
          <dd className="text-zinc-400">{formatRelativeTime(current.pushedAt)}</dd>
        </div>
      </dl>

      {history.length > 0 && (
        <ol className="grid gap-2 border-t border-zinc-800 pt-3">
          {history.map((snapshot) => (
            <li key={snapshot.id} className="flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span className="flex min-w-0 items-center gap-2">
                <StatusIcon status={snapshot.status} />
                <span className="shrink-0">{snapshot.status}</span>
                {snapshot.currentTask && <span className="truncate text-zinc-600">{compactTask(snapshot.currentTask)}</span>}
              </span>
              <span className="shrink-0 text-zinc-600">{formatRelativeTime(snapshot.pushedAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
