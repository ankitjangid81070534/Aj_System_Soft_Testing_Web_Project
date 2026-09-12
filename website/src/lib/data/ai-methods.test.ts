import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn() };
  return { configured: true, query, from: vi.fn() };
});
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("@/lib/env", () => ({ get isSupabaseConfigured() { return mocks.configured; } }));
vi.mock("@/lib/supabase/public", () => ({
  createSupabasePublicClient: () => ({ from: mocks.from }),
}));

import { getPublicAiMethods } from "./ai-methods";

describe("public AI methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.configured = true;
    mocks.from.mockReturnValue(mocks.query);
    mocks.query.select.mockReturnValue(mocks.query);
    mocks.query.eq.mockReturnValue(mocks.query);
    mocks.query.order.mockResolvedValue({ data: [], error: null });
  });

  it("renders an honest empty state without Supabase", async () => {
    mocks.configured = false;
    expect(await getPublicAiMethods()).toEqual([]);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("requests active resources in CMS order and preserves their content", async () => {
    const rows = [{ id: "test-resource", title: "Test resource", url: "https://example.com/resource", description: "Test description" }];
    mocks.query.order.mockResolvedValue({ data: rows, error: null });
    expect(await getPublicAiMethods()).toEqual(rows);
    expect(mocks.from).toHaveBeenCalledWith("ai_methods");
    expect(mocks.query.eq).toHaveBeenCalledWith("is_active", true);
    expect(mocks.query.order).toHaveBeenCalledWith("sort_order", { ascending: true });
  });

  it("does not render unsafe or invalid resource links", async () => {
    mocks.query.order.mockResolvedValue({
      data: ["javascript:alert(1)", "http://example.com", "not a URL"].map(url => ({ id: url, title: "Test resource", url, description: null })), error: null,
    });
    expect(await getPublicAiMethods()).toEqual([]);
  });

  it("keeps the page available if the table or service is unavailable", async () => {
    mocks.query.order.mockResolvedValue({ data: null, error: { message: "Table unavailable" } });
    expect(await getPublicAiMethods()).toEqual([]);
    mocks.query.order.mockRejectedValue(new Error("Network unavailable"));
    expect(await getPublicAiMethods()).toEqual([]);
  });
});
