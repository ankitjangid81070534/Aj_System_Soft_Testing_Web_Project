import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  user: vi.fn(), client: vi.fn(), query: { select: vi.fn(), update: vi.fn(), eq: vi.fn(), limit: vi.fn() },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.client }));
import { saveSectionAction, setSectionStatusAction } from "./builder-actions";
const id = "00000000-0000-4000-8000-000000000001";
function form(status: string) {
  const data = new FormData();
  Object.entries({ id, status, content: "{}", variant: "default", accent: "brand", sort_order: "0" }).forEach(([k,v]) => data.set(k,v));
  return data;
}
describe("home builder publication authorization (mocked adapters)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role: "editor" });
    mocks.client.mockReturnValue({ from: () => mocks.query });
    for (const k of ["select", "update", "eq"] as const) mocks.query[k].mockReturnValue(mocks.query);
    mocks.query.limit.mockResolvedValue({ data: [{ id, section_type: "hero", status: "draft" }], error: null });
  });
  it("denies editor publication through the dedicated status action", async () => {
    await setSectionStatusAction(form("published"));
    expect(mocks.client).not.toHaveBeenCalled();
    expect(mocks.query.update).not.toHaveBeenCalled();
  });
  it.each([["draft","published"],["published","draft"]])("denies editor Save transition %s → %s", async (current, next) => {
    mocks.query.limit.mockResolvedValue({ data: [{ id, section_type: "hero", status: current }], error: null });
    await expect(saveSectionAction(form(next))).rejects.toThrow("error=");
    expect(mocks.query.update).not.toHaveBeenCalled();
  });
  it.each(["draft", "published"])("allows editor content edits with unchanged %s status", async status => {
    mocks.query.limit.mockResolvedValue({ data: [{ id, section_type: "hero", status }], error: null });
    await expect(saveSectionAction(form(status))).rejects.toThrow("notice=");
    expect(mocks.query.update).toHaveBeenCalledOnce();
    expect(mocks.query.update.mock.calls[0][0]).not.toHaveProperty("status");
  });
  it.each(["admin", "super_admin"])("allows %s publication", async role => {
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role });
    await setSectionStatusAction(form("published"));
    expect(mocks.query.update).toHaveBeenCalledWith(expect.objectContaining({ status: "published" }));
    await expect(saveSectionAction(form("published"))).rejects.toThrow("notice=");
    expect(mocks.query.update).toHaveBeenLastCalledWith(expect.objectContaining({ status: "published" }));
  });
});
