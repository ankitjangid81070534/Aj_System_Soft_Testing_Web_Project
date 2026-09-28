import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { safeContactDestination } from "@/lib/contact-hub";
import { HUB_LINK_ICON_OPTIONS } from "@/lib/admin/resources";

export type HubLinkIcon = (typeof HUB_LINK_ICON_OPTIONS)[number]["value"];

export type HubLink = { id: string; label: string; href: string; icon: HubLinkIcon; newTab: boolean };

const ICON_KEYS = new Set<string>(HUB_LINK_ICON_OPTIONS.map((icon) => icon.value));

/** https / site path (validated) plus tel: and mailto:, never javascript: etc. */
function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (/^(tel|mailto):[^\s<>"']+$/i.test(href)) return href;
  return safeContactDestination(href);
}

/** Active admin links for the "Let's talk" panel; empty when unset or unreadable. */
export const getContactHubLinks = unstable_cache(
  async (): Promise<HubLink[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await createSupabasePublicClient()
        .from("contact_hub_links")
        .select("id, label, url, icon, open_new_tab")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(12);
      if (error || !data) return [];
      return (data as Record<string, unknown>[]).flatMap((row) => {
        const label = typeof row.label === "string" ? row.label.trim() : "";
        const href = safeHref(row.url);
        if (!label || !href) return [];
        const icon = typeof row.icon === "string" && ICON_KEYS.has(row.icon) ? (row.icon as HubLinkIcon) : "link";
        return [{ id: String(row.id), label, href, icon, newTab: row.open_new_tab !== false }];
      });
    } catch {
      return [];
    }
  },
  ["contact-hub-links"],
  { tags: ["contact-hub-links"], revalidate: 300 },
);

/**
 * True once the admin table holds any row (active or paused). From then on the
 * admin list fully controls the panel, so the built-in entries are not added
 * again (they were copied into the table as editable rows).
 */
export const hasManagedContactHubLinks = unstable_cache(
  async (): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      // Service role: paused rows are hidden from anon by RLS but still count.
      const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
      const { count, error } = await createSupabaseAdminLooseClient()
        .from("contact_hub_links")
        .select("id", { count: "exact", head: true });
      return !error && (count ?? 0) > 0;
    } catch {
      return false;
    }
  },
  ["contact-hub-links-managed"],
  { tags: ["contact-hub-links"], revalidate: 300 },
);
