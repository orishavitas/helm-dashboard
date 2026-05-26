import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/session";
import { getAgentSession, updateAgentSession } from "@/lib/data/agents";
import { abortSession } from "@/lib/agents/session-controllers";

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await requireUser();

  const session = await getAgentSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  abortSession(id);

  if (session.status === "running") {
    await updateAgentSession(id, { status: "stopped", completedAt: new Date() });
  }

  return NextResponse.json({ ok: true });
}
