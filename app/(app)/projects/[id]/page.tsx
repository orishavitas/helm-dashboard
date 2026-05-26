import { notFound } from "next/navigation";
import { ExternalLink, GitCommit, GitPullRequest } from "lucide-react";

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
          <GitHubActivity project={project} />
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

function GitHubActivity({ project }: { project: NonNullable<Awaited<ReturnType<typeof getProjectDetail>>> }) {
  const repo = project.githubRepoOwner && project.githubRepoName ? `${project.githubRepoOwner}/${project.githubRepoName}` : null;

  return (
    <section className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase text-zinc-600">GitHub activity</div>
          <h2 className="mt-1 text-base font-semibold text-zinc-100">{repo ?? "No repository linked"}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Snapshot {project.github.status} · fetched {formatRelativeTime(project.github.fetchedAt)}
          </p>
        </div>
        <Badge tone={project.github.status === "fresh" ? "green" : project.github.status === "error" ? "red" : "amber"}>
          {project.github.status}
        </Badge>
      </div>

      {project.github.error && (
        <p className="rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-200">{project.github.error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityList
          icon={<GitPullRequest className="h-4 w-4 text-indigo-300" />}
          title="Open pull requests"
          empty="No open pull requests in the cached snapshot."
          items={project.openPullRequests.map((pr) => ({
            key: `pr-${pr.number}`,
            title: `#${pr.number} ${pr.title}`,
            meta: `${pr.draft ? "draft · " : ""}updated ${formatRelativeTime(pr.updatedAt)}`,
            url: pr.url,
          }))}
        />
        <ActivityList
          icon={<GitCommit className="h-4 w-4 text-blue-300" />}
          title="Recent commits"
          empty="No recent commits in the cached snapshot."
          items={project.recentCommits.map((commit) => ({
            key: `commit-${commit.sha}`,
            title: commit.message,
            meta: `${commit.sha} · ${commit.author}${commit.committedAt ? ` · ${formatRelativeTime(commit.committedAt)}` : ""}`,
            url: commit.url,
          }))}
        />
      </div>
    </section>
  );
}

function ActivityList({
  empty,
  icon,
  items,
  title,
}: {
  empty: string;
  icon: React.ReactNode;
  items: Array<{ key: string; title: string; meta: string; url: string }>;
  title: string;
}) {
  return (
    <div className="grid content-start gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">{empty}</p>
      ) : (
        <div className="grid gap-2">
          {items.map((item) => (
            <a
              key={item.key}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="grid gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm transition hover:border-zinc-700"
            >
              <span className="flex min-w-0 items-center justify-between gap-3">
                <span className="truncate font-medium text-zinc-100">{item.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              </span>
              <span className="truncate text-xs text-zinc-500">{item.meta}</span>
            </a>
          ))}
        </div>
      )}
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
