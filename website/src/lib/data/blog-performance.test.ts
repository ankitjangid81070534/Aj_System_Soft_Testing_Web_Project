import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publicClient: vi.fn(), serverClient: vi.fn(), adminClient: vi.fn(), user: vi.fn(),
}));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: true }));
vi.mock("@/lib/supabase/public", () => ({ createSupabasePublicClient: mocks.publicClient }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.serverClient }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.adminClient }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));

import { getPostBySlug, getPublishedPosts } from "./blog";

// Unit fixtures only: these records are never written to a database or rendered in the app.
const row = {
  id: "unit-post", slug: "unit-guide", title: "Unit guide", excerpt: "Unit summary",
  content: "word ".repeat(600), cover_image_url: null, reading_minutes: null,
  published_at: "2026-01-01", is_featured: true, status: "published",
  author_id: "unit-author", created_by: "unit-creator", blog_categories: { name: "Planning" },
};
function postQuery(records: Record<string, unknown>[] = [row]) {
  return {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: records, error: null }),
    range: vi.fn().mockResolvedValue({ data: records, error: null, count: records.length }),
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => { vi.clearAllMocks(); mocks.user.mockResolvedValue(null); });

describe("blog performance without changing content or access (mocked requests)", () => {
  it("selects only teaser inputs while preserving reading-time fallback and pagination", async () => {
    const query = postQuery();
    mocks.publicClient.mockReturnValue({ from: vi.fn(() => query) });
    const result = await getPublishedPosts({ page: 2 });
    const columns = query.select.mock.calls[0][0] as string;
    expect(columns).not.toContain("*");
    expect(columns).toContain("content");
    expect(columns).toContain("blog_categories(name)");
    expect(columns).not.toMatch(/seo_title|updated_by|author_id|created_at/);
    expect(query.select.mock.calls[0][1]).toEqual({ count: "exact" });
    expect(query.is).toHaveBeenCalledWith("deleted_at", null);
    expect(query.range).toHaveBeenCalledWith(9, 17);
    expect(result.rows[0]).toMatchObject({ slug: row.slug, excerpt: row.excerpt, category: "Planning", readingMinutes: 3, isFeatured: true });
    expect(result).toMatchObject({ total: 1, pageCount: 1 });
  });

  it("preserves stored reading minutes instead of recalculating them", async () => {
    mocks.publicClient.mockReturnValue({ from: vi.fn(() => postQuery([{ ...row, reading_minutes: 7 }])) });
    expect((await getPublishedPosts()).rows[0].readingMinutes).toBe(7);
  });

  it("starts author and tag reads together and retains anonymous publication filters", async () => {
    const tags = deferred<{ data: { blog_tags: { id: string; name: string; slug: string } }[] }>();
    const author = deferred<{ data: { full_name: string }[] }>();
    const query = postQuery();
    const tagQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn(() => tags.promise) };
    const authorQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), limit: vi.fn(() => author.promise) };
    mocks.serverClient.mockResolvedValue({ from: vi.fn((table) => table === "blog_posts" ? query : tagQuery) });
    mocks.adminClient.mockReturnValue({ from: vi.fn(() => authorQuery) });
    const pending = getPostBySlug(row.slug);
    // Neither response is released until both independent requests have started.
    await vi.waitFor(() => {
      expect(tagQuery.eq).toHaveBeenCalledWith("post_id", row.id);
      expect(authorQuery.limit).toHaveBeenCalledWith(1);
    });
    expect(authorQuery.eq).toHaveBeenCalledWith("id", row.author_id);
    tags.resolve({ data: [{ blog_tags: { id: "unit-tag", name: "Planning", slug: "planning" } }] });
    author.resolve({ data: [{ full_name: "Unit Author" }] });
    const post = await pending;
    expect(post).toMatchObject({ content: row.content, authorName: "Unit Author", tags: [{ id: "unit-tag", name: "Planning", slug: "planning" }] });
    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    const columns = query.select.mock.calls[0][0] as string;
    expect(columns).not.toContain("*");
    expect(columns).toContain("author_id, created_by");
  });

  it("retains staff draft preview and created-by authorship fallback", async () => {
    mocks.user.mockResolvedValue({ role: "editor" });
    const query = postQuery([{ ...row, author_id: null, status: "draft" }]);
    const authorQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue({ data: [{ full_name: "Unit Creator" }] }) };
    mocks.serverClient.mockResolvedValue({ from: vi.fn((table) => table === "blog_posts" ? query : { select: () => ({ eq: async () => ({ data: [] }) }) }) });
    mocks.adminClient.mockReturnValue({ from: vi.fn(() => authorQuery) });
    expect(await getPostBySlug(row.slug)).toMatchObject({ status: "draft", authorName: "Unit Creator", tags: [] });
    expect(query.eq.mock.calls).toEqual([["slug", row.slug]]);
    expect(authorQuery.eq).toHaveBeenCalledWith("id", row.created_by);
  });

  it("retains organization authorship and empty tags when optional lookups fail", async () => {
    const query = postQuery();
    mocks.serverClient.mockResolvedValue({ from: vi.fn((table) => table === "blog_posts" ? query : { select: () => ({ eq: async () => ({ data: null, error: { message: "unit failure" } }) }) }) });
    mocks.adminClient.mockImplementation(() => { throw new Error("unit failure"); });
    expect(await getPostBySlug(row.slug)).toMatchObject({ authorName: "AJ System Soft Technology", tags: [], content: row.content });
  });
});
