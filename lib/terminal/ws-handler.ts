import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";

import { terminalPool, type TerminalPool } from "./pty-pool.js";

export type TerminalClientMessage =
  | { type: "input"; data: string }
  | { type: "resize"; cols: number; rows: number };

const terminalServer = new WebSocketServer({ noServer: true, perMessageDeflate: false });

export function terminalSessionIdFromUrl(url: string | undefined) {
  if (!url) {
    return null;
  }

  const parsed = new URL(url, "http://helm.local");
  const match = /^\/ws\/terminal\/([^/]+)$/.exec(parsed.pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function decodeTerminalClientMessage(raw: string | Buffer | ArrayBuffer | Buffer[]) {
  const text = Buffer.isBuffer(raw)
    ? raw.toString("utf8")
    : typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? Buffer.concat(raw).toString("utf8")
        : Buffer.from(raw).toString("utf8");

  try {
    const parsed: unknown = JSON.parse(text);
    if (isRecord(parsed) && parsed.type === "input" && typeof parsed.data === "string") {
      return { type: "input", data: parsed.data } satisfies TerminalClientMessage;
    }
    if (
      isRecord(parsed) &&
      parsed.type === "resize" &&
      isPositiveInteger(parsed.cols) &&
      isPositiveInteger(parsed.rows)
    ) {
      return { type: "resize", cols: parsed.cols, rows: parsed.rows } satisfies TerminalClientMessage;
    }
    return null;
  } catch {
    return { type: "input", data: text } satisfies TerminalClientMessage;
  }
}

export function handleTerminalUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  pool: TerminalPool = terminalPool,
) {
  const sessionId = terminalSessionIdFromUrl(request.url);
  if (!sessionId) {
    socket.destroy();
    return false;
  }

  terminalServer.handleUpgrade(request, socket, head, (ws) => {
    void pool
      .get(sessionId)
      .then((session) => {
        const binding = pool.bind(session.id, {
          onData(data) {
            if (ws.readyState === ws.OPEN) {
              ws.send(data);
            }
          },
          onExit(event) {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({ type: "exit", ...event }));
              ws.close();
            }
          },
        });

        ws.on("message", (message) => {
          const decoded = decodeTerminalClientMessage(message);
          if (!decoded) {
            return;
          }
          if (decoded.type === "input") {
            pool.write(session.id, decoded.data);
            return;
          }
          pool.resize(session.id, decoded.cols, decoded.rows);
        });

        ws.on("close", () => {
          binding.dispose();
          pool.close(session.id);
        });
      })
      .catch((error: unknown) => {
        ws.close(1011, error instanceof Error ? error.message : "Terminal failed to start");
      });
  });

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
