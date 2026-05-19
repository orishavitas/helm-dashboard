import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { terminalSnapshots } from "@/lib/db/schema";
import { parseOverlordPushEnv } from "@/lib/env";

const pushSchema = z.object({
  terminalId: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  status: z.enum(["active", "idle", "blocked", "done", "offline"]),
  currentTask: z.string().max(256).nullish(),
  repo: z.string().max(128).nullish(),
  agentRole: z.string().max(64).nullish(),
  contextPct: z.number().int().min(0).max(100).nullish(),
  meta: z.record(z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  const env = parseOverlordPushEnv();
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${env.OVERLORD_PUSH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  await getDb().insert(terminalSnapshots).values({
    terminalId: data.terminalId,
    label: data.label,
    status: data.status,
    currentTask: data.currentTask ?? null,
    repo: data.repo ?? null,
    agentRole: data.agentRole ?? null,
    contextPct: data.contextPct ?? null,
    meta: data.meta,
  });

  return NextResponse.json({ ok: true });
}
