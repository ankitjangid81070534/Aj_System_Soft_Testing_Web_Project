import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { NAV_LINKS } from "@/lib/navigation";

export type PublicNavLink = { label: string; href: string };

export type PublicNavigation = {
  header: PublicNavLink[];
  footer: PublicNavLink[];
};

function safeNavigationUrl(value: string): string | null {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export const getPublicNavigation = unstable_cache(
  async (): Promise<PublicNavigation> => {
    const fallback = NAV_LINKS.map((link) => ({ label: link.label, href: link.href }));
    if (!isSupabaseConfigured) return { header: fallback, footer: [] };

    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("navigation_items")
        .select("label, url, location")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) return { header: fallback, footer: [] };

      const mapped = (data ?? [])
        .map((row) => {
          const href = safeNavigationUrl(row.url);
          return href ? { label: row.label.trim(), href, location: row.location } : null;
        })
        .filter(
          (row): row is PublicNavLink & { location: "header" | "footer" } =>
            row !== null && row.label.length > 0,
        );
      const header = mapped
        .filter((row) => row.location === "header")
        .map(({ label, href }) => ({ label, href }));
      const footer = mapped
        .filter((row) => row.location === "footer")
        .map(({ label, href }) => ({ label, href }));

      return { header: header.length > 0 ? header : fallback, footer };
    } catch {
      return { header: fallback, footer: [] };
    }
  },
  ["public-navigation"],
  { tags: ["navigation"], revalidate: 300 },
);
