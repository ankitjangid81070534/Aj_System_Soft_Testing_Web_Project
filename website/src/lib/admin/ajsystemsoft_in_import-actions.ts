"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { can, type Capability } from "@/lib/auth/permissions";
import { getResourceConfig } from "@/lib/admin/crud";
import { WEBSITE_IMPORTERS } from "@/lib/admin/ajsystemsoft_in_website-defaults";
import { authFailure, validationFailure, type AdminMutationResult } from "@/lib/admin/mutation-result";

/** "Import from website": copy the content the site shows into this module. */
export async function importWebsiteContentAction(formData: FormData): Promise<AdminMutationResult> {
  const key = String(formData.get("resource") ?? "");
  const config = getResourceConfig(key);
  const importer = WEBSITE_IMPORTERS[key];
  if (!config || !importer) return validationFailure("Nothing to import for this module.");
  const user = await getCurrentUser();
  if (!user) return authFailure("UNAUTHORIZED", "Session expired — sign in again.");
  if (!can(user.role, `${config.capability}:write` as Capability)) {
    return authFailure("FORBIDDEN", `Your role (${user.role}) is not allowed to do this.`);
  }
  try {
    const count = await importer(createSupabaseAdminLooseClient(), user.id);
    updateTag("navigation");
    updateTag("contact-hub-links");
    revalidatePath(`/ajadmin/c/${config.section}`);
    revalidatePath("/", "layout");
    return { ok: true, message: count > 0 ? `Imported ${count} item(s) from the website.` : "Everything shown on the website is already here." };
  } catch (error) {
    console.error("[admin] import website content", key, error);
    return { ok: false, code: "DATABASE_ERROR", message: "Import failed — nothing on the website was changed. Please retry." };
  }
}
