import { notFound } from "next/navigation";
import { Bot } from "lucide-react";

import { AgentRunner } from "@/components/agents/agent-runner";
import { listAgentSessions } from "@/lib/data/agents";
import { parseLocalProfileEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

export default async function AgentsPage() {
  const env = parseLocalProfileEnv();
  if (!env.isLocal) {
    notFound();
  }

  await requireUser();
  const sessions = await listAgentSessions(10);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-300">
            <Bot className="h-4 w-4" />
            Local runtime
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-zinc-50">Agent Runner</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Run Claude Code agents and watch their output stream live.
          </p>
        </div>
        {env.ANTHROPIC_API_KEY ? (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-800 bg-emerald-950 px-2 py-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            API key set
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded border border-amber-800 bg-amber-950 px-2 py-1 text-xs text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            ANTHROPIC_API_KEY not set
          </span>
        )}
      </div>

      {/* Runner */}
      <AgentRunner defaultModel={process.env.CLAUDE_DEFAULT_MODEL ?? "claude-sonnet-4-6"} />

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">Recent sessions</h2>
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
              >
                <p className="flex-1 truncate text-sm text-zinc-300">{s.prompt}</p>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={s.status} />
                  <span className="text-xs text-zinc-500">{s.model}</span>
                  <span className="text-xs text-zinc-600">
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-zinc-800 text-zinc-400",
    running: "bg-emerald-950 text-emerald-300",
    done: "bg-sky-950 text-sky-300",
    error: "bg-red-950 text-red-300",
    stopped: "bg-amber-950 text-amber-300",
  };
  const cls = variants[status] ?? "bg-zinc-800 text-zinc-400";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
  );
}
