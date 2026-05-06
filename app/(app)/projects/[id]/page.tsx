import { notFound } from "next/navigation";

import { ProjectIntegrationForms } from "@/components/forms/integration-forms";
import { ProjectForm } from "@/components/forms/project-form";
import { SprintForm } from "@/components/forms/sprint-form";
import { TaskForm } from "@/components/forms/task-form";
import { TodoForm } from "@/components/forms/todo-form";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task-list";
import { TodoList } from "@/components/todo-list";
import { getProjectDetail } from "@/lib/data/projects";
import { formatRelativeTime } from "@/lib/utils";
import { requireUser } from "@/lib/session";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  const project = await getProjectDetail(id, user.id);
  if (!project) {
    notFound();
  }

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <header className="grid gap-3 border-b border-zinc-800 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-50">{project.name}</h1>
          <Badge tone={project.status === "active" ? "green" : "amber"}>{project.status}</Badge>
        </div>
        <p className="max-w-3xl text-sm text-zinc-500">{project.description ?? "No description"}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Sprint" value={project.sprintName ?? "No open sprint"} meta={`${project.sprintDone}/${project.sprintTotal} done`} />
        <Metric label="GitHub" value={project.openPrCount === null ? "Not linked" : `${project.openPrCount} PRs`} meta={formatRelativeTime(project.github.fetchedAt)} />
        <Metric label="Vercel" value={project.vercel.deploymentStatus ?? project.vercel.status} meta={formatRelativeTime(project.vercel.fetchedAt)} />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <TaskList title="Open sprint" projectId={project.id} tasks={project.sprintTasks} />
          <TaskList title="Backlog" projectId={project.id} tasks={project.backlogTasks} />
          <ProjectIntegrationForms projectId={project.id} />
        </section>
        <aside className="grid content-start gap-4">
          <ProjectForm project={project} />
          {project.openSprintId ? (
            <TaskForm projectId={project.id} sprintId={project.openSprintId} />
          ) : (
            <SprintForm projectId={project.id} />
          )}
          <TaskForm projectId={project.id} sprintId={null} />
          <TodoForm projectId={project.id} />
          <TodoList todos={project.todos} />
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-xs uppercase text-zinc-500">{label}</div>
      <div className="mt-2 truncate text-lg font-semibold text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{meta}</div>
    </div>
  );
}
