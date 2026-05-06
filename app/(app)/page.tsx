import { Plus } from "lucide-react";

import { ProjectForm } from "@/components/forms/project-form";
import { TodoForm } from "@/components/forms/todo-form";
import { OverlordPanel } from "@/components/overlord-panel";
import { ProjectCard } from "@/components/project-card";
import { TodoList } from "@/components/todo-list";
import { getProjectSummaries } from "@/lib/data/projects";
import { getGlobalTodos } from "@/lib/data/todos";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const [projects, todos] = await Promise.all([
    getProjectSummaries(user.id),
    getGlobalTodos(user.id),
  ]);

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <OverlordPanel />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Attention</h1>
          <p className="mt-1 text-sm text-zinc-500">Active and paused projects, local work, PRs, and deploys.</p>
        </div>
      </header>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {projects.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-sm text-zinc-500">
              No active projects yet.
            </div>
          )}
        </section>
        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Plus className="h-4 w-4 text-indigo-300" />
            New project
          </div>
          <ProjectForm />
          <div className="mt-2 text-sm font-semibold text-zinc-300">Global todos</div>
          <TodoForm />
          <TodoList todos={todos} />
        </aside>
      </div>
    </div>
  );
}
