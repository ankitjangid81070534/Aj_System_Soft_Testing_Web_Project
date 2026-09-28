import type { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/admin/resources";
import { FALLBACK_SERVICES } from "@/lib/data/services-fallback";
import { FALLBACK_POSTS } from "@/lib/data/blog-fallback";
import { NAV_LINKS } from "@/lib/navigation";
import { getContactHubActions } from "@/lib/contact-hub";

type Admin = ReturnType<typeof createSupabaseAdminLooseClient>;
type Row = Record<string, unknown>;

/**
 * Copies the built-in content the public site shows while a module is empty
 * into the database so the admin can see and edit it. Rows are only added when
 * missing (matched by slug) — existing data is never changed. Each table gets
 * ONE bulk insert, so the site never switches to a half-imported set.
 */
async function missing(admin: Admin, table: string, key: string, rows: Row[]): Promise<Row[]> {
  const { data, error } = await admin.from(table).select(key);
  if (error) throw error;
  const existing = new Set((data as unknown as Row[]).map((row) => String(row[key])));
  return rows.filter((row) => !existing.has(String(row[key])));
}

async function insertAll(admin: Admin, table: string, rows: Row[]): Promise<Row[]> {
  if (rows.length === 0) return [];
  const { data, error } = await admin.from(table).insert(rows).select("*");
  if (error) throw error;
  return data as Row[];
}

async function importServices(admin: Admin, userId: string): Promise<number> {
  const rows = await missing(admin, "services", "slug", FALLBACK_SERVICES.map((service, index) => ({
    slug: service.slug,
    name: service.name,
    category: service.category,
    icon: service.icon,
    short_description: service.shortDescription,
    long_description: service.longDescription,
    problems: service.problems,
    features: service.features,
    deliverables: service.deliverables,
    platforms: service.platforms,
    industries: service.industries,
    process_steps: service.processSteps,
    seo_title: service.seoTitle,
    seo_description: service.seoDescription,
    sort_order: index + 1,
    is_active: true,
    status: "published",
    created_by: userId,
    updated_by: userId,
  })));
  const inserted = await insertAll(admin, "services", rows);
  const faqs = inserted.flatMap((row) =>
    (FALLBACK_SERVICES.find((service) => service.slug === row.slug)?.faqs ?? []).map((faq, index) => ({
      service_id: row.id, question: faq.question, answer: faq.answer, sort_order: index + 1,
    })));
  await insertAll(admin, "service_faqs", faqs);
  return inserted.length;
}

async function ensureBySlug(admin: Admin, table: string, names: string[]): Promise<Map<string, string>> {
  const unique = [...new Map(names.map((name) => [slugify(name), name])).entries()];
  await insertAll(admin, table, await missing(admin, table, "slug", unique.map(([slug, name]) => ({ slug, name }))));
  const { data, error } = await admin.from(table).select("id, slug");
  if (error) throw error;
  return new Map((data as unknown as Row[]).map((row) => [String(row.slug), String(row.id)]));
}

async function importPosts(admin: Admin, userId: string): Promise<number> {
  const categories = await ensureBySlug(admin, "blog_categories",
    FALLBACK_POSTS.flatMap((post) => (post.category ? [post.category] : [])));
  const tags = await ensureBySlug(admin, "blog_tags", FALLBACK_POSTS.flatMap((post) => post.tags));
  const rows = await missing(admin, "blog_posts", "slug", FALLBACK_POSTS.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.coverUrl ?? null,
    category_id: post.category ? categories.get(slugify(post.category)) ?? null : null,
    reading_minutes: post.readingMinutes,
    published_at: post.publishedAt,
    is_featured: post.isFeatured,
    is_active: true,
    status: "published",
    created_by: userId,
    updated_by: userId,
  })));
  const inserted = await insertAll(admin, "blog_posts", rows);
  const links = inserted.flatMap((row) =>
    (FALLBACK_POSTS.find((post) => post.slug === row.slug)?.tags ?? []).flatMap((name) => {
      const tagId = tags.get(slugify(name));
      return tagId ? [{ post_id: row.id, tag_id: tagId }] : [];
    }));
  await insertAll(admin, "blog_post_tags", links);
  return inserted.length;
}

async function importNavigation(admin: Admin): Promise<number> {
  const { data, error } = await admin.from("navigation_items").select("id").eq("location", "header");
  if (error) throw error;
  // The site only uses its built-in header menu while no header item exists.
  if ((data ?? []).length > 0) return 0;
  return (await insertAll(admin, "navigation_items", NAV_LINKS.map((link, index) => ({
    location: "header", label: link.label, url: link.href, sort_order: index + 1, is_active: true,
  })))).length;
}

const HUB_ICON_BY_KIND = {
  whatsapp: "whatsapp", phone: "phone", email: "mail", project: "link", quote: "file", contact: "calendar",
} as const;

/** Built-in "Let's talk" entries exactly as the panel shows them today. */
async function builtInHubLinkRows(): Promise<Row[]> {
  // Loaded lazily: the settings reader is cached and pulls in server-only modules.
  const { getSiteSettings } = await import("@/lib/data/settings");
  const rows: Row[] = getContactHubActions(await getSiteSettings()).map((action) => ({
    label: action.label, url: action.href, icon: HUB_ICON_BY_KIND[action.kind],
  }));
  const review = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim();
  if (review) rows.push({ label: "Write a Google review", url: review, icon: "star" });
  return rows.map((row, index) => ({ ...row, open_new_tab: true, is_active: true, sort_order: index + 1 }));
}

/**
 * Seeds the built-in links once, while the table is still empty. From then on
 * the table fully controls the panel (see ContactHub `showBuiltIns`).
 */
export async function seedHubLinksIfEmpty(admin: Admin): Promise<number> {
  const { count, error } = await admin.from("contact_hub_links").select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return 0;
  return (await insertAll(admin, "contact_hub_links", await builtInHubLinkRows())).length;
}

export const WEBSITE_IMPORTERS: Record<string, (admin: Admin, userId: string) => Promise<number>> = {
  services: importServices,
  posts: importPosts,
  navigation: (admin) => importNavigation(admin),
  "hub-links": (admin) => seedHubLinksIfEmpty(admin),
};
