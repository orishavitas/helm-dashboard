import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLocalProfileEnv } from "../lib/env.js";

test("defaults Helm profile to cloud with port 3001", () => {
  const env = parseLocalProfileEnv({});

  assert.equal(env.HELM_PROFILE, "cloud");
  assert.equal(env.HELM_LOCAL_PORT, 3001);
  assert.equal(env.isLocal, false);
});

test("parses local Helm profile terminal settings", () => {
  const env = parseLocalProfileEnv({
    HELM_PROFILE: "local",
    HELM_LOCAL_PORT: "3010",
    TERMINAL_SHELL: "powershell.exe",
    TERMINAL_CWD: "C:/Users/OriShavit/Documents/GitHub",
  });

  assert.equal(env.HELM_PROFILE, "local");
  assert.equal(env.HELM_LOCAL_PORT, 3010);
  assert.equal(env.TERMINAL_SHELL, "powershell.exe");
  assert.equal(env.TERMINAL_CWD, "C:/Users/OriShavit/Documents/GitHub");
  assert.equal(env.isLocal, true);
});

test("rejects invalid Helm local ports", () => {
  assert.throws(() => parseLocalProfileEnv({ HELM_LOCAL_PORT: "0" }), /HELM_LOCAL_PORT/);
  assert.throws(() => parseLocalProfileEnv({ HELM_LOCAL_PORT: "abc" }), /HELM_LOCAL_PORT/);
});
