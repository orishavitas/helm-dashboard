/**
 * Direct filesystem reader for Obsidian vault.
 * Used when obsidian-local-rest-api is not running.
 * Server-only — must not be imported in client components.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname, resolve, isAbsolute } from "node:path";

import type { VaultFileEntry } from "./obsidian-rest";

export async function readVaultTree(vaultPath: string, maxDepth = 4): Promise<VaultFileEntry[]> {
  async function walk(dir: string, depth: number): Promise<VaultFileEntry[]> {
    if (depth <= 0) {
      return [];
    }
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return [];
    }

    const result: VaultFileEntry[] = [];
    for (const name of entries.sort()) {
      // Skip hidden dirs (. prefix) and Obsidian internals
      if (name.startsWith(".") || name === "node_modules") {
        continue;
      }
      const fullPath = join(dir, name);
      let info;
      try {
        info = await stat(fullPath);
      } catch {
        continue;
      }

      const relativePath = relative(vaultPath, fullPath).replace(/\\/g, "/");

      if (info.isDirectory()) {
        const children = await walk(fullPath, depth - 1);
        result.push({ path: relativePath, name, type: "directory", children });
      } else if (extname(name) === ".md") {
        result.push({
          path: relativePath,
          name,
          type: "file",
          size: info.size,
          modified: info.mtime.toISOString(),
        });
      }
    }
    return result;
  }

  return walk(vaultPath, maxDepth);
}

export async function readVaultNote(vaultPath: string, notePath: string): Promise<string> {
  const fullPath = join(vaultPath, notePath);
  // Security: prevent path traversal using relative() instead of startsWith()
  // to avoid prefix confusion (e.g. /vault vs /vault-evil)
  const resolvedNote = resolve(fullPath);
  const vaultResolved = resolve(vaultPath);
  const rel = relative(vaultResolved, resolvedNote);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error("Path traversal detected");
  }
  return readFile(resolvedNote, "utf-8");
}

export async function searchVaultNotes(
  vaultPath: string,
  query: string,
  limit = 20,
): Promise<Array<{ path: string; score: number; matches: string[] }>> {
  const lq = query.toLowerCase();
  const results: Array<{ path: string; score: number; matches: string[] }> = [];

  async function scan(dir: string) {
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return;
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
        await scan(full);
      } else if (extname(name) === ".md") {
        const content = await readFile(full, "utf-8").catch(() => "");
        if (content.toLowerCase().includes(lq)) {
          const relativePath = relative(vaultPath, full).replace(/\\/g, "/");
          // Extract matching context lines
          const lines = content.split("\n");
          const matches = lines
            .filter((l) => l.toLowerCase().includes(lq))
            .slice(0, 3)
            .map((l) => l.trim());
          results.push({ path: relativePath, score: matches.length, matches });
          if (results.length >= limit) {
            return;
          }
        }
      }
    }
  }

  await scan(vaultPath);
  return results.sort((a, b) => b.score - a.score);
}
