import process from "node:process";

import { WebSocketServer } from "ws";

const DEFAULT_MAX_SESSIONS = 4;
const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_COLS = 100;
const DEFAULT_ROWS = 30;

const sessions = new Map();
const terminalServer = new WebSocketServer({ noServer: true, perMessageDeflate: false });

export function handleTerminalUpgrade(request, socket, head) {
  const sessionId = terminalSessionIdFromUrl(request.url);
  if (!sessionId) {
    socket.destroy();
    return false;
  }

  terminalServer.handleUpgrade(request, socket, head, (ws) => {
    ws.on("error", (error) => {
      console.error("[terminal] WebSocket error:", error.message);
    });
    getSession(sessionId)
      .then((session) => {
        const dataDisposable = session.pty.onData((data) => {
          if (ws.readyState === 1) {
            ws.send(data);
          }
        });
        const exitDisposable = session.pty.onExit((event) => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: "exit", ...event }));
            ws.close();
          }
        });

        ws.on("message", (message) => {
          const decoded = decodeTerminalClientMessage(message);
          if (!decoded) {
            return;
          }
          session.lastUsedAt = Date.now();
          if (decoded.type === "input") {
            session.pty.write(decoded.data);
            return;
          }
          session.pty.resize(decoded.cols, decoded.rows);
        });

        ws.on("close", () => {
          dataDisposable.dispose();
          exitDisposable.dispose();
          closeSession(session.id);
        });
      })
      .catch((error) => {
        ws.close(1011, error instanceof Error ? error.message : "Terminal failed to start");
      });
  });

  return true;
}

export function reapIdleTerminalSessions() {
  const threshold = Date.now() - DEFAULT_IDLE_TIMEOUT_MS;
  for (const [sessionId, session] of sessions) {
    if (session.lastUsedAt < threshold) {
      closeSession(sessionId);
    }
  }
}

function terminalSessionIdFromUrl(url) {
  if (!url) {
    return null;
  }
  const parsed = new URL(url, "http://helm.local");
  const match = /^\/ws\/terminal\/([^/]+)$/.exec(parsed.pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getSession(sessionId) {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.lastUsedAt = Date.now();
    return existing;
  }

  if (sessions.size >= DEFAULT_MAX_SESSIONS) {
    throw new Error(`Maximum terminal sessions reached (${DEFAULT_MAX_SESSIONS})`);
  }

  const { spawn } = await import("node-pty");
  const pty = spawn(defaultShell(), [], {
    name: "xterm-256color",
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
    cwd: process.env.TERMINAL_CWD ?? process.cwd(),
    env: process.env,
    useConpty: process.platform === "win32",
  });

  const session = {
    id: sessionId,
    pty,
    lastUsedAt: Date.now(),
  };

  sessions.set(sessionId, session);
  return session;
}

function closeSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    return;
  }
  session.pty.kill();
  sessions.delete(sessionId);
}

function decodeTerminalClientMessage(raw) {
  const text = Buffer.isBuffer(raw)
    ? raw.toString("utf8")
    : typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? Buffer.concat(raw).toString("utf8")
        : Buffer.from(raw).toString("utf8");

  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.type === "input" && typeof parsed.data === "string") {
      return { type: "input", data: parsed.data };
    }
    if (
      parsed &&
      parsed.type === "resize" &&
      Number.isInteger(parsed.cols) &&
      parsed.cols > 0 &&
      Number.isInteger(parsed.rows) &&
      parsed.rows > 0
    ) {
      return { type: "resize", cols: parsed.cols, rows: parsed.rows };
    }
    return null;
  } catch {
    return { type: "input", data: text };
  }
}

function defaultShell() {
  if (process.env.TERMINAL_SHELL) {
    return process.env.TERMINAL_SHELL;
  }
  return process.platform === "win32" ? "powershell.exe" : (process.env.SHELL ?? "/bin/sh");
}
