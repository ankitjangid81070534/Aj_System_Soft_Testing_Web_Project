import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publicClient: vi.fn(),
  serverClient: vi.fn(),
  adminClient: vi.fn(),
  user: vi.fn(),
}));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: true }));
vi.mock("@/lib/supabase/public", () => ({ createSupabasePublicClient: mocks.publicClient }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.serverClient }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.adminClient }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));

import { getPublishedPosts } from "./blog";

// Unit fixtures only: no record here is written to a database.
const published = {
  id: "unit-published",
  slug: "unit-published",
  title: "Published guide",
  excerpt: "Summary",
  content: "word ",
  cover_image_url: null,
  reading_minutes: 4,
  published_at: "2026-01-01",
  is_featured: false,
  status: "published",
  blog_categories: { name: "Planning" },
};

function listQuery(records: Record<string, unknown>[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: records, error: null }),
    range: vi.fn().mockResolvedValue({ data: records, error: null, count: records.length }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue(null);
});

describe("public blog index publication state (mocked requests)", () => {
  it("requests only published, active, undeleted posts", async () => {
    const query = listQuery([published]);
    mocks.publicClient.mockReturnValue({ from: vi.fn(() => query) });

    const result = await getPublishedPosts();

    expect(query.is).toHaveBeenCalledWith("deleted_at", null);
    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(result.rows.map((row) => row.slug)).toEqual([published.slug]);
  });

  it("keeps the category filter alongside the publication filters", async () => {
    const categoryQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [{ id: "unit-category" }] }),
    };
    const query = listQuery([published]);
    mocks.publicClient.mockReturnValue({
      from: vi.fn((table: string) => (table === "blog_categories" ? categoryQuery : query)),
    });

    await getPublishedPosts({ categorySlug: "planning" });

    expect(query.eq).toHaveBeenCalledWith("category_id", "unit-category");
    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
  });
});
