import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(), client: vi.fn(), existing: vi.fn(), adjacent: vi.fn(), refresh: vi.fn(),
  query: { update: vi.fn(), delete: vi.fn(), select: vi.fn(), eq: vi.fn(), limit: vi.fn() },
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh, updateTag: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.client }));
vi.mock("@/lib/admin/crud", async () => {
  const { RESOURCES } = await import("./resources");
  return {
    getResourceConfig: (key: keyof typeof RESOURCES) => RESOURCES[key] ?? null,
    getResourceRow: mocks.existing, getAdjacentRowId: mocks.adjacent, uniqueSlug: vi.fn(),
  };
});
import {
  setResourceStatusAction, toggleResourceActiveAction, deleteResourceAction,
  restoreResourceAction, reorderResourceAction,
} from "./actions";

const actions = [
  ["publish", setResourceStatusAction], ["activate", toggleResourceActiveAction],
  ["delete", deleteResourceAction], ["restore", restoreResourceAction],
  ["reorder", reorderResourceAction],
] as const;
const request = () => {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    __resource: "services", __id: "unit-row", status: "published", direction: "down",
  })) data.set(key, value);
  return data;
};
const saved = { data: [{ id: "unit-row", sort_order: 2 }], error: null };
const failed = { data: [], error: { code: "42501", message: "Unit-only denied write" } };

// Executes the real actions against mocked adapters; NOT hosted persistence evidence.
describe("Phase 9 generic quick-action outcomes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.user.mockResolvedValue({ id: "unit-actor", role: "admin" });
    mocks.client.mockReturnValue({ from: () => mocks.query });
    for (const key of ["update", "delete", "select", "eq"] as const)
      mocks.query[key].mockReturnValue(mocks.query);
    mocks.query.limit.mockResolvedValue(saved);
    mocks.existing.mockResolvedValue({ id: "unit-row", sort_order: 1, slug: "unit-row", status: "draft" });
    mocks.adjacent.mockResolvedValue("unit-neighbor");
  });
  afterEach(() => vi.restoreAllMocks());

  describe.each(actions)("%s", (_label, action) => {
    it("rejects invalid input before privileged access", async () => {
      expect(await action(new FormData())).toMatchObject({ ok: false, code: "VALIDATION_ERROR" });
      expect(mocks.client).not.toHaveBeenCalled();
    });
    it.each([null, { id: "unit-client", role: "client" }])("denies unauthorized actor %j", async user => {
      mocks.user.mockResolvedValue(user);
      expect(await action(request())).toMatchObject({ ok: false });
      expect(mocks.client).not.toHaveBeenCalled();
      expect(mocks.refresh).not.toHaveBeenCalled();
    });
    it("reports an unavailable record without a write", async () => {
      mocks.existing.mockResolvedValue(null);
      expect(await action(request())).toMatchObject({ ok: false, code: "CONFLICT" });
      expect(mocks.query.update).not.toHaveBeenCalled();
    });
    it.each([failed, { data: [], error: null }])("never reports success when no mutation row returns: %j", async result => {
      mocks.query.limit.mockResolvedValue(result);
      expect(await action(request())).toMatchObject({ ok: false });
      expect(mocks.refresh).not.toHaveBeenCalled();
    });
    it("returns explicit success and refreshes after a returned mutation row", async () => {
      expect(await action(request())).toMatchObject({ ok: true, message: expect.any(String) });
      expect(mocks.query.update).toHaveBeenCalled();
      expect(mocks.refresh).toHaveBeenCalledWith("/ajadmin/c/services");
    });
  });

  it("still denies editor publication", async () => {
    mocks.user.mockResolvedValue({ id: "unit-editor", role: "editor" });
    expect(await setResourceStatusAction(request())).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("does not write or refresh at a confirmed reorder boundary", async () => {
    mocks.adjacent.mockResolvedValue(null);
    expect(await reorderResourceAction(request())).toMatchObject({ ok: true, message: expect.stringContaining("No change made") });
    expect(mocks.query.update).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
  it("does not report a successful boundary when the lookup rejects", async () => {
    mocks.adjacent.mockRejectedValue(new Error("Order unavailable"));
    await expect(reorderResourceAction(request())).rejects.toThrow("Order unavailable");
    expect(mocks.query.update).not.toHaveBeenCalled();
  });
  it("stops when the first reorder write fails", async () => {
    mocks.query.limit.mockResolvedValueOnce(saved).mockResolvedValueOnce(failed);
    expect(await reorderResourceAction(request())).toMatchObject({ ok: false });
    expect(mocks.query.update).toHaveBeenCalledTimes(1);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
  it("compensates the first row and reports failure if the second reorder write fails", async () => {
    mocks.query.limit.mockResolvedValueOnce(saved).mockResolvedValueOnce(saved).mockResolvedValueOnce(failed);
    expect(await reorderResourceAction(request())).toMatchObject({ ok: false });
    expect(mocks.query.update).toHaveBeenCalledTimes(3);
    expect(mocks.query.update).toHaveBeenLastCalledWith(expect.objectContaining({ sort_order: 1 }));
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
