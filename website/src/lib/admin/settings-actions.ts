"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { z } from "zod";
import {
  authFailure,
  databaseFailureForCode,
  validationFailure,
  type AdminMutationState,
} from "@/lib/admin/mutation-result";
import { isSafeNavigationTarget } from "@/lib/admin/resources";

export type SettingsState = AdminMutationState;

const optionalEmail = z.union([z.literal(""), z.email().max(200)]);
const optionalSafeUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || isSafeNavigationTarget(value),
    "Use a site path or https:// URL",
  );

const settingsSchema = z.object({
  brand_name: z.string().trim().max(120),
  brand_short_name: z.string().trim().max(60),
  tagline: z.string().trim().max(200),
  business_hours: z.string().trim().max(160),
  contact_email: optionalEmail,
  support_email: optionalEmail,
  phone: z.string().trim().max(20),
  whatsapp: z.string().trim().max(20),
  address_line: z.string().trim().max(300),
  map_url: optionalSafeUrl,
  global_cta_label: z.string().trim().max(60),
  global_cta_href: optionalSafeUrl,
  company_description: z.string().trim().max(1000),
  company_legal_name: z.string().trim().max(120),
});

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await getCurrentUser();
  if (!user) return authFailure("UNAUTHORIZED", "Your session expired. Sign in again.");
  if (!can(user.role, "settings:write")) {
    return authFailure("FORBIDDEN", "Your role cannot change brand settings.");
  }

  const raw: Record<string, string> = {};
  for (const key of settingsSchema.keyof().options) {
    const value = formData.get(key);
    raw[key] = typeof value === "string" ? value : "";
  }
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).filter(
        (entry): entry is [string, string[]] => Array.isArray(entry[1]),
      ),
    );
    return validationFailure(
      parsed.error.issues[0]?.message ?? "Check the settings form.",
      fieldErrors,
    );
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: saved, error } = await admin
    .from("site_settings")
    .upsert({
      id: true,
      ...parsed.data,
    })
    .select("id")
    .limit(1);

  if (error || !saved || saved.length === 0) {
    console.error("[admin] settings upsert failed", {
      code: error?.code ?? "no-row",
      message: error?.message ?? "The write returned no saved row.",
    });
    if (error?.code === "PGRST204") {
      return {
        ok: false,
        code: "DATABASE_ERROR",
        message: "Brand settings need the latest database migration.",
      };
    }
    return databaseFailureForCode(error?.code);
  }
  try {
    revalidatePath("/ajadmin/brand");
    updateTag("site-settings");
    revalidatePath("/", "layout");
  } catch (refreshError) {
    console.error("[admin] settings cache refresh failed", {
      message: refreshError instanceof Error ? refreshError.message : "Unknown refresh error",
    });
  }
  return { ok: true, message: "Brand and contact settings saved successfully." };
}
