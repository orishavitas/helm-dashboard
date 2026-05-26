export const TERMINAL_OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;
const UNASSIGNED = "Unassigned";
const NO_REPO = "No repo";

export type TerminalStatus = "active" | "idle" | "blocked" | "done" | "offline";

export type TerminalSnapshotLike = {
  id: string;
  terminalId: string;
  label: string;
  status: TerminalStatus;
  currentTask: string | null;
  repo: string | null;
  agentRole: string | null;
  contextPct: number | null;
  meta: Record<string, unknown>;
  pushedAt: Date;
};

export type TerminalPresenceLike = {
  current: TerminalSnapshotLike;
  history: TerminalSnapshotLike[];
};

export type TerminalAssigneeGroup = {
  assignee: string;
  terminals: TerminalPresenceLike[];
};

export type TerminalRepoGroup = {
  repo: string;
  terminalCount: number;
  activeCount: number;
  offlineCount: number;
  assignees: TerminalAssigneeGroup[];
};

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function repoLabel(value: string | null | undefined) {
  const repo = clean(value);
  if (!repo) {
    return NO_REPO;
  }

  const normalized = repo.replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean).at(-1) ?? repo;
}

export function terminalAssignee(terminal: TerminalPresenceLike) {
  const assignee = terminal.current.meta.assignee;
  if (typeof assignee === "string" && assignee.trim()) {
    return assignee.trim();
  }

  return clean(terminal.current.agentRole) ?? UNASSIGNED;
}

export function deriveTerminalPresence<T extends TerminalPresenceLike>(
  terminals: T[],
  now = new Date(),
  thresholdMs = TERMINAL_OFFLINE_THRESHOLD_MS,
): T[] {
  return terminals.map((terminal) => {
    const ageMs = now.getTime() - terminal.current.pushedAt.getTime();
    if (ageMs <= thresholdMs || terminal.current.status === "offline") {
      return terminal;
    }

    return {
      ...terminal,
      current: {
        ...terminal.current,
        status: "offline",
        meta: {
          ...terminal.current.meta,
          reportedStatus: terminal.current.status,
        },
      },
    };
  });
}

export function groupTerminalPresence(terminals: TerminalPresenceLike[]): TerminalRepoGroup[] {
  const repoGroups = new Map<string, Map<string, TerminalPresenceLike[]>>();

  for (const terminal of terminals) {
    const repo = repoLabel(terminal.current.repo);
    const assignee = terminalAssignee(terminal);
    const assigneeGroups = repoGroups.get(repo) ?? new Map<string, TerminalPresenceLike[]>();
    const bucket = assigneeGroups.get(assignee) ?? [];

    bucket.push(terminal);
    assigneeGroups.set(assignee, bucket);
    repoGroups.set(repo, assigneeGroups);
  }

  return Array.from(repoGroups.entries())
    .map(([repo, assigneeGroups]) => {
      const assignees = Array.from(assigneeGroups.entries())
        .map(([assignee, groupedTerminals]) => ({
          assignee,
          terminals: groupedTerminals.sort((a, b) => b.current.pushedAt.getTime() - a.current.pushedAt.getTime()),
        }))
        .sort((a, b) => a.assignee.localeCompare(b.assignee));
      const allTerminals = assignees.flatMap((assignee) => assignee.terminals);

      return {
        repo,
        terminalCount: allTerminals.length,
        activeCount: allTerminals.filter((terminal) => terminal.current.status === "active").length,
        offlineCount: allTerminals.filter((terminal) => terminal.current.status === "offline").length,
        assignees,
      };
    })
    .sort((a, b) => a.repo.localeCompare(b.repo));
}
