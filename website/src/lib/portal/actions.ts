"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RECOVERY_COOKIE_NAME } from "@/lib/auth/recovery";
import { isEmailConfigured, sendPasswordRecoveryEmail } from "@/lib/email/email";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";
import {
  clientLoginSchema,
  clientSignupSchema,
  completeProfileSchema,
  forgotPasswordSchema,
  profileSchema,
  reviewSchema,
  safePortalPath,
  updatePasswordSchema,
} from "@/lib/validation/portal";
import { recordAgreementAcceptance } from "@/lib/agreements/acceptance";
import { getCurrentServiceAgreement } from "@/lib/agreements/data";

const checkbox = (formData: FormData, key: string): boolean =>
  ["on", "true"].includes(value(formData, key));

/**
 * Sign-up requires migration 0016 (username/address columns) to be present.
 * Until then the extra fields are ignored gracefully rather than failing the
 * account creation.
 */
async function extendedProfileReady(): Promise<boolean> {
  try {
    const admin = createSupabaseAdminLooseClient();
    const { error } = await admin
      .from("user_addresses")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

async function usernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
  const admin = createSupabaseAdminLooseClient();
  let query = admin.from("profiles").select("id").ilike("username", username).limit(1);
  if (excludeUserId) query = query.neq("id", excludeUserId);
  const { data, error } = await query;
  if (error) return false; // column missing pre-0016 → treat as available
  return Boolean(data && data.length > 0);
}

export type PortalActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const idleError = (message: string): PortalActionState => ({ status: "error", message });

function value(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

async function requestKey(scope: string, identity: string): Promise<string> {
  const requestHeaders = await headers();
  return `${scope}:${clientIpFrom(requestHeaders)}:${identity.trim().toLowerCase()}`;
}

async function authCallbackUrl(nextPath: string): Promise<string> {
  const requestHeaders = await headers();
  const requestOrigin = requestHeaders.get("origin");
  let origin = siteUrl;

  if (requestOrigin) {
    try {
      const candidate = new URL(requestOrigin);
      const local = candidate.hostname === "localhost" || candidate.hostname === "127.0.0.1";
      const protocolAllowed = candidate.protocol === "http:" || candidate.protocol === "https:";

      // Production always uses the single configured canonical host. Only a
      // local development request is allowed to override it.
      if (local && protocolAllowed) origin = candidate.origin;
    } catch {
      // Fall back to the validated canonical environment URL.
    }
  }

  return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

/**
 * Sign-up stays fail-closed until migration 0012 exists in production. This
 * prevents a partially deployed database from assigning the legacy editor
 * default to a new public account.
 */
async function portalSchemaReady(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const admin = createSupabaseAdminLooseClient();
    const { error } = await admin
      .from("admin_usernames")
      .select("user_id", { head: true, count: "exact" })
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function clientLoginAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  if (!isSupabaseConfigured) return idleError("Client login is not configured yet.");

  const parsed = clientLoginSchema.safeParse({
    email: value(formData, "email"),
    password: value(formData, "password"),
  });
  if (!parsed.success) {
    return idleError(parsed.error.issues[0]?.message ?? "Check your email and password.");
  }

  if (
    isRateLimited(await requestKey("portal-login", parsed.data.email), {
      windowMs: 10 * 60 * 1000,
      max: 8,
    })
  ) {
    return idleError("Too many sign-in attempts. Please wait a few minutes and try again.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return idleError("Invalid email or password.");

  redirect(safePortalPath(formData.get("next")));
}

export async function clientSignupAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  if (!(await portalSchemaReady())) {
    return idleError(
      "Client registration is being prepared. Please try again after the portal update.",
    );
  }

  const parsed = clientSignupSchema.safeParse({
    fullName: value(formData, "fullName"),
    username: value(formData, "username"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    company: value(formData, "company"),
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
    addressLine1: value(formData, "addressLine1"),
    addressLine2: value(formData, "addressLine2"),
    city: value(formData, "city"),
    state: value(formData, "state"),
    postalCode: value(formData, "postalCode"),
    country: value(formData, "country") || "India",
    consent: checkbox(formData, "consent"),
    agreementAccepted: checkbox(formData, "agreementAccepted"),
  });
  if (!parsed.success) {
    return idleError(parsed.error.issues[0]?.message ?? "Please check your account details.");
  }

  const profileReady = await extendedProfileReady();
  if (profileReady && (await usernameTaken(parsed.data.username))) {
    return idleError("That username is already taken. Please choose another.");
  }

  if (
    isRateLimited(await requestKey("portal-signup", parsed.data.email), {
      windowMs: 60 * 60 * 1000,
      max: 3,
    })
  ) {
    return idleError("Too many registration attempts. Please try again later.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: await authCallbackUrl("/account"),
      data: {
        full_name: parsed.data.fullName,
        company: parsed.data.company || null,
        username: parsed.data.username,
        phone: parsed.data.phone,
        address_line_1: parsed.data.addressLine1,
        address_line_2: parsed.data.addressLine2 || null,
        city: parsed.data.city,
        state: parsed.data.state,
        postal_code: parsed.data.postalCode,
        country: parsed.data.country,
      },
    },
  });

  if (error) {
    return idleError("We could not create the account right now. Please try again shortly.");
  }

  if (data.user?.id) {
    await recordAgreementAcceptance({
      context: "signup",
      userId: data.user.id,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
  }

  if (data.session) redirect("/account");

  return {
    status: "success",
    message: "Check your email and use the verification link to activate your client account.",
  };
}

export async function googleOAuthReadyAction(): Promise<PortalActionState> {
  if (!(await portalSchemaReady())) {
    return idleError(
      "Google sign-in will be available as soon as the client portal database update is complete.",
    );
  }
  return { status: "success" };
}

export async function forgotPasswordAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  if (!isSupabaseConfigured) return idleError("Password recovery is not configured yet.");

  const parsed = forgotPasswordSchema.safeParse({ email: value(formData, "email") });
  if (!parsed.success) return idleError("Enter a valid email address.");

  if (
    isRateLimited(await requestKey("portal-recovery", parsed.data.email), {
      windowMs: 60 * 60 * 1000,
      max: 3,
    })
  ) {
    return {
      status: "success",
      message: "If an account exists for this email, a recovery link will arrive shortly.",
    };
  }

  const callbackUrl = `${await authCallbackUrl("/update-password")}&flow=recovery`;
  let brandedDelivered = false;

  if (isEmailConfigured()) {
    const admin = createSupabaseAdminLooseClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: parsed.data.email,
      options: { redirectTo: callbackUrl },
    });
    const tokenHash = data?.properties?.hashed_token;
    if (!error && tokenHash) {
      const origin = new URL(callbackUrl).origin;
      const recoveryUrl = new URL("/auth/confirm", origin);
      recoveryUrl.searchParams.set("token_hash", tokenHash);
      recoveryUrl.searchParams.set("type", "recovery");
      recoveryUrl.searchParams.set("next", "/update-password");
      const delivery = await sendPasswordRecoveryEmail(parsed.data.email, recoveryUrl.toString());
      brandedDelivered = delivery.delivered;
    } else if (error) {
      console.error("[portal-auth] branded recovery link generation failed", {
        code: error.code,
        status: error.status,
      });
    }
  }

  if (!brandedDelivered) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: callbackUrl,
    });
    if (error) {
      console.error("[portal-auth] recovery request failed", {
        code: error.code,
        status: error.status,
      });
    }
  }

  return {
    status: "success",
    message: "If an account exists for this email, a recovery link will arrive shortly.",
  };
}

export async function updatePasswordAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  if (!isSupabaseConfigured) return idleError("Password updates are not configured yet.");

  const parsed = updatePasswordSchema.safeParse({
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
  });
  if (!parsed.success) {
    return idleError(parsed.error.issues[0]?.message ?? "Please check the new password.");
  }

  const cookieStore = await cookies();
  if (cookieStore.get(RECOVERY_COOKIE_NAME)?.value !== "1") {
    return idleError("Your recovery link is invalid or expired. Request a fresh link.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return idleError("Your recovery session expired. Request a new link.");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return idleError("The password could not be updated. Request a fresh recovery link.");

  cookieStore.delete(RECOVERY_COOKIE_NAME);
  await supabase.auth.signOut();
  redirect("/login?password=updated");
}

export async function updateProfileAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const parsed = profileSchema.safeParse({
    fullName: value(formData, "fullName"),
    phone: value(formData, "phone"),
    company: value(formData, "company"),
  });
  if (!parsed.success) {
    return idleError(parsed.error.issues[0]?.message ?? "Please check your profile details.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return idleError("Sign in again to update your profile.");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
    })
    .eq("id", user.id);

  if (error) return idleError("Your profile could not be saved right now.");
  revalidatePath("/account");
  return { status: "success", message: "Profile saved." };
}

/**
 * "Complete your profile" — for Google OAuth accounts (and legacy sign-ups)
 * that are missing the mandatory username / mobile / address, plus the
 * Service Agreement acceptance. Writes go through the user's own RLS-bound
 * session; only the acceptance evidence uses the service role.
 */
export async function completeProfileAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const parsed = completeProfileSchema.safeParse({
    fullName: value(formData, "fullName"),
    username: value(formData, "username"),
    phone: value(formData, "phone"),
    addressLine1: value(formData, "addressLine1"),
    addressLine2: value(formData, "addressLine2"),
    city: value(formData, "city"),
    state: value(formData, "state"),
    postalCode: value(formData, "postalCode"),
    country: value(formData, "country") || "India",
    agreementAccepted: checkbox(formData, "agreementAccepted"),
  });
  if (!parsed.success) {
    return idleError(parsed.error.issues[0]?.message ?? "Please check your details.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return idleError("Sign in again to complete your profile.");

  if (!(await extendedProfileReady())) {
    return idleError("Profile completion is being prepared. Please try again after the update.");
  }
  if (await usernameTaken(parsed.data.username, user.id)) {
    return idleError("That username is already taken. Please choose another.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      username: parsed.data.username,
      phone: parsed.data.phone,
      profile_completed: true,
    })
    .eq("id", user.id);
  if (profileError) {
    return idleError(
      profileError.code === "23505"
        ? "That username is already taken. Please choose another."
        : "Your profile could not be saved right now.",
    );
  }

  const { data: existing } = await supabase
    .from("user_addresses")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .limit(1);
  const addressRow = {
    address_line_1: parsed.data.addressLine1,
    address_line_2: parsed.data.addressLine2 || null,
    city: parsed.data.city,
    state: parsed.data.state,
    postal_code: parsed.data.postalCode,
    country: parsed.data.country,
    is_primary: true,
  };
  const { error: addressError } = existing?.[0]?.id
    ? await supabase.from("user_addresses").update(addressRow).eq("id", existing[0].id)
    : await supabase.from("user_addresses").insert({ ...addressRow, user_id: user.id });
  if (addressError) return idleError("Your address could not be saved right now.");

  const current = await getCurrentServiceAgreement();
  if (current) {
    const admin = createSupabaseAdminLooseClient();
    const { data: accepted } = await admin
      .from("agreement_acceptances")
      .select("id")
      .eq("user_id", user.id)
      .eq("version_id", current.versionId)
      .limit(1);
    if (!accepted || accepted.length === 0) {
      await recordAgreementAcceptance({
        context: "account",
        userId: user.id,
        fullName: parsed.data.fullName,
        email: user.email ?? null,
        phone: parsed.data.phone,
      });
    }
  }

  revalidatePath("/account");
  return { status: "success", message: "Profile completed. Thank you!" };
}

const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function uploadAvatarAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return idleError("Choose an image to upload.");
  if (file.size > 3 * 1024 * 1024) return idleError("Avatar must be 3 MB or smaller.");
  const extension = AVATAR_TYPES[file.type];
  if (!extension) return idleError("Use a JPG, PNG, WebP or AVIF image.");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return idleError("Sign in again to upload an avatar.");

  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-avatars")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return idleError("The avatar could not be uploaded right now.");

  const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", user.id);
  if (profileError) return idleError("The avatar uploaded, but the profile could not be updated.");

  revalidatePath("/account");
  return { status: "success", message: "Avatar updated." };
}

export async function submitVerifiedReviewAction(
  _previous: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const parsed = reviewSchema.safeParse({
    rating: value(formData, "rating"),
    title: value(formData, "title"),
    reviewText: value(formData, "reviewText"),
    projectId: value(formData, "projectId"),
  });
  if (!parsed.success) {
    return idleError(parsed.error.issues[0]?.message ?? "Please check your review.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return idleError("Sign in again to submit a review.");

  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url, company").eq("id", user.id).single(),
    supabase
      .from("clients")
      .select("id, name")
      .eq("auth_user_id", user.id)
      .eq("portal_enabled", true)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);
  if (!client) {
    return idleError("Reviews are available only after AJS verifies your client relationship.");
  }

  let projectName: string | null = null;
  const projectId = parsed.data.projectId || null;
  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .eq("client_id", client.id)
      .maybeSingle();
    if (!project) return idleError("Choose a project linked to your client account.");
    projectName = project.name;
  }

  const { error } = await supabase.from("testimonials").insert({
    author_name: profile?.full_name || user.email.split("@")[0],
    author_company: profile?.company || client.name,
    avatar_url: profile?.avatar_url ?? null,
    quote: parsed.data.reviewText,
    review_text: parsed.data.reviewText,
    title: parsed.data.title,
    rating: parsed.data.rating,
    project_name: projectName,
    project_id: projectId,
    client_id: client.id,
    submitted_by: user.id,
    is_verified: true,
    is_public: false,
    is_active: true,
    status: "draft",
  });
  if (error) return idleError("Your review could not be saved right now.");

  revalidatePath("/account");
  return { status: "success", message: "Review submitted for moderation. Thank you." };
}

export async function clientSignOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
