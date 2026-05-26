import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { config as loadDotenv } from "dotenv";
import next from "next";
import { z } from "zod";

import { handleTerminalUpgrade, reapIdleTerminalSessions } from "./lib/terminal/server-runtime.mjs";

const projectDir = process.cwd();
const dev = process.env.NODE_ENV !== "production";

if (existsSync(join(projectDir, ".env.local"))) {
  loadDotenv({ path: join(projectDir, ".env.local") });
}
loadDotenv();

const profile = parseLocalProfileEnv();
const app = next({ dev, dir: projectDir });
const handle = app.getRequestHandler();

try {
  await app.prepare();
} catch (error) {
  console.error("Failed to prepare Next.js application:", error);
  process.exit(1);
}

const handleUpgrade = typeof app.getUpgradeHandler === "function" ? app.getUpgradeHandler() : null;

const server = createServer((request, response) => {
  void handle(request, response);
});

server.on("upgrade", (request, socket, head) => {
  if (!profile.isLocal) {
    socket.destroy();
    return;
  }

  const isTerminalUpgrade = request.url?.startsWith("/ws/terminal/");

  if (isTerminalUpgrade && handleTerminalUpgrade(request, socket, head)) {
    return;
  }

  if (handleUpgrade) {
    void handleUpgrade(request, socket, head);
    return;
  }

  socket.destroy();
});

setInterval(reapIdleTerminalSessions, 60_000).unref();

server.listen(profile.HELM_LOCAL_PORT, "127.0.0.1", () => {
  console.log(`Helm local runtime ready: http://127.0.0.1:${profile.HELM_LOCAL_PORT}`);
});

function parseLocalProfileEnv(env = process.env) {
  const optionalNonEmptyString = z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional());
  const schema = z.object({
    HELM_PROFILE: z.enum(["cloud", "local"]).default("cloud"),
    HELM_LOCAL_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    TERMINAL_SHELL: optionalNonEmptyString,
    TERMINAL_CWD: optionalNonEmptyString,
    OBSIDIAN_REST_API_URL: z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional()),
    OBSIDIAN_REST_API_KEY: optionalNonEmptyString,
    OBSIDIAN_VAULT_PATH: optionalNonEmptyString,
    ANTHROPIC_API_KEY: optionalNonEmptyString,
  });
  const parsed = schema.parse(env);
  return { ...parsed, isLocal: parsed.HELM_PROFILE === "local" };
}
