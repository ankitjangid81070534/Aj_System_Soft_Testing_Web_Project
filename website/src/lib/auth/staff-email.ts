import "server-only";
import { adminUsernameSchema } from "@/lib/validation/portal";
import { roleAtLeast } from "@/lib/auth/permissions";

/** Username or email → the staff (editor+) account email, else null. */
export async function resolveStaffAccount(
  identifier: string,
): Promise<{ id: string; email: string } | null> {
  const trimmed = identifier.trim().toLowerCase();
  try {
    const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
    const admin = createSupabaseAdminLooseClient();

    let userId: string | null = null;
    if (trimmed.includes("@")) {
      const { data: profile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("email", trimmed)
        .maybeSingle();
      if (profile && roleAtLeast(profile.role, "editor")) userId = profile.id;
    } else {
      const username = adminUsernameSchema.safeParse(trimmed);
      if (!username.success) return null;
      const { data: mapping } = await admin
        .from("admin_usernames")
        .select("user_id, is_active")
        .eq("username", username.data)
        .eq("is_active", true)
        .maybeSingle();
      if (!mapping) return null;

      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", mapping.user_id)
        .maybeSingle();
      if (profile && roleAtLeast(profile.role, "editor")) userId = mapping.user_id;
    }

    if (!userId) return null;
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user.email) return null;
    return { id: userId, email: data.user.email.toLowerCase() };
  } catch {
    return null;
  }
}

export async function resolveStaffEmail(identifier: string): Promise<string | null> {
  return (await resolveStaffAccount(identifier))?.email ?? null;
}
