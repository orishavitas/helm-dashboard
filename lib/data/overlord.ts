import { desc, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { terminalSnapshots } from "@/lib/db/schema";
import type { OverlordState, TerminalSnapshot } from "@/lib/view-models";

const HISTORY_DEPTH = 5;

function toSnapshot(row: typeof terminalSnapshots.$inferSelect): TerminalSnapshot {
  return {
    id: row.id,
    terminalId: row.terminalId,
    label: row.label,
    status: row.status,
    currentTask: row.currentTask,
    repo: row.repo,
    agentRole: row.agentRole,
    contextPct: row.contextPct,
    meta: row.meta,
    pushedAt: row.pushedAt,
  };
}

export async function getOverlordState(): Promise<OverlordState> {
  const db = getDb();
  const latestIds = db
    .select({
      id: sql<string>`DISTINCT ON (${terminalSnapshots.terminalId}) ${terminalSnapshots.id}`,
    })
    .from(terminalSnapshots)
    .orderBy(terminalSnapshots.terminalId, desc(terminalSnapshots.pushedAt));

  const current = await db
    .select()
    .from(terminalSnapshots)
    .where(inArray(terminalSnapshots.id, latestIds))
    .orderBy(desc(terminalSnapshots.pushedAt));

  const terminals = await Promise.all(
    current.map(async (row) => {
      const history = await db
        .select()
        .from(terminalSnapshots)
        .where(eq(terminalSnapshots.terminalId, row.terminalId))
        .orderBy(desc(terminalSnapshots.pushedAt))
        .offset(1)
        .limit(HISTORY_DEPTH);

      return {
        current: toSnapshot(row),
        history: history.map(toSnapshot),
      };
    }),
  );

  return { terminals, fetchedAt: new Date() };
}
