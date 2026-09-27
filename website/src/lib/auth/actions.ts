"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, safeAdminPath } from "@/lib/validation/auth";
import { resolveStaffEmail } from "@/lib/auth/staff-email";
import { roleAtLeast } from "@/lib/auth/permissions";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

export type SignInState = { error?: string };

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const rawIdentifier = formData.get("identifier") || formData.get("email");
  const rawPassword = formData.get("password");

  const parsed = loginSchema.safeParse({
    identifier: rawIdentifier,
    password: rawPassword,
  });

  if (!parsed.success) {
    return { error: "Enter your username or email address and password." };
  }

  const identifier = parsed.data.identifier.toLowerCase();
  const requestHeaders = await headers();
  const rateKey = `admin-login:${clientIpFrom(requestHeaders)}:${identifier}`;
  if (isRateLimited(rateKey, { windowMs: 10 * 60 * 1000, max: 8 })) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const resolvedEmail = await resolveStaffEmail(identifier);
  if (!resolvedEmail) return { error: "Invalid username or password." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password: parsed.data.password,
  });

  if (error) {
    // Generic message — no account enumeration, no provider internals leaked.
    return { error: "Invalid username or password." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!profile || !roleAtLeast(profile.role, "editor")) {
    await supabase.auth.signOut();
    return { error: "Invalid username or password." };
  }

  redirect(safeAdminPath(formData.get("next")));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/ajadmin/login");
}
