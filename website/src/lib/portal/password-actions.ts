"use server";

import { cookies } from "next/headers";
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { requirePublicSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { sendPasswordOtpEmail } from "@/lib/email/email";
import { isRateLimited } from "@/lib/rate-limit";
import { createGateToken, gateCookieOptions, verifyGateToken } from "@/lib/security/admin-gate";
import { updatePasswordSchema } from "@/lib/validation/portal";
import type { PortalActionState } from "@/lib/portal/actions";

const OTP_COOKIE = "ajs_account_pw_otp";
const OTP_TTL_SECONDS = 10 * 60;
const WINDOW = 15 * 60 * 1000;

const fail = (message: string): PortalActionState => ({ status: "error", message });
const text = (formData: FormData, key: string) => {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
};

/** The signed-in user (verified with Supabase), or null. */
async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ? { id: user.id, email: user.email.toLowerCase() } : null;
}

function parseNewPassword(formData: FormData) {
  return updatePasswordSchema.safeParse({
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
}

async function setPassword(userId: string, password: string): Promise<PortalActionState> {
  const { error } = await createSupabaseAdminLooseClient().auth.admin.updateUserById(userId, {
    password,
  });
  if (error) return fail("The password could not be updated. Please try again.");
  return { status: "success", message: "Your password has been changed." };
}

/** Option 1: confirm the current password, then set the new one. */
export async function changePasswordWithCurrentAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const user = await currentUser();
  if (!user) return fail("Your session expired. Please sign in again.");
  if (isRateLimited(`account-pw-current:${user.id}`, { windowMs: WINDOW, max: 5 })) {
    return fail("Too many attempts. Please wait a few minutes or use the email code option.");
  }

  const current = text(formData, "currentPassword");
  if (!current) return fail("Enter your current password.");
  const parsed = parseNewPassword(formData);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the new password.");
  if (parsed.data.password === current) return fail("Choose a password different from the current one.");

  // Check the current password on a throw-away client so the visitor's own
  // session cookies are never touched.
  const { url, anonKey } = requirePublicSupabaseEnv();
  const probe = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await probe.auth.signInWithPassword({ email: user.email, password: current });
  if (error) {
    return fail("Your current password is incorrect. Signed in with Google? Use the email code option.");
  }

  return setPassword(user.id, parsed.data.password);
}

/** Option 2, step 1: email a 6-digit code to the signed-in user. */
export async function sendPasswordOtpAction(): Promise<PortalActionState> {
  const user = await currentUser();
  if (!user) return fail("Your session expired. Please sign in again.");
  if (isRateLimited(`account-pw-send:${user.id}`, { windowMs: WINDOW, max: 3 })) {
    return fail("Too many codes requested. Please wait a few minutes.");
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const token = await createGateToken("reset", OTP_TTL_SECONDS, `client:${user.id}:${code}`);
  if (!token) return fail("Email codes are not configured on this server.");
  if (!(await sendPasswordOtpEmail(user.email, code, "client"))) {
    return fail("The code email could not be sent. Please try again later.");
  }
  (await cookies()).set(OTP_COOKIE, token, gateCookieOptions(OTP_TTL_SECONDS));
  return { status: "success", message: `A 6-digit code was sent to ${user.email}. It expires in 10 minutes.` };
}

/** Option 2, step 2: verify the code, then set the new password. */
export async function changePasswordWithOtpAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const user = await currentUser();
  if (!user) return fail("Your session expired. Please sign in again.");

  const jar = await cookies();
  const token = jar.get(OTP_COOKIE)?.value;
  if (!token) return fail("The code expired. Send a new code.");
  if (isRateLimited(`account-pw-verify:${user.id}`, { windowMs: WINDOW, max: 5 })) {
    jar.delete(OTP_COOKIE);
    return fail("Too many wrong codes. Send a new code.");
  }

  const code = text(formData, "code").trim();
  if (!/^\d{6}$/.test(code) || !(await verifyGateToken(token, "reset", `client:${user.id}:${code}`))) {
    return fail("That code is wrong or expired.");
  }
  const parsed = parseNewPassword(formData);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the new password.");

  const result = await setPassword(user.id, parsed.data.password);
  if (result.status === "success") jar.delete(OTP_COOKIE);
  return result;
}
