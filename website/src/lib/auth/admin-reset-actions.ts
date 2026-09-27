"use server";

import { cookies, headers } from "next/headers";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { resolveStaffAccount } from "@/lib/auth/staff-email";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";
import { createGateToken, gateCookieOptions, verifyGateToken } from "@/lib/security/admin-gate";
import { sendPasswordOtpEmail } from "@/lib/email/email";
import { roleAtLeast } from "@/lib/auth/permissions";

export type AdminResetState = {
  step: "request" | "verify" | "done";
  error?: string;
  message?: string;
};

const RESET_COOKIE = "ajs_admin_reset";
const OTP_TTL_SECONDS = 10 * 60;

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number")
  .regex(/[^A-Za-z0-9]/, "Password needs a symbol");

const SENT_MESSAGE =
  "If this is a staff account, a 6-digit code has been sent to its email. It expires in 10 minutes.";

/** Step 1: email a one-time code. Same answer for unknown accounts (no enumeration). */
export async function requestAdminResetAction(
  _prev: AdminResetState,
  formData: FormData,
): Promise<AdminResetState> {
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();
  if (identifier.length < 3 || identifier.length > 200) {
    return { step: "request", error: "Enter your username or email address." };
  }
  const ip = clientIpFrom(await headers());
  if (isRateLimited(`admin-reset-req:${ip}:${identifier}`, { windowMs: 15 * 60 * 1000, max: 3 })) {
    return { step: "request", error: "Too many requests. Please wait a few minutes and try again." };
  }

  const account = await resolveStaffAccount(identifier);
  if (account) {
    const { id, email } = account;
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const token = await createGateToken("reset", OTP_TTL_SECONDS, `${id}:${code}`);
    if (!token) return { step: "request", error: "Password reset is not configured on this server." };
    const sent = await sendPasswordOtpEmail(email, code, "admin");
    if (!sent) return { step: "request", error: "The code email could not be sent. Please try again later." };
    (await cookies()).set(RESET_COOKIE, `${id}|${token}`, {
      ...gateCookieOptions(OTP_TTL_SECONDS),
      path: "/ajadmin",
    });
  }
  return { step: "verify", message: SENT_MESSAGE };
}

/** Step 2: verify the code and set the new password. */
export async function confirmAdminResetAction(
  _prev: AdminResetState,
  formData: FormData,
): Promise<AdminResetState> {
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const jar = await cookies();
  const [id, token] = (jar.get(RESET_COOKIE)?.value ?? "").split("|");
  if (!id || !token) {
    return { step: "request", error: "The code expired. Request a new one." };
  }
  if (isRateLimited(`admin-reset-verify:${id}`, { windowMs: 15 * 60 * 1000, max: 5 })) {
    jar.delete({ name: RESET_COOKIE, path: "/ajadmin" });
    return { step: "request", error: "Too many wrong codes. Request a new code." };
  }
  if (!/^\d{6}$/.test(code) || !(await verifyGateToken(token, "reset", `${id}:${code}`))) {
    return { step: "verify", error: "That code is wrong or expired." };
  }
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { step: "verify", error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }
  if (password !== confirm) return { step: "verify", error: "The passwords do not match." };

  // Re-check the account is still staff before changing anything.
  const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminLooseClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
  if (!profile || !roleAtLeast(profile.role, "editor")) {
    return { step: "request", error: "This account can no longer be reset here." };
  }
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: parsed.data,
  });
  if (error) return { step: "verify", error: "The password could not be updated. Please try again." };

  jar.delete({ name: RESET_COOKIE, path: "/ajadmin" });
  return { step: "done", message: "Password updated. You can now sign in with your new password." };
}
