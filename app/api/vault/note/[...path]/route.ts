import { NextRequest, NextResponse } from "next/server";

import { getObsidianClient } from "@/lib/vault/obsidian-rest";
import { readVaultNote } from "@/lib/vault/vault-fs";
import { parseLocalProfileEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  await requireUser();
  const { path: segments } = await params;
  const notePath = segments.join("/");

  // Input validation: reject suspicious paths before any fs/REST access
  if (notePath.includes("..") || notePath.startsWith("/") || notePath.includes("\0")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const env = parseLocalProfileEnv();
  const vaultPath = env.OBSIDIAN_VAULT_PATH;

  if (!vaultPath) {
    return NextResponse.json({ error: "OBSIDIAN_VAULT_PATH is not set" }, { status: 503 });
  }

  // Try REST API first
  const client = getObsidianClient();
  if (client) {
    try {
      const content = await client.readNote(notePath);
      return NextResponse.json({ path: notePath, content, source: "rest" });
    } catch {
      // fall through to fs fallback
    }
  }

  try {
    const content = await readVaultNote(vaultPath, notePath);
    return NextResponse.json({ path: notePath, content, source: "fs" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to read note";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
