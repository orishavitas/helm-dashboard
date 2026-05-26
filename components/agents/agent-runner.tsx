"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AgentEventStream, type StreamState } from "./agent-event-stream";
import { Button } from "@/components/ui/button";

interface AgentRunnerProps {
  defaultModel?: string;
}

export function AgentRunner({ defaultModel = "claude-sonnet-4-6" }: AgentRunnerProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(defaultModel);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the prompt textarea on mount
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  const isRunning = streamState === "connecting" || streamState === "running";

  const startSession = useCallback(async () => {
    if (!prompt.trim() || isRunning) {
      return;
    }
    setError(null);
    setSessionId(null);

    try {
      const response = await fetch("/api/agents/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? `HTTP ${response.status}`);
        return;
      }

      const session = (await response.json()) as { id: string };
      setSessionId(session.id);
      setPrompt("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    }
  }, [prompt, model, isRunning]);

  const stopSession = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    await fetch(`/api/agents/stop/${sessionId}`, { method: "POST" });
  }, [sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      void startSession();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt input */}
      <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Prompt
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500" htmlFor="agent-model">
              Model
            </label>
            <select
              id="agent-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isRunning}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="claude-haiku-4-5-20251001">Haiku 4.5 (fast)</option>
              <option value="claude-sonnet-4-6">Sonnet 4.6 (default)</option>
              <option value="claude-opus-4-7">Opus 4.7 (powerful)</option>
            </select>
          </div>
        </div>
        <textarea
          ref={promptRef}
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder="Describe what you want the agent to do… (Ctrl+Enter to run)"
          className="resize-none rounded bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <div className="flex justify-end gap-2">
          {isRunning && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 border border-red-800 px-3 text-xs text-red-400 hover:bg-red-950"
              onClick={() => void stopSession()}
            >
              Stop
            </Button>
          )}
          <Button
            type="button"
            disabled={!prompt.trim() || isRunning}
            className="h-8 px-4 text-xs"
            onClick={() => void startSession()}
          >
            {isRunning ? "Running…" : "Run Agent"}
          </Button>
        </div>
      </div>

      {/* Event stream */}
      {sessionId && (
        <AgentEventStream sessionId={sessionId} onStateChange={setStreamState} />
      )}
    </div>
  );
}
