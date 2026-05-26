import { and, asc, desc, eq, isNull, ne } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  githubRepoSnapshots,
  projects,
  sprints,
  tasks,
  todos,
  vercelDeploymentSnapshots,
} from "@/lib/db/schema";
import { computeProductProgress } from "@/lib/product-progress";
import {
  coerceGithubCommits,
  coerceGithubPullRequests,
  deriveGithubSnapshotState,
} from "@/lib/github-snapshot";
import type { ProjectDetail, ProjectSummary, TaskItem, TodoItem } from "@/lib/view-models";

type ProjectRow = typeof projects.$inferSelect;

function deploymentField(deployment: Record<string, unknown> | null | undefined, key: string) {
  const value = deployment?.[key];
  return typeof value === "string" ? value : null;
}

async function toSummary(project: ProjectRow): Promise<ProjectSummary> {
  const db = getDb();
  const [openSprint] = await db
    .select()
    .from(sprints)
    .where(and(eq(sprints.projectId, project.id), isNull(sprints.closedAt)))
    .limit(1);
  const sprintTasks = openSprint
    ? await db.select().from(tasks).where(and(eq(tasks.sprintId, openSprint.id), isNull(tasks.deletedAt)))
    : [];
  const [github] = await db.select().from(githubRepoSnapshots).where(eq(githubRepoSnapshots.projectId, project.id)).limit(1);
  const [vercel] = await db.select().from(vercelDeploymentSnapshots).where(eq(vercelDeploymentSnapshots.projectId, project.id)).limit(1);
  const sprintDone = sprintTasks.filter((task) => task.status === "done").length;
  const sprintInProgress = sprintTasks.filter((task) => task.status === "in-progress").length;
  const sprintBlocked = sprintTasks.filter((task) => task.status === "blocked").length;
  const sprintTodo = sprintTasks.filter((task) => task.status === "todo").length;
  const recentCommits = coerceGithubCommits(github?.recentCommits);
  const githubState = deriveGithubSnapshotState({
    status: github?.status ?? "missing",
    fetchedAt: github?.fetchedAt ?? null,
    error: github?.error ?? null,
  });
  const vercelState = {
    status: vercel?.status ?? "missing",
    fetchedAt: vercel?.fetchedAt ?? null,
    error: vercel?.error ?? null,
    deploymentUrl: deploymentField(vercel?.deployment, "url"),
    environment: deploymentField(vercel?.deployment, "environment"),
    deploymentStatus: deploymentField(vercel?.deployment, "status"),
  };

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    sprintName: openSprint?.name ?? null,
    sprintDone,
    sprintTotal: sprintTasks.length,
    sprintInProgress,
    sprintBlocked,
    sprintTodo,
    openPrCount: github?.openPrCount ?? null,
    recentCommitCount: recentCommits.length,
    latestCommitAt: recentCommits[0]?.committedAt ?? null,
    github: githubState,
    vercel: vercelState,
    productProgress: computeProductProgress({
      projectStatus: project.status,
      sprintDone,
      sprintTotal: sprintTasks.length,
      sprintInProgress,
      sprintBlocked,
      sprintTodo,
      github: githubState,
      vercel: vercelState,
    }),
  };
}

export async function getProjectSummaries(userId: string, includeArchived = false) {
  const rows = await getDb()
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.ownerId, userId),
        isNull(projects.deletedAt),
        includeArchived ? undefined : ne(projects.status, "archived"),
      ),
    )
    .orderBy(asc(projects.status), desc(projects.updatedAt));

  return Promise.all(rows.map(toSummary));
}

export async function getProjectDetail(projectId: string, userId: string): Promise<ProjectDetail | null> {
  const [project] = await getDb()
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId), isNull(projects.deletedAt)))
    .limit(1);
  if (!project) {
    return null;
  }

  const summary = await toSummary(project);
  const [openSprint] = await getDb()
    .select()
    .from(sprints)
    .where(and(eq(sprints.projectId, project.id), isNull(sprints.closedAt)))
    .limit(1);
  const taskRows = await getDb()
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, project.id), isNull(tasks.deletedAt)))
    .orderBy(desc(tasks.updatedAt));
  const todoRows = await getDb()
    .select()
    .from(todos)
    .where(and(eq(todos.ownerId, userId), eq(todos.projectId, project.id)))
    .orderBy(asc(todos.sortOrder), asc(todos.createdAt));

  const mapTask = (task: (typeof taskRows)[number]): TaskItem => ({
    id: task.id,
    title: task.title,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    agentRole: task.agentRole,
    source: task.source,
    sourceRef: task.sourceRef,
    sourceUrl: task.sourceUrl,
    blockedReason: task.blockedReason,
    finishedAt: task.finishedAt,
  });

  return {
    ...summary,
    githubRepoOwner: project.githubRepoOwner,
    githubRepoName: project.githubRepoName,
    vercelProjectId: project.vercelProjectId,
    vercelProjectName: project.vercelProjectName,
    openSprintId: openSprint?.id ?? null,
    openPullRequests: coerceGithubPullRequests(
      (await getDb()
        .select({ openPrs: githubRepoSnapshots.openPrs })
        .from(githubRepoSnapshots)
        .where(eq(githubRepoSnapshots.projectId, project.id))
        .limit(1))[0]?.openPrs,
    ),
    recentCommits: coerceGithubCommits(
      (await getDb()
        .select({ recentCommits: githubRepoSnapshots.recentCommits })
        .from(githubRepoSnapshots)
        .where(eq(githubRepoSnapshots.projectId, project.id))
        .limit(1))[0]?.recentCommits,
    ),
    backlogTasks: taskRows.filter((task) => !task.sprintId).map(mapTask),
    sprintTasks: taskRows.filter((task) => task.sprintId === openSprint?.id).map(mapTask),
    todos: todoRows.map((todo): TodoItem => ({ id: todo.id, title: todo.title, done: todo.done })),
  };
}
