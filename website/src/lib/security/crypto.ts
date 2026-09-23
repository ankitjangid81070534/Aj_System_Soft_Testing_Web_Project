import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

/**
 * AES-256-GCM encryption for sensitive column values (currently TOTP secrets
 * and recovery codes). The key is derived from DATA_ENCRYPTION_KEY with SHA-256
 * so any sufficiently long secret works, and the database only ever stores
 * `iv:tag:ciphertext` in base64url — never plaintext.
 */

const PLACEHOLDER_MARKER = "REPLACE_WITH";

function key(): Buffer {
  const raw = (process.env.DATA_ENCRYPTION_KEY ?? "").trim();
  if (!raw || raw.length < 16 || raw.includes(PLACEHOLDER_MARKER)) {
    throw new Error(
      "DATA_ENCRYPTION_KEY is not configured. Set a random value of at least 32 characters.",
    );
  }
  return createHash("sha256").update(raw).digest();
}

export function isEncryptionConfigured(): boolean {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(":");
}

export function decryptSecret(payload: string): string | null {
  const parts = payload.split(":");
  if (parts.length !== 3) return null;
  try {
    const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    // Wrong key or tampered value — treat as unusable, never throw to the UI.
    return null;
  }
}
