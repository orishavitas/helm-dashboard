import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { projects, sprints, tasks } from "@/lib/db/schema";
import { getOverlordState } from "@/lib/data/overlord";
import { getProjectSummaries } from "@/lib/data/projects";
import type {
  OperationsProjectState,
  OperationsState,
  OperationsTask,
  OverlordState,
  ResponsibilityBucket,
} from "@/lib/view-models";

const UNASSIGNED = "Unassigned";

function assigneeName(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : UNASSIGNED;
}

function terminalAssignee(terminal: OverlordState["terminals"][number]) {
  const metaAssignee = terminal.current.meta.assignee;
  return assigneeName(typeof metaAssignee === "string" ? metaAssignee : terminal.current.agentRole);
}

function terminalMatchesProject(terminal: OverlordState["terminals"][number], projectName: string) {
  const repo = terminal.current.repo?.trim().toLowerCase();
  const normalizedProjectName = projectName.trim().toLowerCase();
  if (!repo || !normalizedProjectName) {
    return false;
  }

  const repoName = repo.replace(/\\/g, "/").split("/").filter(Boolean).at(-1);
  return repo === normalizedProjectName || repoName === normalizedProjectName;
}

function getResponsibilityBucket(buckets: Map<string, ResponsibilityBucket>, assignee: string) {
  const existing = buckets.get(assignee);
  if (existing) {
    return existing;
  }

  const bucket: ResponsibilityBucket = {
    assignee,
    activeTerminals: 0,
    workingTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    finishedTasks: 0,
  };
  buckets.set(assignee, bucket);
  return bucket;
}

function toOperationsTask(row: {
  task: typeof tasks.$inferSelect;
  projectName: string;
  sprintName: string | null;
}): OperationsTask {
  return {
    id: row.task.id,
    title: row.task.title,
    notes: row.task.notes,
    status: row.task.status,
    priority: row.task.priority,
    assignee: row.task.assignee,
    agentRole: row.task.agentRole,
    source: row.task.source,
    sourceRef: row.task.sourceRef,
    sourceUrl: row.task.sourceUrl,
    blockedReason: row.task.blockedReason,
    finishedAt: row.task.finishedAt,
    projectId: row.task.projectId,
    projectName: row.projectName,
    sprintName: row.sprintName,
    updatedAt: row.task.updatedAt,
  };
}

function deriveProjectState({
  blockedTaskCount,
  pendingTaskCount,
  workingTaskCount,
}: {
  blockedTaskCount: number;
  pendingTaskCount: number;
  workingTaskCount: number;
}): OperationsProjectState["derivedState"] {
  if (blockedTaskCount > 0) {
    return "blocked";
  }
  if (workingTaskCount > 0) {
    return "working";
  }
  if (pendingTaskCount > 0) {
    return "pending";
  }
  return "idle";
}

export async function getOperationsState(userId: string): Promise<OperationsState> {
  const [projectSummaries, overlordState] = await Promise.all([getProjectSummaries(userId), getOverlordState()]);
  const projectIds = projectSummaries.map((project) => project.id);

  const taskRows =
    projectIds.length === 0
      ? []
      : await getDb()
          .select({
            task: tasks,
            projectName: projects.name,
            sprintName: sprints.name,
          })
          .from(tasks)
          .innerJoin(projects, eq(tasks.projectId, projects.id))
          .leftJoin(sprints, and(eq(tasks.sprintId, sprints.id), eq(sprints.projectId, tasks.projectId)))
          .where(and(inArray(tasks.projectId, projectIds), isNull(tasks.deletedAt)))
          .orderBy(desc(tasks.updatedAt));

  const operationsTasks = taskRows.map(toOperationsTask);
  const activeTerminals = overlordState.terminals.filter((terminal) => terminal.current.status === "active");

  const taskCountsByProject = new Map<
    string,
    {
      blockedTaskCount: number;
      pendingTaskCount: number;
      workingTaskCount: number;
      finishedTaskCount: number;
    }
  >();
  const responsibilityBuckets = new Map<string, ResponsibilityBucket>();

  for (const terminal of activeTerminals) {
    getResponsibilityBucket(responsibilityBuckets, terminalAssignee(terminal)).activeTerminals += 1;
  }

  for (const task of operationsTasks) {
    const counts = taskCountsByProject.get(task.projectId) ?? {
      blockedTaskCount: 0,
      pendingTaskCount: 0,
      workingTaskCount: 0,
      finishedTaskCount: 0,
    };
    const bucket = getResponsibilityBucket(responsibilityBuckets, assigneeName(task.assignee));

    if (task.status === "blocked") {
      counts.blockedTaskCount += 1;
      bucket.blockedTasks += 1;
    } else if (task.status === "in-progress") {
      counts.workingTaskCount += 1;
      bucket.workingTasks += 1;
    } else if (task.status === "todo") {
      counts.pendingTaskCount += 1;
      bucket.pendingTasks += 1;
    } else {
      counts.finishedTaskCount += 1;
      bucket.finishedTasks += 1;
    }

    taskCountsByProject.set(task.projectId, counts);
  }

  const projectsWithState = projectSummaries.map((project): OperationsProjectState => {
    const counts = taskCountsByProject.get(project.id) ?? {
      blockedTaskCount: 0,
      pendingTaskCount: 0,
      workingTaskCount: 0,
      finishedTaskCount: 0,
    };

    return {
      ...project,
      derivedState: deriveProjectState(counts),
      activeTerminalCount: activeTerminals.filter((terminal) => terminalMatchesProject(terminal, project.name)).length,
      ...counts,
    };
  });
  const finishedTasks = operationsTasks
    .filter((task) => task.status === "done")
    .sort((a, b) => (b.finishedAt ?? b.updatedAt).getTime() - (a.finishedAt ?? a.updatedAt).getTime())
    .slice(0, 20);

  return {
    fetchedAt: new Date(),
    projects: projectsWithState,
    terminals: overlordState.terminals,
    tasks: {
      working: operationsTasks.filter((task) => task.status === "in-progress"),
      pending: operationsTasks.filter((task) => task.status === "todo"),
      blocked: operationsTasks.filter((task) => task.status === "blocked"),
      finished: finishedTasks,
    },
    responsibility: Array.from(responsibilityBuckets.values()).sort((a, b) => a.assignee.localeCompare(b.assignee)),
  };
}
