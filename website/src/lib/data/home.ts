import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import {
  toProjectTeaser,
  toServiceTeaser,
  toTestimonialTeaser,
  type ProjectTeaser,
  type ServiceTeaser,
  type TeamTeaser,
  type TestimonialTeaser,
} from "@/lib/data/mappers";
import { FALLBACK_SERVICES as ALL_FALLBACK_SERVICES } from "@/lib/data/services-fallback";
import { getPublishedTeam } from "@/lib/data/team";
import { getPublishedPosts, type BlogPostTeaser } from "@/lib/data/blog";

/**
 * Home-page content access. All queries go through the RLS-bound server
 * client, so only published + active + public rows can ever come back.
 *
 * Graceful behaviour: when Supabase is not configured yet (or a query fails /
 * returns nothing) the page falls back to real capability copy for services
 * and simply hides the optional sections (projects, team, testimonials).
 * No placeholder facts are ever invented.
 */

const HOME_FALLBACK_SLUGS = [
  "custom-software-development",
  "web-application-development",
  "saas-development",
  "android-app-development",
  "erp-business-software",
  "hospital-clinic-software",
];

export const FALLBACK_SERVICES: ServiceTeaser[] = HOME_FALLBACK_SLUGS.map((slug) => {
  const service = ALL_FALLBACK_SERVICES.find((item) => item.slug === slug);
  if (!service) throw new Error(`Missing fallback service: ${slug}`);
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortDescription: service.shortDescription,
    category: service.category,
    icon: service.icon,
  };
});

async function fetchServices(): Promise<ServiceTeaser[]> {
  if (!isSupabaseConfigured) return FALLBACK_SERVICES;
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, slug, name, short_description, category, icon")
      .eq("status", "published")
      .eq("is_active", true)
      .order("sort_order")
      .limit(6);
    if (error) return FALLBACK_SERVICES;
    if (!data || data.length === 0) {
      const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
      const admin = createSupabaseAdminLooseClient();
      const { count } = await admin
        .from("services")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);
      return (count ?? 0) > 0 ? [] : FALLBACK_SERVICES;
    }
    return data.map(toServiceTeaser);
  } catch {
    return FALLBACK_SERVICES;
  }
}

async function fetchProjects(limit = 6): Promise<ProjectTeaser[]> {
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
      .limit(limit);
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
}

async function fetchTestimonials(): Promise<TestimonialTeaser[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(
        "id, quote, author_name, author_role, author_company, rating, title, project_name, admin_response",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .eq("is_public", true)
      .eq("is_verified", true)
      .order("sort_order")
      .limit(3);
    if (error || !data || data.length === 0) return [];
    return data.map(toTestimonialTeaser);
  } catch {
    return [];
  }
}

export type HomeContent = {
  services: ServiceTeaser[];
  projects: ProjectTeaser[];
  team: TeamTeaser[];
  testimonials: TestimonialTeaser[];
  posts: BlogPostTeaser[];
};

/** Recent public projects, also used for service-page "related work". */
export async function getRecentPublicProjects(limit = 6): Promise<ProjectTeaser[]> {
  return fetchProjects(limit);
}

export async function getHomeContent(): Promise<HomeContent> {
  const [services, projects, team, testimonials, postsResult] = await Promise.all([
    fetchServices(),
    fetchProjects(),
    getPublishedTeam(8),
    fetchTestimonials(),
    getPublishedPosts({ page: 1 }),
  ]);
  return {
    services,
    projects,
    team,
    testimonials,
    posts: postsResult.rows.slice(0, 3),
  };
}
