import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getObsidianClient } from "@/lib/vault/obsidian-rest";
import { searchVaultNotes } from "@/lib/vault/vault-fs";
import { parseLocalProfileEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  await requireUser();
  const env = parseLocalProfileEnv();
  const vaultPath = env.OBSIDIAN_VAULT_PATH;

  if (!vaultPath) {
    return NextResponse.json({ error: "OBSIDIAN_VAULT_PATH is not set" }, { status: 503 });
  }

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { q, limit } = parsed.data;

  // Try REST API first
  const client = getObsidianClient();
  if (client) {
    try {
      const available = await client.isAvailable();
      if (available) {
        const results = await client.search(q, limit);
        return NextResponse.json({ results, source: "rest" });
      }
    } catch {
      // fall through to fs fallback
    }
  }

  try {
    const results = await searchVaultNotes(vaultPath, q, limit);
    return NextResponse.json({ results, source: "fs" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
