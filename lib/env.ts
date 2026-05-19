import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: z.string().url(),
  AUTH_SECRET: z.string().min(16),
  AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1),
  GITHUB_APP_CLIENT_ID: z.string().min(1),
  GITHUB_APP_CLIENT_SECRET: z.string().min(1),
  GITHUB_APP_SLUG: z.string().min(1),
  VERCEL_API_BASE_URL: z.string().url().default("https://api.vercel.com"),
  ENCRYPTION_KEY: z.string().min(32),
  OVERLORD_PUSH_SECRET: z.string().min(16),
});

const overlordPushEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OVERLORD_PUSH_SECRET: z.string().min(16),
});

const operationsImportEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPERATIONS_IMPORT_SECRET: z.string().min(16),
});

export function parseEnv() {
  return envSchema.parse(process.env);
}

export function parseOverlordPushEnv() {
  return overlordPushEnvSchema.parse(process.env);
}

export function parseOperationsImportEnv() {
  return operationsImportEnvSchema.parse(process.env);
}

export function optionalEnv() {
  return envSchema.partial().safeParse(process.env).success ? process.env : {};
}
