/**
 * Admin entrance hardening — shared by the Edge proxy and server code.
 *
 * Two independent signed cookies, both HMAC-SHA256 over ADMIN_GATE_SECRET
 * using Web Crypto (so this module works on the Edge runtime too):
 *
 *   ajs_admin_gate — proves the visitor arrived through the secret entrance
 *                    URL (ADMIN_URL_SEGMENT). Without it, every /ajadmin path
 *                    answers 404, so the admin area is not discoverable.
 *   ajs_admin_2fa  — proves this session passed the TOTP challenge; bound to
 *                    the staff user id.
 *
 * When ADMIN_URL_SEGMENT is unset the gate is disabled and /ajadmin behaves as
 * before — the site must never lock its owner out because of a missing value.
 */

export const ADMIN_GATE_COOKIE = "ajs_admin_gate";
export const ADMIN_2FA_COOKIE = "ajs_admin_2fa";

export const GATE_TTL_SECONDS = 12 * 60 * 60;
export const TWO_FACTOR_TTL_SECONDS = 8 * 60 * 60;

const PLACEHOLDER_MARKER = "REPLACE_WITH";

/** The configured secret entrance slug, or null when the gate is disabled. */
export function adminUrlSegment(): string | null {
  const raw = (process.env.ADMIN_URL_SEGMENT ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!raw || raw.includes(PLACEHOLDER_MARKER) || !/^[A-Za-z0-9][A-Za-z0-9-]{2,63}$/.test(raw)) {
    return null;
  }
  return raw;
}

function secret(): string | null {
  const raw = (process.env.ADMIN_GATE_SECRET ?? "").trim();
  if (!raw || raw.length < 16 || raw.includes(PLACEHOLDER_MARKER)) return null;
  return raw;
}

async function sign(payload: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

/** Create a signed, expiring token for one purpose (+ optional subject). */
export async function createGateToken(
  purpose: "gate" | "2fa",
  ttlSeconds: number,
  subject = "",
): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${purpose}:${subject}:${expires}`;
  return `${expires}.${await sign(payload, key)}`;
}

export async function verifyGateToken(
  token: string | undefined,
  purpose: "gate" | "2fa",
  subject = "",
): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || !signature) return false;
  if (expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(`${purpose}:${subject}:${expires}`, key);
  return safeEqual(expected, signature);
}

/** Cookie attributes shared by both gate cookies. */
export function gateCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
