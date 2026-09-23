import "server-only";

import { cookies } from "next/headers";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { decryptSecret, isEncryptionConfigured } from "@/lib/security/crypto";
import {
  ADMIN_2FA_COOKIE,
  TWO_FACTOR_TTL_SECONDS,
  createGateToken,
  gateCookieOptions,
  verifyGateToken,
} from "@/lib/security/admin-gate";

/**
 * Server-side state for the admin TOTP gate. The secret is stored encrypted
 * (AES-256-GCM) and only ever decrypted here, inside a server module.
 */

export type TwoFactorRecord = {
  secret: string;
  confirmed: boolean;
  lastUsedStep: number | null;
};

export type TwoFactorStatus = {
  available: boolean;
  enrolled: boolean;
  /** true when a record exists but the first code was never confirmed. */
  pending: boolean;
  /** Set when the table is missing (migration 0021 not yet applied). */
  setupHint?: string;
};

export async function getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
  if (!isSupabaseConfigured || !isEncryptionConfigured()) {
    return { available: false, enrolled: false, pending: false };
  }
  try {
    const admin = createSupabaseAdminLooseClient();
    const { data, error } = await admin
      .from("admin_totp")
      .select("confirmed_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      return {
        available: false,
        enrolled: false,
        pending: false,
        setupHint:
          error.code === "42P01"
            ? "Two-factor authentication needs database migration 0021. Run it in Supabase."
            : undefined,
      };
    }
    return {
      available: true,
      enrolled: Boolean(data?.confirmed_at),
      pending: Boolean(data) && !data?.confirmed_at,
    };
  } catch {
    return { available: false, enrolled: false, pending: false };
  }
}

export async function readTwoFactorRecord(userId: string): Promise<TwoFactorRecord | null> {
  if (!isSupabaseConfigured || !isEncryptionConfigured()) return null;
  try {
    const admin = createSupabaseAdminLooseClient();
    const { data, error } = await admin
      .from("admin_totp")
      .select("secret_encrypted, confirmed_at, last_used_step")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    const secret = decryptSecret(String(data.secret_encrypted));
    if (!secret) return null;
    return {
      secret,
      confirmed: Boolean(data.confirmed_at),
      lastUsedStep: data.last_used_step == null ? null : Number(data.last_used_step),
    };
  } catch {
    return null;
  }
}

/** Has THIS session already passed the TOTP challenge? */
export async function hasTwoFactorSession(userId: string): Promise<boolean> {
  const store = await cookies();
  return verifyGateToken(store.get(ADMIN_2FA_COOKIE)?.value, "2fa", userId);
}

export async function grantTwoFactorSession(userId: string): Promise<void> {
  const token = await createGateToken("2fa", TWO_FACTOR_TTL_SECONDS, userId);
  if (!token) return;
  const store = await cookies();
  store.set(ADMIN_2FA_COOKIE, token, gateCookieOptions(TWO_FACTOR_TTL_SECONDS));
}

export async function clearTwoFactorSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_2FA_COOKIE, "", gateCookieOptions(0));
}
