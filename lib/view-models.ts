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
  openPrCount: number | null;
  github: ProviderState;
  vercel: ProviderState & {
    deploymentUrl: string | null;
    environment: string | null;
    deploymentStatus: string | null;
  };
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
