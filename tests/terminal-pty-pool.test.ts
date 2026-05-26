import assert from "node:assert/strict";
import { test } from "node:test";

import { createTerminalPool } from "../lib/terminal/pty-pool.js";
import type { TerminalProcess } from "../lib/terminal/pty-pool.js";

interface FakeTerminalProcess extends TerminalProcess {
  id: string;
  writeBuffer: string[];
  resizeBuffer: Array<{ cols: number; rows: number }>;
  killed: boolean;
}

function fakeProcess(id: string): FakeTerminalProcess {
  return {
    id,
    writeBuffer: [],
    resizeBuffer: [],
    killed: false,
    write(data: string) {
      this.writeBuffer.push(data);
    },
    resize(cols: number, rows: number) {
      this.resizeBuffer.push({ cols, rows });
    },
    kill() {
      this.killed = true;
    },
    onData() {
      return { dispose() {} };
    },
    onExit() {
      return { dispose() {} };
    },
  };
}

test("reuses a PTY session by id and forwards writes and resizes", async () => {
  const spawned: FakeTerminalProcess[] = [];
  const pool = createTerminalPool({
    spawn: async ({ sessionId }) => {
      const process = fakeProcess(sessionId);
      spawned.push(process);
      return process;
    },
    now: () => 1_000,
  });

  const first = await pool.get("alpha");
  const second = await pool.get("alpha");

  assert.equal(first, second);
  assert.equal(spawned.length, 1);

  pool.write("alpha", "Get-ChildItem\r");
  pool.resize("alpha", 120, 32);

  assert.deepEqual(spawned[0].writeBuffer, ["Get-ChildItem\r"]);
  assert.deepEqual(spawned[0].resizeBuffer, [{ cols: 120, rows: 32 }]);
});

test("enforces the maximum PTY session count", async () => {
  const pool = createTerminalPool({
    maxSessions: 2,
    spawn: async ({ sessionId }) => fakeProcess(sessionId),
  });

  await pool.get("one");
  await pool.get("two");

  await assert.rejects(() => pool.get("three"), /Maximum terminal sessions reached/);
});

test("kills idle PTY sessions after the configured timeout", async () => {
  let now = 1_000;
  const processes: FakeTerminalProcess[] = [];
  const pool = createTerminalPool({
    idleTimeoutMs: 500,
    now: () => now,
    spawn: async ({ sessionId }) => {
      const process = fakeProcess(sessionId);
      processes.push(process);
      return process;
    },
  });

  await pool.get("alpha");
  now = 1_400;
  pool.reapIdle();

  assert.equal(processes[0].killed, false);
  assert.equal(pool.size(), 1);

  now = 1_501;
  pool.reapIdle();

  assert.equal(processes[0].killed, true);
  assert.equal(pool.size(), 0);
});
