import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeTerminalClientMessage, terminalSessionIdFromUrl } from "../lib/terminal/ws-handler.js";

test("extracts terminal session id from the websocket URL", () => {
  assert.equal(terminalSessionIdFromUrl("/ws/terminal/main"), "main");
  assert.equal(terminalSessionIdFromUrl("/ws/terminal/space%20name?cols=120"), "space name");
  assert.equal(terminalSessionIdFromUrl("/api/terminal/main"), null);
});

test("decodes terminal websocket client messages", () => {
  assert.deepEqual(decodeTerminalClientMessage("hello"), { type: "input", data: "hello" });
  assert.deepEqual(decodeTerminalClientMessage(JSON.stringify({ type: "input", data: "dir\r" })), {
    type: "input",
    data: "dir\r",
  });
  assert.deepEqual(decodeTerminalClientMessage(JSON.stringify({ type: "resize", cols: 100, rows: 40 })), {
    type: "resize",
    cols: 100,
    rows: 40,
  });
  assert.equal(decodeTerminalClientMessage(JSON.stringify({ type: "resize", cols: 0, rows: 40 })), null);
});
