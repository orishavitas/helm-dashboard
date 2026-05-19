"use client";

import { useQuery } from "@tanstack/react-query";
import { Monitor, RefreshCw } from "lucide-react";

import { OverlordTerminalCard } from "@/components/overlord-terminal-card";
import { formatRelativeTime } from "@/lib/utils";
import type { OverlordState } from "@/lib/view-models";

const POLL_INTERVAL_MS = 2 * 60 * 1000;

type SerializedSnapshot = Omit<OverlordState["terminals"][number]["current"], "pushedAt"> & {
  pushedAt: string;
};

type SerializedState = {
  terminals: Array<{
    current: SerializedSnapshot;
    history: SerializedSnapshot[];
  }>;
  fetchedAt: string;
};

function deserializeState(data: SerializedState): OverlordState {
  return {
    fetchedAt: new Date(data.fetchedAt),
    terminals: data.terminals.map((terminal) => ({
      current: { ...terminal.current, pushedAt: new Date(terminal.current.pushedAt) },
      history: terminal.history.map((snapshot) => ({
        ...snapshot,
        pushedAt: new Date(snapshot.pushedAt),
      })),
    })),
  };
}

async function fetchOverlordState(): Promise<OverlordState> {
  const response = await fetch("/api/overlord/state", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Overlord state request failed with ${response.status}`);
  }

  return deserializeState((await response.json()) as SerializedState);
}

export function OverlordPanel({ showHeader = true }: { showHeader?: boolean }) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["overlord-state"],
    queryFn: fetchOverlordState,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });

  return (
    <section className="grid gap-4">
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Monitor className="h-4 w-4 text-indigo-300" />
            Overlord Monitor
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <RefreshCw className="h-3.5 w-3.5" />
            2 min polling
            {data && <span>Last {formatRelativeTime(data.fetchedAt)}</span>}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          Loading terminal state...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-6 text-sm text-red-200">
          Failed to load terminal state.
        </div>
      )}

      {data && data.terminals.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          No terminals are reporting yet.
        </div>
      )}

      {data && data.terminals.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {data.terminals.map(({ current, history }) => (
            <OverlordTerminalCard key={current.terminalId} current={current} history={history} />
          ))}
        </div>
      )}
    </section>
  );
}
