import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { asStringArray } from "@/lib/data/jsonb";
import { toProjectTeaser, type ProjectTeaser } from "@/lib/data/mappers";

/**
 * Portfolio access. Public rules are enforced twice: by RLS (only published +
 * active + public rows exist for anon) and by explicit query filters here.
 * No fallback projects exist — with an empty CMS the portfolio shows an honest
 * empty state and unknown slugs 404. Fabricated case studies are never added.
 */

export type CaseStudyMedia = { id: string; url: string; alt: string; type: "image" | "video" };

export type CaseStudy = ProjectTeaser & {
  overview: string | null;
  problem: string | null;
  solution: string | null;
  keyFeatures: string[];
  technologyStack: string[];
  databaseNote: string | null;
  integrations: string[];
  duration: string | null;
  projectYear: number | null;
  projectStatus: string | null;
  videoUrl: string | null;
  impactResults: string[];
  testimonial: { quote: string; person: string | null; role: string | null } | null;
  publicUrl: string | null;
  gallery: CaseStudyMedia[];
};

export type ProjectFilters = { platform?: string; industry?: string };

/** All public projects for the index page (teaser level). */
export const getPublicProjects = cache(async (): Promise<ProjectTeaser[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, name, short_summary, cover_image_url, platform_type, industry, is_featured, status, client_id",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .limit(48);
    if (error || !data || data.length === 0) return [];

    // Client names resolve only for clients that pass RLS (public_permission).
    const clientIds = [
      ...new Set(data.map((row) => row.client_id).filter((id): id is string => id !== null)),
    ];
    const clientNames = new Map<string, string>();
    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds);
      for (const client of clients ?? []) clientNames.set(client.id, client.name);
    }
    return data.map((row) =>
      toProjectTeaser(row, row.client_id ? clientNames.get(row.client_id) : null),
    );
  } catch {
    return [];
  }
});

/** One full case study with gallery. Null when missing or not public. */
export const getProjectCaseStudy = cache(async (slug: string): Promise<CaseStudy | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createSupabaseServerClient();
    // Staff preview: drafts open on the public URL for editors/admins.
    const user = await getCurrentUser();
    const staffPreview = user ? can(user.role, "content:read") : false;
    let query = supabase
      .from("projects")
      .select(
        "id, client_id, slug, name, short_summary, overview, problem, solution, key_features, platform_type, industry, technology_stack, database_note, integrations, duration, project_year, project_status, cover_image_url, video_url, impact_results, testimonial_quote, testimonial_person, testimonial_role, public_url, status, is_featured",
      )
      .eq("slug", slug);
    if (!staffPreview) {
      query = query.eq("status", "published").eq("is_active", true).eq("is_public", true);
    }
    const { data: rows, error } = await query.limit(1);
    if (error || !rows || rows.length === 0) return null;
    const row = rows[0];

    let clientName: string | null = null;
    if (row.client_id) {
      // RLS returns the client only when public_permission allows it.
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .eq("id", row.client_id)
        .limit(1);
      clientName = clients?.[0]?.name ?? null;
    }

    const { data: media } = await supabase
      .from("project_media")
      .select("id, url, alt_text, media_type, sort_order")
      .eq("project_id", row.id)
      .order("sort_order");

    const teaser = toProjectTeaser(row, clientName);
    const testimonialQuote = row.testimonial_quote ?? null;
    return {
      ...teaser,
      summary: row.short_summary ?? "",
      overview: row.overview,
      problem: row.problem,
      solution: row.solution,
      keyFeatures: asStringArray(row.key_features),
      technologyStack: asStringArray(row.technology_stack),
      databaseNote: row.database_note,
      integrations: asStringArray(row.integrations),
      duration: row.duration,
      projectYear: row.project_year,
      projectStatus: row.project_status,
      videoUrl: row.video_url,
      impactResults: asStringArray(row.impact_results),
      testimonial: testimonialQuote
        ? { quote: testimonialQuote, person: row.testimonial_person, role: row.testimonial_role }
        : null,
      publicUrl: row.public_url,
      gallery: (media ?? []).map((item) => ({
        id: item.id,
        url: item.url,
        alt: item.alt_text,
        type: item.media_type === "video" ? "video" : "image",
      })),
    };
  } catch {
    return null;
  }
});

/** Slugs for sitemap/generateStaticParams — CMS only, no fabricated rows. */
export async function getProjectSlugs(): Promise<string[]> {
  return (await getProjectSitemapEntries()).map((entry) => entry.slug);
}

/** Public project URLs with the CMS update time used by sitemap.xml. */
export async function getProjectSitemapEntries(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("projects")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("is_active", true)
      .eq("is_public", true);
    return (data ?? []).map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  } catch {
    return [];
  }
}

/**
 * Facets derived from the actual visible data ("where data exists") — the
 * filter bar only shows values that have at least one matching project.
 */
export function deriveFacets(projects: ProjectTeaser[]): {
  platforms: string[];
  industries: string[];
} {
  const platformSeen = new Set<string>();
  const industrySeen = new Set<string>();
  const platforms: string[] = [];
  const industries: string[] = [];
  for (const project of projects) {
    if (project.platformType && !platformSeen.has(project.platformType.toLowerCase())) {
      platformSeen.add(project.platformType.toLowerCase());
      platforms.push(project.platformType);
    }
    if (project.industry && !industrySeen.has(project.industry.toLowerCase())) {
      industrySeen.add(project.industry.toLowerCase());
      industries.push(project.industry);
    }
  }
  return {
    platforms: platforms.sort((a, b) => a.localeCompare(b)),
    industries: industries.sort((a, b) => a.localeCompare(b)),
  };
}

/** Href for a filter chip: sets the value, or removes it when already active. */
export function buildFilterHref(
  current: ProjectFilters,
  key: keyof ProjectFilters,
  value: string,
): string {
  const next: ProjectFilters = { ...current };
  if (current[key] === value) delete next[key];
  else next[key] = value;
  const params = new URLSearchParams();
  if (next.platform) params.set("platform", next.platform);
  if (next.industry) params.set("industry", next.industry);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

/** Apply active filters to the project list (case-insensitive). */
export function applyFilters(projects: ProjectTeaser[], filters: ProjectFilters): ProjectTeaser[] {
  return projects.filter((project) => {
    if (
      filters.platform &&
      (project.platformType ?? "").toLowerCase() !== filters.platform.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.industry &&
      (project.industry ?? "").toLowerCase() !== filters.industry.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}
