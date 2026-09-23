import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * RFC 6238 TOTP (SHA-1, 6 digits, 30-second step) implemented on node:crypto —
 * no new dependency. Used for the admin 2FA gate with authenticator apps
 * (Google Authenticator, Authy, 1Password, …).
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  const bytes = randomBytes(20);
  let bits = "";
  for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  let secret = "";
  for (let index = 0; index + 5 <= bits.length; index += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(index, index + 5), 2)];
  }
  return secret;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.replace(/=+$/, "").toUpperCase().replace(/\s+/g, "");
  let bits = "";
  for (const character of clean) {
    const value = BASE32_ALPHABET.indexOf(character);
    if (value < 0) continue;
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

export function currentStep(at: number = Date.now()): number {
  return Math.floor(at / 1000 / STEP_SECONDS);
}

export function totpCode(secret: string, step: number = currentStep()): string {
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(Math.floor(step / 2 ** 32), 0);
  counter.writeUInt32BE(step % 2 ** 32, 4);
  const digest = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/**
 * Verify a submitted code within ±1 step (clock drift). Returns the matched
 * step so the caller can reject replays of an already-used code.
 */
export function verifyTotp(
  secret: string,
  submitted: string,
  options: { lastUsedStep?: number | null; at?: number } = {},
): { valid: boolean; step?: number } {
  const code = submitted.replace(/\D/g, "");
  if (code.length !== DIGITS) return { valid: false };
  const now = currentStep(options.at ?? Date.now());
  for (const step of [now, now - 1, now + 1]) {
    const expected = totpCode(secret, step);
    const a = Buffer.from(expected);
    const b = Buffer.from(code);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      if (options.lastUsedStep != null && step <= options.lastUsedStep) return { valid: false };
      return { valid: true, step };
    }
  }
  return { valid: false };
}

/** otpauth:// URI an authenticator app can enrol from (shown as text + QR). */
export function totpUri(secret: string, account: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** One-time recovery codes, shown once at enrolment. */
export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(5).toString("hex").toUpperCase().replace(/(.{5})/, "$1-"),
  );
}
