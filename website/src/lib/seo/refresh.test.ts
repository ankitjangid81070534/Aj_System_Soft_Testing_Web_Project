import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(), user: vi.fn(), client: vi.fn(),
  query: { insert: vi.fn(), select: vi.fn(), limit: vi.fn() },
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh, updateTag: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.client }));
vi.mock("@/lib/admin/crud", async () => {
  const { RESOURCES } = await import("@/lib/admin/resources");
  return {
    getResourceConfig: (key: keyof typeof RESOURCES) => RESOURCES[key] ?? null,
    getResourceRow: vi.fn(), uniqueSlug: vi.fn(), getAdjacentRowId: vi.fn(),
  };
});
import { upsertResourceAction } from "@/lib/admin/actions";

// Real action; mocked identity/database/cache adapters, no hosted mutation.
describe("SEO metadata save refreshes all affected output", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.mockResolvedValue({ id: "unit-admin", role: "admin" });
    mocks.client.mockReturnValue({ from: () => mocks.query });
    mocks.query.insert.mockReturnValue(mocks.query);
    mocks.query.select.mockReturnValue(mocks.query);
    mocks.query.limit.mockResolvedValue({ data: [{ id: "unit-seo" }], error: null });
  });
  it("refreshes the sitemap and every static public metadata route after success", async () => {
    const form = new FormData();
    form.set("__resource", "seo");
    form.set("path", "/privacy");
    form.set("no_index", "on");
    expect(await upsertResourceAction({ ok: null }, form)).toMatchObject({ ok: true });
    for (const route of ["/sitemap.xml", "/", "/about", "/contact", "/services", "/projects", "/reviews", "/blog", "/team", "/request-quote", "/ai-methods", "/privacy", "/terms", "/service-agreement"])
      expect(mocks.refresh).toHaveBeenCalledWith(route);
  });
  it("never accesses the database or invalidates output for an unauthenticated save", async () => {
    mocks.user.mockResolvedValue(null);
    const form = new FormData();
    form.set("__resource", "seo");
    form.set("path", "/privacy");
    expect(await upsertResourceAction({ ok: null }, form)).toMatchObject({ ok: false });
    expect(mocks.client).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
