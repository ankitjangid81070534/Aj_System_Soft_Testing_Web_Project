import "server-only";

import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { WEBSITE_IMPORTERS } from "@/lib/admin/ajsystemsoft_in_website-defaults";

/**
 * Automatic website → admin sync: when a module still only has the site's
 * built-in content, copy it into the database so it shows up here ready to
 * edit, delete or reorder. No button — it runs when the module opens.
 */
export async function autoSyncWebsiteContent(resource: string, userId: string): Promise<void> {
  const importer = WEBSITE_IMPORTERS[resource];
  if (!importer) return;
  try {
    await importer(createSupabaseAdminLooseClient(), userId);
  } catch (error) {
    console.error("[admin] auto-sync website content", resource, error);
  }
}
