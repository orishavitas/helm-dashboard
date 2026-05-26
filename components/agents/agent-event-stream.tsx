"use client";

import { useEffect, useRef, useState } from "react";

import type { AgentRunnerEvent } from "@/lib/agents/claude-runner";

export type StreamState = "idle" | "connecting" | "running" | "done" | "error" | "stopped";

interface AgentEventStreamProps {
  sessionId: string | null;
  onStateChange?: (state: StreamState) => void;
}

interface DisplayEvent {
  id: number;
  event: AgentRunnerEvent;
}

export function AgentEventStream({ sessionId, onStateChange }: AgentEventStreamProps) {
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [state, setState] = useState<StreamState>("idle");
  const counterRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    setState("connecting");
    onStateChange?.("connecting");
    setEvents([]);

    const source = new EventSource(`/api/agents/stream/${sessionId}`);

    source.addEventListener("text", (e) => {
      setState("running");
      onStateChange?.("running");
      const data = JSON.parse(e.data) as AgentRunnerEvent;
      setEvents((prev) => [...prev, { id: counterRef.current++, event: data }]);
    });

    source.addEventListener("tool_use", (e) => {
      const data = JSON.parse(e.data) as AgentRunnerEvent;
      setEvents((prev) => [...prev, { id: counterRef.current++, event: data }]);
    });

    source.addEventListener("done", () => {
      setState("done");
      onStateChange?.("done");
      source.close();
    });

    source.addEventListener("error", (e) => {
      const raw = (e as MessageEvent).data as string | undefined;
      let data: AgentRunnerEvent = { type: "error", message: "Stream error" };
      if (raw) {
        try {
          data = JSON.parse(raw) as AgentRunnerEvent;
        } catch {
          // ignore parse error
        }
      }
      setEvents((prev) => [...prev, { id: counterRef.current++, event: data }]);
      setState("error");
      onStateChange?.("error");
      source.close();
    });

    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        setState((prev) => (prev === "running" || prev === "connecting" ? "error" : prev));
        source.close();
      }
    };

    return () => {
      source.close();
    };
  }, [sessionId, onStateChange]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (state === "idle") {
    return null;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
      {events.map(({ id, event }) => (
        <EventLine key={id} event={event} />
      ))}
      {(state === "connecting" || state === "running") && (
        <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {state === "connecting" ? "Connecting…" : "Running…"}
        </div>
      )}
      {state === "done" && (
        <div className="mt-2 text-xs text-zinc-500">── session complete ──</div>
      )}
      {state === "error" && (
        <div className="mt-2 text-xs text-red-400">── stream error ──</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function EventLine({ event }: { event: AgentRunnerEvent }) {
  if (event.type === "text") {
    return <pre className="whitespace-pre-wrap text-zinc-200">{event.text}</pre>;
  }
  if (event.type === "tool_use") {
    return (
      <div className="mt-1 rounded bg-zinc-900 px-2 py-1 text-xs text-amber-300">
        <span className="font-semibold">⚙ {event.name}</span>
        <span className="ml-2 text-zinc-500">{event.id}</span>
      </div>
    );
  }
  if (event.type === "tool_result") {
    return (
      <div className="mt-1 rounded bg-zinc-900 px-2 py-1 text-xs text-sky-300">
        <span className="font-semibold">✓ result</span>{" "}
        <span className="text-zinc-400">{event.content}</span>
      </div>
    );
  }
  if (event.type === "error") {
    return (
      <div className="mt-1 text-xs text-red-400">
        <span className="font-semibold">Error:</span> {event.message}
      </div>
    );
  }
  return null;
}
