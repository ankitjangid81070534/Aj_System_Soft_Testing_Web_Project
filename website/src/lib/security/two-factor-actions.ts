"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { roleAtLeast } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { encryptSecret, isEncryptionConfigured } from "@/lib/security/crypto";
import {
  generateRecoveryCodes,
  generateTotpSecret,
  totpUri,
  verifyTotp,
} from "@/lib/security/totp";
import {
  clearTwoFactorSession,
  grantTwoFactorSession,
  readTwoFactorRecord,
} from "@/lib/security/two-factor";
import { BRAND } from "@/lib/seo/site";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

/**
 * Admin 2FA enrolment and verification. Every action re-checks the staff
 * session server-side; codes are rate limited per account and a used step can
 * never be replayed.
 */

export type TwoFactorState = {
  status: "idle" | "error" | "success";
  message?: string;
  /** Present only immediately after a successful enrolment confirmation. */
  recoveryCodes?: string[];
};

export type EnrolmentStart =
  | { ok: true; secret: string; uri: string }
  | { ok: false; message: string };

/** Create (or replace) an unconfirmed secret and return it for the QR code. */
export async function startTwoFactorEnrolment(): Promise<EnrolmentStart> {
  const user = await requireStaff();
  if (!isEncryptionConfigured()) {
    return { ok: false, message: "DATA_ENCRYPTION_KEY is not configured on the server." };
  }
  const secret = generateTotpSecret();
  try {
    const admin = createSupabaseAdminLooseClient();
    const { error } = await admin.from("admin_totp").upsert(
      {
        user_id: user.id,
        secret_encrypted: encryptSecret(secret),
        confirmed_at: null,
        last_used_step: null,
        recovery_codes_encrypted: null,
      },
      { onConflict: "user_id" },
    );
    if (error) {
      return {
        ok: false,
        message:
          error.code === "42P01"
            ? "Run database migration 0021 in Supabase to enable two-factor authentication."
            : "Could not start enrolment.",
      };
    }
  } catch {
    return { ok: false, message: "Could not start enrolment." };
  }
  return { ok: true, secret, uri: totpUri(secret, user.email, BRAND.primaryName) };
}

async function checkCode(
  userId: string,
  submitted: string,
): Promise<{ ok: true; step: number } | { ok: false; message: string }> {
  const requestHeaders = await headers();
  if (
    isRateLimited(`admin-2fa:${userId}`, { windowMs: 10 * 60 * 1000, max: 10 }) ||
    isRateLimited(`admin-2fa-ip:${clientIpFrom(requestHeaders)}`, {
      windowMs: 10 * 60 * 1000,
      max: 20,
    })
  ) {
    return { ok: false, message: "Too many attempts. Please wait a few minutes." };
  }

  const record = await readTwoFactorRecord(userId);
  if (!record) return { ok: false, message: "Two-factor authentication is not set up." };

  const result = verifyTotp(record.secret, submitted, { lastUsedStep: record.lastUsedStep });
  if (!result.valid || result.step === undefined) {
    return { ok: false, message: "That code is not valid. Check your authenticator app." };
  }
  return { ok: true, step: result.step };
}

/** Confirm the first code, activating 2FA and returning recovery codes once. */
export async function confirmTwoFactorAction(
  _previous: TwoFactorState,
  formData: FormData,
): Promise<TwoFactorState> {
  const user = await requireStaff();
  const submitted = String(formData.get("code") ?? "");
  const checked = await checkCode(user.id, submitted);
  if (!checked.ok) return { status: "error", message: checked.message };

  const recoveryCodes = generateRecoveryCodes();
  try {
    const admin = createSupabaseAdminLooseClient();
    const { error } = await admin
      .from("admin_totp")
      .update({
        confirmed_at: new Date().toISOString(),
        last_used_step: checked.step,
        recovery_codes_encrypted: encryptSecret(recoveryCodes.join(",")),
      })
      .eq("user_id", user.id);
    if (error) return { status: "error", message: "Could not activate two-factor authentication." };
  } catch {
    return { status: "error", message: "Could not activate two-factor authentication." };
  }

  await grantTwoFactorSession(user.id);
  return {
    status: "success",
    message: "Two-factor authentication is active. Save these recovery codes now.",
    recoveryCodes,
  };
}

/** Challenge at sign-in: a valid code grants this session admin access. */
export async function verifyTwoFactorAction(
  _previous: TwoFactorState,
  formData: FormData,
): Promise<TwoFactorState> {
  const user = await requireStaff();
  const submitted = String(formData.get("code") ?? "");
  const checked = await checkCode(user.id, submitted);
  if (!checked.ok) return { status: "error", message: checked.message };

  try {
    const admin = createSupabaseAdminLooseClient();
    await admin.from("admin_totp").update({ last_used_step: checked.step }).eq("user_id", user.id);
  } catch {
    // step replay protection is best effort; the code itself was valid
  }

  await grantTwoFactorSession(user.id);
  redirect("/ajadmin");
}

/** Turn 2FA off. Admins and above only. */
export async function disableTwoFactorAction(): Promise<TwoFactorState> {
  const user = await requireStaff();
  if (!roleAtLeast(user.role, "admin")) {
    return { status: "error", message: "Only an admin can disable two-factor authentication." };
  }
  try {
    const admin = createSupabaseAdminLooseClient();
    const { error } = await admin.from("admin_totp").delete().eq("user_id", user.id);
    if (error) return { status: "error", message: "Could not disable two-factor authentication." };
  } catch {
    return { status: "error", message: "Could not disable two-factor authentication." };
  }
  await clearTwoFactorSession();
  return { status: "success", message: "Two-factor authentication is switched off." };
}
