import type { ProductProgress } from "@/lib/product-progress";

export type ProviderState = {
  status: "fresh" | "stale" | "error" | "missing";
  fetchedAt: Date | null;
  error: string | null;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "paused" | "archived";
  sprintName: string | null;
  sprintDone: number;
  sprintTotal: number;
  sprintInProgress: number;
  sprintBlocked: number;
  sprintTodo: number;
  openPrCount: number | null;
  github: ProviderState;
  vercel: ProviderState & {
    deploymentUrl: string | null;
    environment: string | null;
    deploymentStatus: string | null;
  };
  productProgress: ProductProgress;
};

export type ProjectDetail = ProjectSummary & {
  githubRepoOwner: string | null;
  githubRepoName: string | null;
  vercelProjectId: string | null;
  vercelProjectName: string | null;
  openSprintId: string | null;
  backlogTasks: TaskItem[];
  sprintTasks: TaskItem[];
  todos: TodoItem[];
};

export type TaskItem = {
  id: string;
  title: string;
  notes: string | null;
  status: "todo" | "in-progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string | null;
  agentRole: string | null;
  source: string;
  sourceRef: string | null;
  sourceUrl: string | null;
  blockedReason: string | null;
  finishedAt: Date | null;
};

export type TodoItem = {
  id: string;
  title: string;
  done: boolean;
};

export type TerminalSnapshot = {
  id: string;
  terminalId: string;
  label: string;
  status: "active" | "idle" | "blocked" | "done" | "offline";
  currentTask: string | null;
  repo: string | null;
  agentRole: string | null;
  contextPct: number | null;
  meta: Record<string, unknown>;
  pushedAt: Date;
};

export type OverlordState = {
  terminals: Array<{
    current: TerminalSnapshot;
    history: TerminalSnapshot[];
  }>;
  fetchedAt: Date;
};

export type OperationsTask = TaskItem & {
  projectId: string;
  projectName: string;
  sprintName: string | null;
  updatedAt: Date;
};

export type ResponsibilityBucket = {
  assignee: string;
  activeTerminals: number;
  workingTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  finishedTasks: number;
};

export type OperationsProjectState = ProjectSummary & {
  derivedState: "blocked" | "working" | "pending" | "idle";
  activeTerminalCount: number;
  blockedTaskCount: number;
  pendingTaskCount: number;
  workingTaskCount: number;
  finishedTaskCount: number;
};

export type OperationsState = {
  fetchedAt: Date;
  projects: OperationsProjectState[];
  terminals: OverlordState["terminals"];
  tasks: {
    working: OperationsTask[];
    pending: OperationsTask[];
    blocked: OperationsTask[];
    finished: OperationsTask[];
  };
  responsibility: ResponsibilityBucket[];
};
