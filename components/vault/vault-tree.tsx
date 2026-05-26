"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";

import type { VaultFileEntry } from "@/lib/vault/obsidian-rest";

interface VaultTreeProps {
  entries: VaultFileEntry[];
  selectedPath?: string | null;
  onSelect: (path: string) => void;
}

export function VaultTree({ entries, selectedPath, onSelect }: VaultTreeProps) {
  return (
    <div className="overflow-y-auto">
      {entries.map((entry) => (
        <TreeEntry
          key={entry.path}
          entry={entry}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface TreeEntryProps {
  entry: VaultFileEntry;
  depth: number;
  selectedPath?: string | null;
  onSelect: (path: string) => void;
}

function TreeEntry({ entry, depth, selectedPath, onSelect }: TreeEntryProps) {
  const [open, setOpen] = useState(depth === 0);
  const indent = depth * 12;

  if (entry.type === "directory") {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
          <span className="truncate">{entry.name}</span>
        </button>
        {open && entry.children && (
          <div>
            {entry.children.map((child) => (
              <TreeEntry
                key={child.path}
                entry={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === entry.path;

  return (
    <button
      type="button"
      className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm ${
        isSelected
          ? "bg-indigo-900/40 text-indigo-200"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
      style={{ paddingLeft: `${8 + indent + 14}px` }}
      onClick={() => onSelect(entry.path)}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      <span className="truncate">{entry.name.replace(/\.md$/, "")}</span>
    </button>
  );
}
