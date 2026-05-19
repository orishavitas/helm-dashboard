import { Activity, Boxes, Gauge, GitBranch, ListChecks, Plus, Rocket, TerminalSquare } from "lucide-react";

import { ProjectForm } from "@/components/forms/project-form";
import { TodoForm } from "@/components/forms/todo-form";
import { OverlordPanel } from "@/components/overlord-panel";
import { ProductProgressBlockers } from "@/components/product-progress";
import { ProjectCard } from "@/components/project-card";
import { TodoList } from "@/components/todo-list";
import { Chip } from "@/components/ui/chip";
import { DashboardWidget, type DashboardWidgetSize } from "@/components/dashboard/dashboard-widget";
import type { ProjectSummary, TodoItem } from "@/lib/view-models";

type DashboardWidgetContext = {
  projects: ProjectSummary[];
  todos: TodoItem[];
};

type DashboardWidgetId =
  | "run-snapshot"
  | "integration-health"
  | "overlord"
  | "projects"
  | "command-deck"
  | "global-todos";

type DashboardWidgetConfig = {
  id: DashboardWidgetId;
  size: DashboardWidgetSize;
};

export const dashboardLayout = [
  { id: "run-snapshot", size: "half" },
  { id: "integration-health", size: "half" },
  { id: "overlord", size: "full" },
  { id: "projects", size: "wide" },
  { id: "command-deck", size: "side" },
  { id: "global-todos", size: "side" },
] as const satisfies DashboardWidgetConfig[];

type DashboardWidgetDefinition = {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  framed?: boolean;
  meta?: (context: DashboardWidgetContext) => React.ReactNode;
  render: (context: DashboardWidgetContext) => React.ReactNode;
};

function averageProgress(projects: ProjectSummary[]) {
  if (projects.length === 0) {
    return 0;
  }
  return Math.round(projects.reduce((total, project) => total + project.productProgress.percent, 0) / projects.length);
}

function integrationStatus(projects: ProjectSummary[]) {
  return projects.reduce(
    (acc, project) => {
      for (const provider of [project.github, project.vercel]) {
        acc[provider.status] += 1;
      }
      return acc;
    },
    { fresh: 0, stale: 0, error: 0, missing: 0 },
  );
}

function deployLabel(project: ProjectSummary) {
  return project.vercel.deploymentStatus ?? project.vercel.status;
}

function RunSnapshotWidget({ projects }: DashboardWidgetContext) {
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const average = averageProgress(projects);
  const blockers = projects.reduce((total, project) => total + project.productProgress.blockers.length, 0);
  const openPrs = projects.reduce((total, project) => total + (project.openPrCount ?? 0), 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Metric label="Average progress" value={`${average}%`} icon={<Gauge className="h-4 w-4 text-blue-300" />} />
      <Metric label="Active projects" value={`${activeProjects}/${projects.length}`} icon={<Boxes className="h-4 w-4 text-indigo-300" />} />
      <Metric label="Open PRs" value={String(openPrs)} icon={<GitBranch className="h-4 w-4 text-zinc-300" />} />
      <Metric label="Missing signals" value={String(blockers)} icon={<Activity className="h-4 w-4 text-amber-300" />} />
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase text-zinc-600">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-50">{value}</div>
    </div>
  );
}

function IntegrationHealthWidget({ projects }: DashboardWidgetContext) {
  const status = integrationStatus(projects);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip tone="green">fresh {status.fresh}</Chip>
        <Chip tone="amber">stale {status.stale}</Chip>
        <Chip tone="red">error {status.error}</Chip>
        <Chip tone="zinc">missing {status.missing}</Chip>
      </div>
      <div className="grid gap-2">
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">No projects to inspect.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="truncate font-medium text-zinc-100">{project.name}</span>
                <Chip tone={project.productProgress.blockers.length > 0 ? "amber" : "green"}>
                  {project.productProgress.blockers.length || "clear"}
                </Chip>
              </div>
              <div className="grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                <span className="truncate">GitHub: {project.github.status}</span>
                <span className="truncate">Vercel: {deployLabel(project)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProjectsWidget({ projects }: DashboardWidgetContext) {
  if (projects.length === 0) {
    return <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-sm text-zinc-500">No active projects yet.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function CommandDeckWidget({ projects }: DashboardWidgetContext) {
  const lowestSignal = projects
    .slice()
    .sort((a, b) => a.productProgress.percent - b.productProgress.percent)[0];

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Plus className="h-4 w-4 text-indigo-300" />
        New project
      </div>
      <ProjectForm />
      {lowestSignal && (
        <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm font-semibold text-zinc-100">Lowest-signal project</div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-zinc-400">{lowestSignal.name}</span>
            <Chip tone="blue">{lowestSignal.productProgress.percent}%</Chip>
          </div>
          <ProductProgressBlockers progress={lowestSignal.productProgress} />
        </div>
      )}
    </div>
  );
}

function GlobalTodosWidget({ todos }: DashboardWidgetContext) {
  return (
    <div className="grid gap-3">
      <TodoForm />
      <TodoList todos={todos} />
    </div>
  );
}

export const dashboardWidgetRegistry: Record<DashboardWidgetId, DashboardWidgetDefinition> = {
  "run-snapshot": {
    title: "Run snapshot",
    eyebrow: "Workspace",
    icon: <Gauge className="h-4 w-4 text-blue-300" />,
    meta: ({ projects }) => `${projects.length} visible project${projects.length === 1 ? "" : "s"}`,
    render: (context) => <RunSnapshotWidget {...context} />,
  },
  "integration-health": {
    title: "Integration health",
    eyebrow: "Signals",
    icon: <Rocket className="h-4 w-4 text-emerald-300" />,
    meta: ({ projects }) => `${projects.length * 2} provider slots`,
    render: (context) => <IntegrationHealthWidget {...context} />,
  },
  overlord: {
    title: "Overlord Monitor",
    eyebrow: "Terminals",
    icon: <TerminalSquare className="h-4 w-4 text-indigo-300" />,
    meta: () => "2 minute polling",
    render: () => <OverlordPanel showHeader={false} />,
  },
  projects: {
    title: "Projects",
    eyebrow: "Product progress",
    icon: <Boxes className="h-4 w-4 text-zinc-300" />,
    framed: false,
    meta: ({ projects }) => `${averageProgress(projects)}% average modeled completion`,
    render: (context) => <ProjectsWidget {...context} />,
  },
  "command-deck": {
    title: "Command deck",
    eyebrow: "Create",
    icon: <Plus className="h-4 w-4 text-indigo-300" />,
    render: (context) => <CommandDeckWidget {...context} />,
  },
  "global-todos": {
    title: "Global todos",
    eyebrow: "Open loops",
    icon: <ListChecks className="h-4 w-4 text-amber-300" />,
    meta: ({ todos }) => `${todos.filter((todo) => !todo.done).length} open`,
    render: (context) => <GlobalTodosWidget {...context} />,
  },
};

export function DashboardWidgetGrid({ projects, todos }: DashboardWidgetContext) {
  const context = { projects, todos };

  return (
    <div className="grid grid-cols-12 gap-4 xl:gap-6">
      {dashboardLayout.map((item) => {
        const widget = dashboardWidgetRegistry[item.id];

        return (
          <DashboardWidget
            key={item.id}
            title={widget.title}
            eyebrow={widget.eyebrow}
            icon={widget.icon}
            meta={widget.meta?.(context)}
            size={item.size}
            framed={widget.framed}
          >
            {widget.render(context)}
          </DashboardWidget>
        );
      })}
    </div>
  );
}
