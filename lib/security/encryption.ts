import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function keyFromEnv() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY is required for token encryption.");
  }

  const candidates = [
    Buffer.from(raw, "base64"),
    Buffer.from(raw, "hex"),
    Buffer.from(raw, "utf8"),
  ];
  const key = candidates.find((candidate) => candidate.length === 32);
  if (!key) {
    throw new Error("ENCRYPTION_KEY must resolve to exactly 32 bytes.");
  }
  return key;
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromEnv(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(payload: string) {
  const [ivText, tagText, encryptedText] = payload.split(".");
  if (!ivText || !tagText || !encryptedText) {
    throw new Error("Encrypted payload is malformed.");
  }

  const decipher = createDecipheriv("aes-256-gcm", keyFromEnv(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
