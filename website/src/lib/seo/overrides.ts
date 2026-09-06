import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export type SeoOverride = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  noIndex: boolean;
};

/**
 * Admin-managed per-path SEO overrides (seo_metadata table, publicly readable
 * by design). Static routes call withSeoOverrides(path, () => baseMetadata)
 * so the SEO Manager controls the final head output.
 */
export const getSeoOverride = cache(async (path: string): Promise<SeoOverride | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("seo_metadata")
      .select("title, description, og_image_url, no_index")
      .eq("path", path)
      .limit(1);
    const row = data?.[0];
    if (!row) return null;
    return {
      title: typeof row.title === "string" && row.title ? row.title : null,
      description: typeof row.description === "string" && row.description ? row.description : null,
      ogImageUrl:
        typeof row.og_image_url === "string" && row.og_image_url ? row.og_image_url : null,
      noIndex: row.no_index === true,
    };
  } catch {
    return null;
  }
});
