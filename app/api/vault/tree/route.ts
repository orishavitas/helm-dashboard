import { NextResponse } from "next/server";

import { getObsidianClient } from "@/lib/vault/obsidian-rest";
import { readVaultTree } from "@/lib/vault/vault-fs";
import { parseLocalProfileEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  await requireUser();
  const env = parseLocalProfileEnv();
  const vaultPath = env.OBSIDIAN_VAULT_PATH;

  if (!vaultPath) {
    return NextResponse.json({ error: "OBSIDIAN_VAULT_PATH is not set" }, { status: 503 });
  }

  // Try REST API first; fall back to direct fs
  const client = getObsidianClient();
  if (client) {
    try {
      const available = await client.isAvailable();
      if (available) {
        const tree = await client.listVault("/");
        return NextResponse.json({ tree, source: "rest" });
      }
    } catch {
      // fall through to fs fallback
    }
  }

  try {
    const tree = await readVaultTree(vaultPath);
    return NextResponse.json({ tree, source: "fs" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to read vault";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
