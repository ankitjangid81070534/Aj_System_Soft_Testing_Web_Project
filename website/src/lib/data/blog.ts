import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { FALLBACK_POSTS, type FallbackPost } from "@/lib/data/blog-fallback";

function toFullPost(post: FallbackPost): BlogPostFull {
  return {
    ...post,
    tags: post.tags.map((name) => ({
      id: name,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    })),
  };
}

export type BlogPostTeaser = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  category: string | null;
  readingMinutes: number | null;
  publishedAt: string | null;
  isFeatured: boolean;
  status: string;
};

export type BlogTag = { id: string; name: string; slug: string };

export type BlogPostFull = BlogPostTeaser & {
  content: string;
  authorName: string;
  tags: BlogTag[];
};

const PER_PAGE = 9;

/** Organisation authorship fallback — never an invented person. */
const ORG_AUTHOR = "AJ System Soft Technology";

async function managedPostExists(slug?: string): Promise<boolean> {
  try {
    const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
    const admin = createSupabaseAdminLooseClient();
    let query = admin
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    if (slug) query = query.eq("slug", slug);
    const { count } = await query;
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Real author name resolved server-side; profiles are staff-only via RLS. */
export const getAuthorName = cache(async (profileId: string | null): Promise<string> => {
  if (!profileId || !isSupabaseConfigured) return ORG_AUTHOR;
  try {
    const { createSupabaseAdminLooseClient } = await import("@/lib/supabase/admin");
    const admin = createSupabaseAdminLooseClient();
    const { data } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", profileId)
      .limit(1);
    const row = data?.[0] as Record<string, unknown> | undefined;
    return (typeof row?.full_name === "string" && row.full_name) ||
      (typeof row?.email === "string" && row.email)
      ? String(row.full_name || row.email)
      : ORG_AUTHOR;
  } catch {
    return ORG_AUTHOR;
  }
});

export function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function teaserFromRow(row: Record<string, unknown>, categoryName: string | null): BlogPostTeaser {
  const content = typeof row.content === "string" ? row.content : "";
  const stored = typeof row.reading_minutes === "number" ? row.reading_minutes : null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: typeof row.excerpt === "string" ? row.excerpt : "",
    coverUrl: typeof row.cover_image_url === "string" ? row.cover_image_url : null,
    category: categoryName,
    readingMinutes: stored ?? (content ? estimateReadingMinutes(content) : null),
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    isFeatured: row.is_featured === true,
    status: typeof row.status === "string" ? row.status : "draft",
  };
}

/** Public posts list with optional category filter and pagination. */
export const getPublishedPosts = cache(
  async (
    options: { categorySlug?: string; page?: number } = {},
  ): Promise<{
    rows: BlogPostTeaser[];
    total: number;
    pageCount: number;
  }> => {
    if (!isSupabaseConfigured) {
      const filtered = options.categorySlug
        ? FALLBACK_POSTS.filter(
            (post) => (post.category ?? "").toLowerCase() === options.categorySlug?.toLowerCase(),
          )
        : FALLBACK_POSTS;
      const sorted = [...filtered].sort((a, b) =>
        (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
      );
      return { rows: sorted, total: sorted.length, pageCount: 1 };
    }
    try {
      const supabase = createSupabasePublicClient();
      let categoryId: string | null = null;
      if (options.categorySlug) {
        const { data: category } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", options.categorySlug)
          .limit(1);
        categoryId = category?.[0]?.id ?? "none";
      }

      let query = supabase
        .from("blog_posts")
        .select("*, blog_categories(name)", { count: "exact" })
        .is("deleted_at", null);
      if (categoryId) query = query.eq("category_id", categoryId);

      const page = Math.max(1, options.page ?? 1);
      const from = (page - 1) * PER_PAGE;
      const { data, error, count } = await query
        .order("published_at", { ascending: false, nullsFirst: false })
        .range(from, from + PER_PAGE - 1);
      if (error) return { rows: [], total: 0, pageCount: 1 };

      const rows = (data ?? []) as unknown as Record<string, unknown>[];
      if (rows.length === 0 && !options.categorySlug && !(await managedPostExists())) {
        const sorted = [...FALLBACK_POSTS].sort((a, b) =>
          (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
        );
        return { rows: sorted, total: sorted.length, pageCount: 1 };
      }
      return {
        rows: rows.map((row) => {
          const category = row.blog_categories as Record<string, unknown> | null;
          return teaserFromRow(row, category ? String(category.name) : null);
        }),
        total: count ?? 0,
        pageCount: Math.max(1, Math.ceil((count ?? 0) / PER_PAGE)),
      };
    } catch {
      return { rows: [], total: 0, pageCount: 1 };
    }
  },
);

export const getBlogCategories = cache(async (): Promise<{ slug: string; name: string }[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase.from("blog_categories").select("slug, name").order("name");
    return data ?? [];
  } catch {
    return [];
  }
});

/** Full post for the article page. Staff preview includes drafts (noindex). */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPostFull | null> => {
  const fallbackRow = FALLBACK_POSTS.find((post) => post.slug === slug) ?? null;
  const fallback = fallbackRow ? toFullPost(fallbackRow) : null;

  if (!isSupabaseConfigured) return fallback;
  try {
    const supabase = await createSupabaseServerClient();
    const user = await getCurrentUser();
    const staffPreview = user ? can(user.role, "content:read") : false;
    let query = supabase.from("blog_posts").select("*, blog_categories(name)").eq("slug", slug);
    if (!staffPreview) query = query.eq("status", "published").eq("is_active", true);
    const { data: rows, error } = await query.limit(1);
    if (error) return fallback;
    if (!rows || rows.length === 0) return (await managedPostExists(slug)) ? null : fallback;
    const row = rows[0] as unknown as Record<string, unknown>;

    const category = row.blog_categories as Record<string, unknown> | null;
    const base = teaserFromRow(row, category ? String(category.name) : null);
    base.status = typeof row.status === "string" ? row.status : "draft";

    const { data: tagRows } = await supabase
      .from("blog_post_tags")
      .select("blog_tags(id, name, slug)")
      .eq("post_id", String(row.id));
    const tags = ((tagRows ?? []) as unknown as Record<string, unknown>[])
      .map((entry) => entry.blog_tags as Record<string, unknown> | null)
      .filter((tag): tag is Record<string, unknown> => tag !== null)
      .map((tag) => ({
        id: String(tag.id),
        name: String(tag.name),
        slug: String(tag.slug),
      }));

    const authorName = await getAuthorName(
      typeof row.author_id === "string"
        ? row.author_id
        : typeof row.created_by === "string"
          ? row.created_by
          : null,
    );

    return {
      ...base,
      content: typeof row.content === "string" ? row.content : "",
      authorName,
      tags,
    };
  } catch {
    return fallback;
  }
});

export async function getPostSlugs(): Promise<string[]> {
  return (await getPostSitemapEntries()).map((entry) => entry.slug);
}

/** Published article URLs, including the genuine built-in guides. */
export async function getPostSitemapEntries(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const fallback = FALLBACK_POSTS.map((post) => ({
    slug: post.slug,
    updatedAt: post.publishedAt ?? null,
  }));
  if (!isSupabaseConfigured) return fallback;
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("is_active", true);
    if (error) return fallback;
    if (!data || data.length === 0) return (await managedPostExists()) ? [] : fallback;
    return data.map((row) => ({
        slug: String(row.slug),
        updatedAt: row.updated_at,
      }));
  } catch {
    return fallback;
  }
}

/** Related posts: same category first, then most recent others. */
export function pickRelatedPosts(
  posts: BlogPostTeaser[],
  current: { slug: string; category: string | null },
  limit = 3,
): BlogPostTeaser[] {
  const others = posts.filter((post) => post.slug !== current.slug);
  const sameCategory = current.category
    ? others.filter((post) => post.category === current.category)
    : [];
  const rest = others.filter((post) => !sameCategory.includes(post));
  return [...sameCategory, ...rest].slice(0, limit);
}
