import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { roleAtLeast, type AppRole } from "@/lib/auth/permissions";

export type SessionUser = {
  id: string;
  email: string;
  role: AppRole;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  company: string | null;
};

/**
 * Request-scoped current user (profile role included). Authentication and the
 * application profile are deliberately separate: a missing profile never
 * turns a valid Supabase session into a false logout.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured) return null; // pre-setup: pages render their honest notices
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, avatar_url, phone, company")
    .eq("id", user.id)
    .maybeSingle();

  // Google (and other OAuth) sign-ins carry the name/photo in user_metadata.
  // Use it wherever the saved profile is still blank so forms arrive
  // pre-filled — e.g. an email account that later signed in with Google.
  const fromProvider = providerProfile(user.user_metadata ?? {});

  if (!profile) {
    // The auth.users trigger normally creates this row. If a legacy/migrated
    // user is missing it, keep the valid session and render a safe client
    // profile-completion state instead of creating a login redirect loop.
    return { id: user.id, email: user.email, role: "client", ...fromProvider };
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.full_name || fromProvider.fullName,
    avatarUrl: profile.avatar_url || fromProvider.avatarUrl,
    phone: profile.phone || fromProvider.phone,
    company: profile.company || fromProvider.company,
  };
});

function metadataString(metadata: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return null;
}

function providerProfile(metadata: Record<string, unknown>) {
  return {
    fullName: metadataString(metadata, "full_name", "name"),
    avatarUrl: metadataString(metadata, "avatar_url", "picture"),
    phone: metadataString(metadata, "phone"),
    company: metadataString(metadata, "company"),
  };
}

/**
 * Guard for staff-only pages/actions: unauthenticated visitors are sent to
 * the admin login. Role checks stay explicit at the call site via can() /
 * roleAtLeast().
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!roleAtLeast(user.role, "editor")) redirect("/account");
  return user;
}

export { roleAtLeast };
export type { AppRole };
