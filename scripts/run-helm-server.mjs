const mode = process.argv[2] === "production" ? "production" : "development";

process.env.NODE_ENV = mode;

await import("../server.mjs");
