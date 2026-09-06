import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import {
  galleryContentSchema,
  type GalleryContent,
  type SectionType,
} from "@/lib/validation/sections";

const DEFAULT_HOME_SECTIONS: SectionType[] = [
  "hero",
  "trust_strip",
  "services_overview",
  "platforms",
  "featured_projects",
  "process",
  "industries",
  "tech_capabilities",
  "why_us",
  "testimonials",
  "team",
  "cta",
];

export type HomeSection = {
  id: string;
  type: SectionType;
  content: Record<string, unknown> | GalleryContent;
};

function defaultHomeSections(): HomeSection[] {
  return DEFAULT_HOME_SECTIONS.map((type) => ({ id: `default-${type}`, type, content: {} }));
}

/** Ordered, published Home Builder structure with validated gallery content. */
export const getHomeSections = unstable_cache(
  async (): Promise<HomeSection[]> => {
    if (!isSupabaseConfigured) return defaultHomeSections();
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("page_sections")
        .select("id, section_type, content")
        .eq("page", "home")
        .eq("is_visible", true)
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) return defaultHomeSections();

      if (!data || data.length === 0) {
        // A configured builder with every section hidden/draft intentionally
        // renders no managed sections. A brand-new empty table keeps defaults.
        const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
        const admin = createSupabaseAdminLooseClient();
        const { count } = await admin
          .from("page_sections")
          .select("id", { count: "exact", head: true })
          .eq("page", "home");
        return (count ?? 0) > 0 ? [] : defaultHomeSections();
      }

      const result: HomeSection[] = [];
      for (const row of data) {
        if (row.section_type === "gallery") {
          const parsed = galleryContentSchema.safeParse(row.content);
          if (parsed.success) result.push({ id: row.id, type: "gallery", content: parsed.data });
          continue;
        }
        const content =
          row.content && typeof row.content === "object" && !Array.isArray(row.content)
            ? (row.content as Record<string, unknown>)
            : {};
        result.push({ id: row.id, type: row.section_type, content });
      }
      return result;
    } catch {
      return defaultHomeSections();
    }
  },
  ["home-sections"],
  { tags: ["home-sections"], revalidate: 300 },
);

/**
 * CMS page sections for a given page, visible + published only (RLS + explicit
 * filters). Only section types with a validated payload shape are returned;
 * anything malformed is skipped rather than rendered.
 */
export const getGalleryForPage = cache(
  async (page: "about" | "team" | "home"): Promise<GalleryContent | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("page_sections")
        .select("id, section_type, content")
        .eq("page", page)
        .eq("section_type", "gallery" satisfies SectionType)
        .eq("is_visible", true)
        .eq("status", "published")
        .order("sort_order")
        .limit(1);
      if (error || !data || data.length === 0) return null;

      const parsed = galleryContentSchema.safeParse(data[0].content);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },
);
