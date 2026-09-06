"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { adminUsernameSchema } from "@/lib/validation/portal";

const roleSchema = z.enum(["super_admin", "admin", "editor", "client"]);
const idSchema = z.string().uuid();
const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number")
  .regex(/[^A-Za-z0-9]/, "Password needs a symbol");

const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(20),
  role: roleSchema,
  username: z.string().trim().max(32),
  password: strongPasswordSchema,
  addressLine1: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
});

function usersRedirect(kind: "notice" | "error", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/ajadmin/users?${params.toString()}`);
}

export async function createUserAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "users:manage")) {
    usersRedirect("error", "Only a super admin can create users.");
  }

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    username: formData.get("username") ?? "",
    password: formData.get("password"),
    addressLine1: formData.get("addressLine1") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode") || undefined,
  });
  if (!parsed.success) {
    usersRedirect("error", parsed.error.issues[0]?.message ?? "Check the user details.");
  }

  if (
    parsed.data.role !== "client" &&
    !adminUsernameSchema.safeParse(parsed.data.username).success
  ) {
    usersRedirect("error", "A valid lowercase username is required for staff accounts.");
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
    },
  });
  if (authError || !created.user) {
    usersRedirect("error", "The Auth user could not be created. The email may already exist.");
  }

  const userId = created.user.id;
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: parsed.data.email.toLowerCase(),
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    role: parsed.data.role,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    usersRedirect("error", "The profile could not be created; the Auth user was rolled back.");
  }

  if (parsed.data.role !== "client") {
    const { error: usernameError } = await admin.from("admin_usernames").upsert(
      {
        user_id: userId,
        username: parsed.data.username.toLowerCase(),
        is_active: true,
        created_by: actor.id,
        updated_by: actor.id,
      },
      { onConflict: "user_id" },
    );
    if (usernameError) {
      await admin.auth.admin.deleteUser(userId);
      usersRedirect("error", "The staff username is unavailable; the new user was rolled back.");
    }
  }

  if (parsed.data.addressLine1 && parsed.data.city && parsed.data.state && parsed.data.postalCode) {
    await admin.from("user_addresses").insert({
      user_id: userId,
      label: "Primary Address",
      address_line_1: parsed.data.addressLine1,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postalCode,
      country: "India", // Default or you can add it to the form
      is_primary: true,
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "user.created",
    entity: "profiles",
    entity_id: userId,
    summary: `Created ${parsed.data.role} user ${parsed.data.email.toLowerCase()}`,
  });
  revalidatePath("/ajadmin/users");
  usersRedirect("notice", "User created and email confirmed. They can sign in immediately.");
}

/** Best-effort audit write: failures are logged, never block the action. */
async function writeAudit(row: {
  actor_id: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  summary: string;
}): Promise<void> {
  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin.from("audit_logs").insert(row);
  if (error) {
    console.error("[admin] audit log write failed", {
      action: row.action,
      code: error.code,
      message: error.message,
    });
  }
}

export async function resetUserPasswordAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "users:manage")) {
    usersRedirect("error", "Only a super admin can reset user passwords.");
  }

  const id = idSchema.safeParse(formData.get("id"));
  const password = strongPasswordSchema.safeParse(formData.get("password"));
  if (!id.success || !password.success) {
    usersRedirect(
      "error",
      password.success
        ? "Invalid user."
        : (password.error.issues[0]?.message ?? "Invalid password."),
    );
  }

  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin.auth.admin.updateUserById(id.data, { password: password.data });
  if (error) usersRedirect("error", "The password could not be reset.");

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "user.password_reset",
    entity: "auth.users",
    entity_id: id.data,
    summary: "A super admin set a new password for a user.",
  });
  usersRedirect("notice", "Password reset successfully. The new password works immediately.");
}

export async function changeUserRoleAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  // Only super admins may change roles (the DB trigger enforces this too).
  if (!actor || !can(actor.role, "users:manage")) {
    usersRedirect("error", "Only a super admin can change user roles.");
  }
  if (actor.id === String(formData.get("id"))) {
    usersRedirect("error", "You cannot change your own role.");
  }

  const id = idSchema.safeParse(formData.get("id"));
  const role = roleSchema.safeParse(formData.get("role"));
  if (!id.success || !role.success) usersRedirect("error", "Invalid user or role.");

  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin.from("profiles").update({ role: role.data }).eq("id", id.data);
  if (error) {
    console.error("[admin] role change failed", { code: error.code, message: error.message });
    usersRedirect("error", "The user role could not be changed.");
  }
  revalidatePath("/ajadmin/users");
  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "user.role_changed",
    entity: "profiles",
    entity_id: id.data,
    summary: `A super admin changed a user role to ${role.data}.`,
  });
  usersRedirect("notice", "User role updated successfully.");
}

export async function updateAdminUsernameAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "users:manage")) {
    usersRedirect("error", "Only a super admin can update staff usernames.");
  }

  const id = idSchema.safeParse(formData.get("id"));
  const username = adminUsernameSchema.safeParse(formData.get("username"));
  if (!id.success || !username.success) {
    usersRedirect("error", "Use a valid lowercase staff username.");
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: target } = await admin
    .from("profiles")
    .select("role, email")
    .eq("id", id.data)
    .maybeSingle();
  if (!target || target.role === "client") {
    usersRedirect("error", "Staff usernames can only be assigned to staff accounts.");
  }

  const { error } = await admin.from("admin_usernames").upsert(
    {
      user_id: id.data,
      username: username.data,
      is_active: true,
      created_by: actor.id,
      updated_by: actor.id,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("[admin] username update failed", { code: error.code, message: error.message });
    usersRedirect("error", "That username is unavailable or could not be saved.");
  }

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "admin_username.updated",
    entity: "admin_usernames",
    entity_id: id.data,
    summary: `Updated the staff username for ${String(target.email)}`,
  });
  revalidatePath("/ajadmin/users");
  usersRedirect("notice", "Staff username updated successfully.");
}
