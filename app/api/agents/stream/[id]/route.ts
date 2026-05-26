import { NextRequest } from "next/server";

import { requireUser } from "@/lib/session";
import {
  getAgentSession,
  updateAgentSession,
  appendAgentEvent,
} from "@/lib/data/agents";
import { runAgent } from "@/lib/agents/claude-runner";
import {
  registerController,
  unregisterController,
  hasController,
} from "@/lib/agents/session-controllers";
import { parseLocalProfileEnv } from "@/lib/env";

export const runtime = "nodejs";
// Disable body size limit for streaming
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const env = parseLocalProfileEnv();

  if (!env.isLocal) {
    return new Response("Agent runner requires local profile", { status: 403 });
  }

  await requireUser();

  const session = await getAgentSession(id);
  if (!session) {
    return new Response("Session not found", { status: 404 });
  }
  if (session.status === "running" || hasController(id)) {
    return new Response("Session is already running", { status: 409 });
  }

  const controller = new AbortController();
  registerController(id, controller);

  await updateAgentSession(id, { status: "running", startedAt: new Date() });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(streamController) {
      function send(event: string, data: unknown) {
        const line = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        streamController.enqueue(encoder.encode(line));
      }

      try {
        for await (const event of runAgent({
          prompt: session.prompt,
          model: session.model,
          signal: controller.signal,
        })) {
          send(event.type, event);

          // Persist to DB (fire-and-forget — don't block the stream)
          // Skip "usage" events — not in the DB enum; they're informational only
          if (event.type !== "usage") {
            const dbType = event.type as "text" | "tool_use" | "tool_result" | "error" | "done";
            void appendAgentEvent(
              id,
              dbType,
              event.type === "text" ? event.text : null,
              event as Record<string, unknown>,
            ).catch(() => undefined);
          }

          if (event.type === "done" || event.type === "error") {
            break;
          }
        }

        await updateAgentSession(id, {
          status: controller.signal.aborted ? "stopped" : "done",
          completedAt: new Date(),
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        send("error", { type: "error", message });
        await updateAgentSession(id, {
          status: "error",
          error: message,
          completedAt: new Date(),
        });
      } finally {
        unregisterController(id);
        streamController.close();
      }
    },
    cancel() {
      controller.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
