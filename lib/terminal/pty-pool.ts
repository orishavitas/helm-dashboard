import process from "node:process";
import type { IncomingMessage } from "node:http";
import type { IPty } from "node-pty";

export interface TerminalDisposable {
  dispose(): void;
}

export interface TerminalProcess {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  onData(listener: (data: string) => void): TerminalDisposable;
  onExit(listener: (event: { exitCode: number; signal?: number }) => void): TerminalDisposable;
}

export interface TerminalSpawnOptions {
  sessionId: string;
  cols: number;
  rows: number;
  shell: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export interface TerminalPoolOptions {
  maxSessions?: number;
  idleTimeoutMs?: number;
  defaultCols?: number;
  defaultRows?: number;
  shell?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  now?: () => number;
  spawn?: (options: TerminalSpawnOptions) => Promise<TerminalProcess> | TerminalProcess;
}

export interface TerminalSession {
  id: string;
  process: TerminalProcess;
  lastUsedAt: number;
}

export interface TerminalPool {
  get(sessionId: string): Promise<TerminalSession>;
  write(sessionId: string, data: string): boolean;
  resize(sessionId: string, cols: number, rows: number): boolean;
  close(sessionId: string): boolean;
  bind(sessionId: string, listeners: TerminalProcessListeners): TerminalDisposable;
  reapIdle(): number;
  size(): number;
}

export interface TerminalProcessListeners {
  onData?: (data: string) => void;
  onExit?: (event: { exitCode: number; signal?: number }) => void;
}

const DEFAULT_MAX_SESSIONS = 4;
const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1_000;
const DEFAULT_COLS = 100;
const DEFAULT_ROWS = 30;

export function createTerminalPool(options: TerminalPoolOptions = {}): TerminalPool {
  const sessions = new Map<string, TerminalSession>();
  const maxSessions = options.maxSessions ?? DEFAULT_MAX_SESSIONS;
  const idleTimeoutMs = options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS;
  const defaultCols = options.defaultCols ?? DEFAULT_COLS;
  const defaultRows = options.defaultRows ?? DEFAULT_ROWS;
  const now = options.now ?? Date.now;
  const spawn = options.spawn ?? spawnNodePty;

  function touch(session: TerminalSession) {
    session.lastUsedAt = now();
  }

  function close(sessionId: string) {
    const session = sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.process.kill();
    sessions.delete(sessionId);
    return true;
  }

  return {
    async get(sessionId) {
      const existing = sessions.get(sessionId);
      if (existing) {
        touch(existing);
        return existing;
      }

      if (sessions.size >= maxSessions) {
        throw new Error(`Maximum terminal sessions reached (${maxSessions})`);
      }

      const session: TerminalSession = {
        id: sessionId,
        lastUsedAt: now(),
        process: await spawn({
          sessionId,
          cols: defaultCols,
          rows: defaultRows,
          shell: options.shell ?? defaultShell(),
          cwd: options.cwd ?? defaultCwd(),
          env: options.env ?? process.env,
        }),
      };

      sessions.set(sessionId, session);
      return session;
    },

    write(sessionId, data) {
      const session = sessions.get(sessionId);
      if (!session) {
        return false;
      }
      touch(session);
      session.process.write(data);
      return true;
    },

    resize(sessionId, cols, rows) {
      const session = sessions.get(sessionId);
      if (!session || !Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1) {
        return false;
      }
      touch(session);
      session.process.resize(cols, rows);
      return true;
    },

    close,

    bind(sessionId, listeners) {
      const session = sessions.get(sessionId);
      if (!session) {
        return { dispose() {} };
      }

      const disposables = [
        listeners.onData ? session.process.onData(listeners.onData) : null,
        listeners.onExit ? session.process.onExit(listeners.onExit) : null,
      ].filter((disposable): disposable is TerminalDisposable => disposable !== null);

      return {
        dispose() {
          for (const disposable of disposables) {
            disposable.dispose();
          }
        },
      };
    },

    reapIdle() {
      const threshold = now() - idleTimeoutMs;
      let killed = 0;
      for (const [sessionId, session] of sessions) {
        if (session.lastUsedAt < threshold) {
          session.process.kill();
          sessions.delete(sessionId);
          killed += 1;
        }
      }
      return killed;
    },

    size() {
      return sessions.size;
    },
  };
}

export const terminalPool = createTerminalPool();

async function spawnNodePty(options: TerminalSpawnOptions): Promise<TerminalProcess> {
  const pty = await import("node-pty");
  const spawned = pty.spawn(options.shell, [], {
    name: "xterm-256color",
    cols: options.cols,
    rows: options.rows,
    cwd: options.cwd,
    env: options.env,
    useConpty: process.platform === "win32",
  });

  return adaptNodePty(spawned);
}

function adaptNodePty(pty: IPty): TerminalProcess {
  return {
    write(data) {
      pty.write(data);
    },
    resize(cols, rows) {
      pty.resize(cols, rows);
    },
    kill() {
      pty.kill();
    },
    onData(listener) {
      return pty.onData(listener);
    },
    onExit(listener) {
      return pty.onExit(listener);
    },
  };
}

function defaultShell() {
  if (process.env.TERMINAL_SHELL) {
    return process.env.TERMINAL_SHELL;
  }
  return process.platform === "win32" ? "powershell.exe" : (process.env.SHELL ?? "/bin/sh");
}

function defaultCwd() {
  return process.env.TERMINAL_CWD ?? process.cwd();
}

export function requestRemoteAddress(request: IncomingMessage) {
  return request.headers["x-forwarded-for"] ?? request.socket.remoteAddress ?? "unknown";
}
