import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export type PublicAiMethod = {
  id: string;
  title: string;
  url: string;
  description: string | null;
};

/** Only active CMS resources are public; never invent fallback resources. */
export const getPublicAiMethods = unstable_cache(
  async (): Promise<PublicAiMethod[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("ai_methods")
        .select("id, title, url, description")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error || !data) return [];
      // Match the admin's HTTPS-only rule, including for legacy stored rows.
      return data.filter(method => {
        try {
          return Boolean(method.title.trim()) && new URL(method.url).protocol === "https:";
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  },
  ["public-ai-methods"],
  { tags: ["ai-methods"], revalidate: 300 },
);
