"use client";

import { BookOpen, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition, Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { VaultTree } from "@/components/vault/vault-tree";
import { NoteViewer } from "@/components/vault/note-viewer";
import type { VaultFileEntry } from "@/lib/vault/obsidian-rest";

interface TreeResponse {
  tree: VaultFileEntry[];
  source: "rest" | "fs";
}

interface NoteResponse {
  path: string;
  content: string;
  source: "rest" | "fs";
}

interface SearchResult {
  path: string;
  score: number;
  matches: string[];
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-zinc-500">Loading vault…</div>}>
      <VaultPageInner />
    </Suspense>
  );
}

function VaultPageInner() {
  const searchParams = useSearchParams();
  const noteParam = searchParams.get("note");

  const [tree, setTree] = useState<VaultFileEntry[]>([]);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(noteParam);
  const [noteContent, setNoteContent] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [, startTransition] = useTransition();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load tree
  useEffect(() => {
    void fetch("/api/vault/tree")
      .then((r) => r.json() as Promise<TreeResponse & { error?: string }>)
      .then((data) => {
        if (data.error) {
          setTreeError(data.error);
        } else {
          setTree(data.tree ?? []);
        }
      })
      .catch((err: unknown) => {
        setTreeError(err instanceof Error ? err.message : "Failed to load vault");
      });
  }, []);

  // Load note on selection
  useEffect(() => {
    if (!selectedPath) {
      setNoteContent(null);
      return;
    }
    setNoteError(null);
    void fetch(`/api/vault/note/${selectedPath.split("/").map(encodeURIComponent).join("/")}`)
      .then((r) => r.json() as Promise<NoteResponse & { error?: string }>)
      .then((data) => {
        if (data.error) {
          setNoteError(data.error);
        } else {
          setNoteContent(data.content);
        }
      })
      .catch(() => {
        setNoteError("Failed to load note");
      });
  }, [selectedPath]);

  // Search (debounced 250 ms)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        void fetch(`/api/vault/search?q=${encodeURIComponent(query)}`)
          .then((r) => r.json() as Promise<{ results: SearchResult[] }>)
          .then((data) => setSearchResults(data.results ?? []))
          .catch(() => setSearchResults([]));
      });
    }, 250);
  }, []);

  // Wikilink navigation: find note by stem
  const handleWikilink = useCallback(
    (noteName: string) => {
      function findByName(entries: VaultFileEntry[], name: string): string | null {
        for (const e of entries) {
          if (e.type === "file" && e.name.replace(/\.md$/, "").toLowerCase() === name.toLowerCase()) {
            return e.path;
          }
          if (e.children) {
            const found = findByName(e.children, name);
            if (found) return found;
          }
        }
        return null;
      }
      const path = findByName(tree, noteName);
      if (path) setSelectedPath(path);
    },
    [tree],
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          Vault Browser
        </div>
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search vault…"
            className="w-full rounded border border-zinc-700 bg-zinc-900 py-1.5 pl-8 pr-8 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => handleSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body: tree | viewer */}
      <div className="flex min-h-0 flex-1">
        {/* Left: tree / search results */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-zinc-800 bg-zinc-950 py-2">
          {treeError && (
            <p className="px-4 py-2 text-xs text-red-400">{treeError}</p>
          )}
          {searchResults !== null ? (
            <div>
              <p className="px-4 pb-2 text-xs text-zinc-500">{searchResults.length} results</p>
              {searchResults.map((r) => (
                <button
                  key={r.path}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-800/50 ${
                    selectedPath === r.path ? "text-indigo-300" : "text-zinc-300"
                  }`}
                  onClick={() => setSelectedPath(r.path)}
                >
                  <p className="truncate font-medium">
                    {r.path.split("/").pop()?.replace(/\.md$/, "")}
                  </p>
                  {r.matches[0] && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{r.matches[0]}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <VaultTree entries={tree} selectedPath={selectedPath} onSelect={setSelectedPath} />
          )}
        </aside>

        {/* Right: note viewer */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {!selectedPath && (
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">
              Select a note to read it
            </div>
          )}
          {noteError && (
            <p className="px-6 py-4 text-sm text-red-400">{noteError}</p>
          )}
          {noteContent !== null && !noteError && (
            <NoteViewer content={noteContent} onWikilink={handleWikilink} />
          )}
        </main>
      </div>
    </div>
  );
}
