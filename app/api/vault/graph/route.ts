import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname, relative, resolve } from "node:path";

import { buildGraph, type NoteFile } from "@/lib/vault/graph-builder";
import { parseLocalProfileEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function collectNotes(vaultPath: string, dir: string): Promise<NoteFile[]> {
  const results: NoteFile[] = [];
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return results;
  }
  for (const name of entries) {
    if (name.startsWith(".") || name === "node_modules") {
      continue;
    }
    const full = join(dir, name);
    let info;
    try {
      info = await stat(full);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      results.push(...(await collectNotes(vaultPath, full)));
    } else if (extname(name) === ".md") {
      const content = await readFile(full, "utf-8").catch(() => "");
      const notePath = relative(vaultPath, full).replace(/\\/g, "/");
      results.push({ path: notePath, content });
    }
  }
  return results;
}

export async function GET() {
  await requireUser();
  const env = parseLocalProfileEnv();
  const vaultPath = env.OBSIDIAN_VAULT_PATH;

  if (!vaultPath) {
    return NextResponse.json({ error: "OBSIDIAN_VAULT_PATH is not set" }, { status: 503 });
  }

  // Security: resolve to absolute path
  const resolvedVault = resolve(vaultPath);

  try {
    const notes = await collectNotes(resolvedVault, resolvedVault);
    const graph = buildGraph(notes);
    return NextResponse.json(graph);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to build graph";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
