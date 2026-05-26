import "server-only";

import { eq, asc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { agentSessions, agentEvents } from "@/lib/db/schema";

export type AgentSessionRow = typeof agentSessions.$inferSelect;
export type AgentEventRow = typeof agentEvents.$inferSelect;

export async function createAgentSession(
  prompt: string,
  model = "claude-sonnet-4-6",
  projectId?: string,
): Promise<AgentSessionRow> {
  const db = getDb();
  const [row] = await db
    .insert(agentSessions)
    .values({ prompt, model, projectId: projectId ?? null, status: "pending" })
    .returning();
  if (!row) {
    throw new Error("Failed to create agent session");
  }
  return row;
}

export async function getAgentSession(id: string): Promise<AgentSessionRow | null> {
  const db = getDb();
  const row = await db.query.agentSessions.findFirst({
    where: eq(agentSessions.id, id),
  });
  return row ?? null;
}

export async function listAgentSessions(limit = 20): Promise<AgentSessionRow[]> {
  const db = getDb();
  return db.query.agentSessions.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

export async function updateAgentSession(
  id: string,
  patch: Partial<Pick<AgentSessionRow, "status" | "error" | "startedAt" | "completedAt">>,
): Promise<void> {
  const db = getDb();
  await db.update(agentSessions).set(patch).where(eq(agentSessions.id, id));
}

export async function appendAgentEvent(
  sessionId: string,
  type: AgentEventRow["type"],
  text: string | null,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const db = getDb();
  await db.insert(agentEvents).values({ sessionId, type, text, payload });
}

export async function getAgentEvents(sessionId: string): Promise<AgentEventRow[]> {
  const db = getDb();
  return db.query.agentEvents.findMany({
    where: eq(agentEvents.sessionId, sessionId),
    orderBy: [asc(agentEvents.createdAt)],
  });
}
