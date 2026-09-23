"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import {
  authFailure,
  databaseFailureForCode,
  validationFailure,
  type AdminMutationState,
} from "@/lib/admin/mutation-result";
import { SITE_COPY_FIELDS } from "@/lib/data/site-copy";

export type SiteCopyState = AdminMutationState;

const MAX_LENGTH = 2000;

/**
 * Saves the website copy edited in /ajadmin/copy into `public.site_copy`
 * (migration 0018). Only the keys declared in `SITE_COPY_FIELDS` are accepted,
 * so a stale or crafted form can never write arbitrary rows. A field left blank
 * is stored as an empty string, which makes the public site fall back to its
 * built-in default text.
 */
export async function updateSiteCopyAction(
  _prev: SiteCopyState,
  formData: FormData,
): Promise<SiteCopyState> {
  const user = await getCurrentUser();
  if (!user) return authFailure("UNAUTHORIZED", "Your session expired. Sign in again.");
  if (!can(user.role, "settings:write")) {
    return authFailure("FORBIDDEN", "Your role cannot change website text.");
  }

  const rows: { key: string; value: string }[] = [];
  for (const field of SITE_COPY_FIELDS) {
    const raw = formData.get(field.key);
    if (typeof raw !== "string") continue;
    const value = raw.replace(/\r\n/g, "\n").trim();
    if (value.length > MAX_LENGTH) {
      return validationFailure(`"${field.label}" is too long (max ${MAX_LENGTH} characters).`, {
        [field.key]: [`Keep this under ${MAX_LENGTH} characters.`],
      });
    }
    rows.push({ key: field.key, value });
  }

  if (rows.length === 0) return validationFailure("Nothing to save.");

  const admin = createSupabaseAdminLooseClient();
  const { data: saved, error } = await admin
    .from("site_copy")
    .upsert(rows, { onConflict: "key" })
    .select("key");

  if (error || !saved || saved.length === 0) {
    console.error("[admin] site copy upsert failed", {
      code: error?.code ?? "no-row",
      message: error?.message ?? "The write returned no saved row.",
    });
    if (error?.code === "42P01" || error?.code === "PGRST204") {
      return {
        ok: false,
        code: "DATABASE_ERROR",
        message: "Website text needs migration 0018_site_copy.sql to be run in Supabase first.",
      };
    }
    return databaseFailureForCode(error?.code);
  }

  try {
    revalidatePath("/ajadmin/copy");
    updateTag("site-copy");
    revalidatePath("/", "layout");
  } catch (refreshError) {
    console.error("[admin] site copy cache refresh failed", {
      message: refreshError instanceof Error ? refreshError.message : "Unknown refresh error",
    });
  }

  return { ok: true, message: "Website text saved. The public site now shows the new copy." };
}
