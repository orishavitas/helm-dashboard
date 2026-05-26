import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveGithubSnapshotState, normalizeCommit } from "../lib/github-snapshot.js";

test("marks fresh GitHub snapshots stale after the cache TTL", () => {
  const now = new Date("2026-05-20T12:00:00.000Z");

  const state = deriveGithubSnapshotState({
    status: "fresh",
    fetchedAt: new Date("2026-05-20T11:58:59.000Z"),
    error: null,
    now,
  });

  assert.equal(state.status, "stale");
  assert.equal(state.error, null);
});

test("normalizes recent commit payloads for dashboard rendering", () => {
  const commit = normalizeCommit({
    sha: "abcdef1234567890",
    html_url: "https://github.com/acme/app/commit/abcdef1234567890",
    commit: {
      message: "Add terminal grouping\n\nbody",
      author: {
        name: "Codex",
        date: "2026-05-20T11:30:00Z",
      },
    },
  });

  assert.deepEqual(commit, {
    sha: "abcdef1",
    message: "Add terminal grouping",
    author: "Codex",
    url: "https://github.com/acme/app/commit/abcdef1234567890",
    committedAt: "2026-05-20T11:30:00Z",
  });
});
