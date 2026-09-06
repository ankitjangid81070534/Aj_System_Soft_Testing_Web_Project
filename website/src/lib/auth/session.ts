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

  if (!profile) {
    const metadata = user.user_metadata;
    const fullName =
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      null;

    // The auth.users trigger normally creates this row. If a legacy/migrated
    // user is missing it, keep the valid session and render a safe client
    // profile-completion state instead of creating a login redirect loop.
    return {
      id: user.id,
      email: user.email,
      role: "client",
      fullName,
      avatarUrl:
        typeof metadata.avatar_url === "string"
          ? metadata.avatar_url
          : typeof metadata.picture === "string"
            ? metadata.picture
            : null,
      phone: typeof metadata.phone === "string" ? metadata.phone : null,
      company: typeof metadata.company === "string" ? metadata.company : null,
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    phone: profile.phone,
    company: profile.company,
  };
});

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
