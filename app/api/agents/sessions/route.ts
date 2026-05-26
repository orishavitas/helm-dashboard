import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/session";
import { createAgentSession, listAgentSessions } from "@/lib/data/agents";
import { parseLocalProfileEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  await requireUser();
  const sessions = await listAgentSessions(50);
  return NextResponse.json(sessions);
}

const createSchema = z.object({
  prompt: z.string().min(1).max(10_000),
  model: z.string().min(1).optional(),
  projectId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const env = parseLocalProfileEnv();
  if (!env.isLocal) {
    return NextResponse.json({ error: "Agent runner requires local profile" }, { status: 403 });
  }
  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set" }, { status: 503 });
  }

  await requireUser();

  const body: unknown = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const session = await createAgentSession(
    parsed.data.prompt,
    parsed.data.model,
    parsed.data.projectId,
  );

  return NextResponse.json(session, { status: 201 });
}
