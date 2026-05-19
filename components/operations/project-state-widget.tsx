import { Boxes } from "lucide-react";

import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import type { OperationsProjectState } from "@/lib/view-models";

type Props = {
  projects: OperationsProjectState[];
};

const stateTone = {
  blocked: "red",
  working: "blue",
  pending: "amber",
  idle: "zinc",
} as const satisfies Record<OperationsProjectState["derivedState"], React.ComponentProps<typeof Chip>["tone"]>;

const stateDot = {
  blocked: "bg-red-400",
  working: "bg-blue-400",
  pending: "bg-amber-400",
  idle: "bg-zinc-600",
} as const satisfies Record<OperationsProjectState["derivedState"], string>;

function Count({ label, value }: { label: string; value: number }) {
  return (
    <span className="grid min-w-11 justify-items-center gap-0.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1">
      <span className="font-mono text-sm text-zinc-100">{value}</span>
      <span className="text-[10px] uppercase text-zinc-600">{label}</span>
    </span>
  );
}

export function ProjectStateWidget({ projects }: Props) {
  return (
    <DashboardWidget
      title="Project state"
      eyebrow="Operations"
      icon={<Boxes className="h-4 w-4 text-zinc-300" />}
      meta={`${projects.length} project${projects.length === 1 ? "" : "s"} in scope`}
      size="full"
    >
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">No projects to aggregate.</p>
      ) : (
        <div className="grid gap-2">
          {projects.map((project) => (
            <div key={project.id} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 lg:grid-cols-[minmax(0,1.4fr)_auto_minmax(150px,220px)] lg:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", stateDot[project.derivedState])} />
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-100">{project.name}</span>
                    <Chip tone={stateTone[project.derivedState]}>{project.derivedState}</Chip>
                  </div>
                  <div className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span className="truncate">{project.sprintName ?? "No open sprint"}</span>
                    <span className="truncate">Stage: {project.productProgress.stage}</span>
                    <span className="font-mono">{project.productProgress.percent}%</span>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap gap-2">
                <Count label="term" value={project.activeTerminalCount} />
                <Count label="work" value={project.workingTaskCount} />
                <Count label="pend" value={project.pendingTaskCount} />
                <Count label="block" value={project.blockedTaskCount} />
                <Count label="done" value={project.finishedTaskCount} />
              </div>
              <div className="min-w-0">
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-950">
                  <div className="h-full rounded-full bg-indigo-400" style={{ width: `${project.productProgress.percent}%` }} />
                </div>
                <div className="mt-2 truncate text-right text-xs text-zinc-500">{project.productProgress.maturity}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
