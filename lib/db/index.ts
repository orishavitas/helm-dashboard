import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Helm database access.");
  }

  cachedDb = drizzle(neon(databaseUrl), { schema });
  return cachedDb;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}
