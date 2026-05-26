import assert from "node:assert/strict";
import { test } from "node:test";

import {
  deriveTerminalPresence,
  groupTerminalPresence,
  terminalAssignee,
} from "../lib/terminal-presence.js";
import type { TerminalPresenceLike } from "../lib/terminal-presence.js";

function terminal(
  partial: Partial<TerminalPresenceLike["current"]> & { terminalId: string; pushedAt: Date },
): TerminalPresenceLike {
  return {
    current: {
      id: `${partial.terminalId}-current`,
      terminalId: partial.terminalId,
      label: partial.label ?? partial.terminalId,
      status: partial.status ?? "active",
      currentTask: partial.currentTask ?? null,
      repo: partial.repo ?? null,
      agentRole: partial.agentRole ?? null,
      contextPct: partial.contextPct ?? null,
      meta: partial.meta ?? {},
      pushedAt: partial.pushedAt,
    },
    history: [],
  };
}

test("derives offline when a terminal heartbeat is older than ten minutes", () => {
  const now = new Date("2026-05-20T12:00:00.000Z");
  const stale = terminal({
    terminalId: "codex-1",
    status: "active",
    pushedAt: new Date("2026-05-20T11:49:59.000Z"),
  });

  const [presence] = deriveTerminalPresence([stale], now);

  assert.equal(presence.current.status, "offline");
  assert.equal(presence.current.meta.reportedStatus, "active");
});

test("groups terminal presence by repo and assignee", () => {
  const now = new Date("2026-05-20T12:00:00.000Z");
  const terminals = deriveTerminalPresence(
    [
      terminal({
        terminalId: "codex-1",
        repo: "C:/Users/OriShavit/Documents/GitHub/Helm-Dashboard",
        meta: { assignee: "Ori" },
        pushedAt: new Date("2026-05-20T11:59:30.000Z"),
      }),
      terminal({
        terminalId: "claude-1",
        repo: "Helm-Dashboard",
        agentRole: "reviewer",
        pushedAt: new Date("2026-05-20T11:57:30.000Z"),
      }),
    ],
    now,
  );

  const groups = groupTerminalPresence(terminals);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].repo, "Helm-Dashboard");
  assert.deepEqual(groups[0].assignees.map((assignee) => assignee.assignee), ["Ori", "reviewer"]);
});

test("uses metadata assignee before role and falls back to Unassigned", () => {
  assert.equal(
    terminalAssignee(
      terminal({
        terminalId: "codex-1",
        meta: { assignee: "Ori" },
        agentRole: "builder",
        pushedAt: new Date("2026-05-20T11:59:30.000Z"),
      }),
    ),
    "Ori",
  );
  assert.equal(
    terminalAssignee(
      terminal({
        terminalId: "codex-2",
        meta: {},
        agentRole: null,
        pushedAt: new Date("2026-05-20T11:59:30.000Z"),
      }),
    ),
    "Unassigned",
  );
});
