import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { asStringArray } from "@/lib/data/jsonb";
import { FALLBACK_SERVICES } from "@/lib/data/services-fallback";

export type ServiceFaq = { question: string; answer: string };

export type ServiceDetail = {
  id: string;
  slug: string;
  name: string;
  status: string;
  category: string;
  icon: string | null;
  shortDescription: string;
  longDescription: string | null;
  problems: string[];
  deliverables: string[];
  platforms: string[];
  features: string[];
  processSteps: string[];
  industries: string[];
  faqs: ServiceFaq[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type ServiceCardModel = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  icon: string | null;
};

const SERVICE_COLUMNS =
  "id, slug, name, category, icon, short_description, long_description, problems, deliverables, platforms, features, process_steps, industries, status, is_active";

async function managedServiceExists(slug?: string): Promise<boolean> {
  try {
    const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
    const admin = createSupabaseAdminLooseClient();
    let query = admin
      .from("services")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    if (slug) query = query.eq("slug", slug);
    const { count } = await query;
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Pure row→model mapper (jsonb fields arrive as unknown arrays).
 */
export function toServiceDetail(
  row: {
    id: string;
    slug: string;
    name: string;
    status: string;
    category: string | null;
    icon: string | null;
    short_description: string | null;
    long_description: string | null;
    problems: unknown;
    deliverables: unknown;
    platforms: unknown;
    features: unknown;
    process_steps: unknown;
    industries: unknown;
  },
  faqs: ServiceFaq[],
): ServiceDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    category: row.category ?? "Services",
    icon: row.icon,
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description,
    problems: asStringArray(row.problems),
    deliverables: asStringArray(row.deliverables),
    platforms: asStringArray(row.platforms),
    features: asStringArray(row.features),
    processSteps: asStringArray(row.process_steps),
    industries: asStringArray(row.industries),
    faqs,
    seoTitle: null,
    seoDescription: null,
  };
}

async function fetchFaqMap(): Promise<Map<string, ServiceFaq[]>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("service_faqs")
    .select("service_id, question, answer, sort_order")
    .order("sort_order");
  const map = new Map<string, ServiceFaq[]>();
  for (const row of data ?? []) {
    const list = map.get(row.service_id) ?? [];
    list.push({ question: row.question, answer: row.answer });
    map.set(row.service_id, list);
  }
  return map;
}

/** All services for the index page: CMS-published first, fallback otherwise. */
export async function getServicesIndex(): Promise<ServiceCardModel[]> {
  if (!isSupabaseConfigured) {
    return FALLBACK_SERVICES.map(({ id, slug, name, shortDescription, category, icon }) => ({
      id,
      slug,
      name,
      shortDescription,
      category,
      icon,
    }));
  }
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, slug, name, category, icon, short_description")
      .eq("status", "published")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      return FALLBACK_SERVICES.map(({ id, slug, name, shortDescription, category, icon }) => ({
        id,
        slug,
        name,
        shortDescription,
        category,
        icon,
      }));
    }
    if (!data || data.length === 0) {
      if (await managedServiceExists()) return [];
      return FALLBACK_SERVICES.map(({ id, slug, name, shortDescription, category, icon }) => ({
        id,
        slug,
        name,
        shortDescription,
        category,
        icon,
      }));
    }
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description ?? "",
      category: row.category ?? "Services",
      icon: row.icon,
    }));
  } catch {
    return FALLBACK_SERVICES.map(({ id, slug, name, shortDescription, category, icon }) => ({
      id,
      slug,
      name,
      shortDescription,
      category,
      icon,
    }));
  }
}

/** One service by slug, with its FAQs. Falls back to default content. */
// cache() dedupes the metadata + page double fetch for the same request.
export const getServiceBySlug = cache(async (slug: string): Promise<ServiceDetail | null> => {
  const fallback = FALLBACK_SERVICES.find((service) => service.slug === slug) ?? null;

  if (!isSupabaseConfigured) return fallback;
  try {
    const supabase = await createSupabaseServerClient();
    // Staff preview: editors/admins can open draft services on the public URL
    // (pages then render them with noindex metadata).
    const user = await getCurrentUser();
    const staffPreview = user ? can(user.role, "content:read") : false;
    let query = supabase.from("services").select(SERVICE_COLUMNS).eq("slug", slug);
    if (!staffPreview) query = query.eq("status", "published").eq("is_active", true);
    const { data: rows, error } = await query.limit(1);
    if (error) return fallback;
    if (!rows || rows.length === 0) {
      return (await managedServiceExists(slug)) ? null : fallback;
    }

    const faqMap = await fetchFaqMap();
    return toServiceDetail(rows[0], faqMap.get(rows[0].id) ?? []);
  } catch {
    return fallback;
  }
});

/** Slugs for sitemap/params: CMS slugs merged with fallback slugs. */
export async function getServiceSlugs(): Promise<string[]> {
  return (await getServiceSitemapEntries()).map((entry) => entry.slug);
}

export type ContentSitemapEntry = { slug: string; updatedAt: string | null };

/** Published service URLs with real CMS timestamps when available. */
export async function getServiceSitemapEntries(): Promise<ContentSitemapEntry[]> {
  const fallback = FALLBACK_SERVICES.map((service) => ({
    slug: service.slug,
    updatedAt: null,
  }));
  if (!isSupabaseConfigured) return fallback;
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("is_active", true);
    if (error) return fallback;
    if (!data || data.length === 0) return (await managedServiceExists()) ? [] : fallback;
    return data.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  } catch {
    return fallback;
  }
}

/** Sibling services for internal linking: same category first, then the rest. */
export function pickRelatedServices(
  all: ServiceCardModel[],
  currentSlug: string,
  limit = 3,
): ServiceCardModel[] {
  const current = all.find((service) => service.slug === currentSlug);
  const others = all.filter((service) => service.slug !== currentSlug);
  if (!current) return others.slice(0, limit);
  const sameCategory = others.filter((service) => service.category === current.category);
  const rest = others.filter((service) => service.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * Choose public projects relevant to a service: industry or platform overlap
 * first, then most recent. Pure function — unit-testable.
 */
export function pickRelevantProjectIds<
  T extends { id: string; industry: string | null; platformType: string | null },
>(projects: T[], service: { industries: string[]; platforms: string[] }, limit = 3): string[] {
  const scored = projects.map((project, index) => {
    // Local copies so narrowing survives inside the closures below.
    const industry = project.industry;
    const platform = project.platformType;
    const industryMatch =
      industry !== null &&
      service.industries.some(
        (candidate) =>
          candidate.toLowerCase() === industry.toLowerCase() ||
          industry.toLowerCase().includes(candidate.toLowerCase()) ||
          candidate.toLowerCase().includes(industry.toLowerCase()),
      );
    const platformMatch =
      platform !== null &&
      service.platforms.some(
        (candidate) =>
          platform.toLowerCase().includes(candidate.toLowerCase()) ||
          candidate.toLowerCase().includes(platform.toLowerCase()),
      );
    const score = (industryMatch ? 2 : 0) + (platformMatch ? 1 : 0) - index * 0.01;
    return { id: project.id, score };
  });
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.id);
}
