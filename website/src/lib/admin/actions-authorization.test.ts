import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(), client: vi.fn(), existing: vi.fn(), uniqueSlug: vi.fn(),
  query: { insert: vi.fn(), update: vi.fn(), select: vi.fn(), eq: vi.fn(), limit: vi.fn() },
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.client }));
vi.mock("@/lib/admin/crud", async () => {
  const { RESOURCES } = await import("./resources");
  return {
    getResourceConfig: (key: keyof typeof RESOURCES) => RESOURCES[key] ?? null,
    getResourceRow: mocks.existing, uniqueSlug: mocks.uniqueSlug, getAdjacentRowId: vi.fn(),
  };
});
import { upsertResourceAction, setResourceStatusAction } from "./actions";

function form(status: string, id?: string) {
  const data = new FormData();
  Object.entries({ __resource: "services", name: "Audit fixture", slug: "audit-fixture", short_description: "Unit-test fixture only", status }).forEach(([k, v]) => data.set(k, v));
  if (id) data.set("__id", id);
  return data;
}

describe("actual CMS save authorization (mocked adapters, no database writes)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role: "editor" });
    mocks.client.mockReturnValue({ from: () => mocks.query });
    for (const key of ["insert", "update", "select", "eq"] as const) mocks.query[key].mockReturnValue(mocks.query);
    mocks.query.limit.mockResolvedValue({ data: [{ id: "unit-test-row" }], error: null });
    mocks.existing.mockResolvedValue({ id: "unit-test-row", status: "draft", slug: "audit-fixture", deleted_at: null });
    mocks.uniqueSlug.mockResolvedValue("audit-fixture");
  });

  it.each([null, { id: "unit-test-actor", role: "client" }])("denies save before privileged access for %j", async user => {
    mocks.user.mockResolvedValue(user);
    expect((await upsertResourceAction({ ok: true }, form("draft"))).ok).toBe(false);
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("does not let editors publish by creating through the Save action", async () => {
    const result = await upsertResourceAction({ ok: true }, form("published"));
    expect(result).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(mocks.query.insert).not.toHaveBeenCalled();
  });
  it.each([["draft", "published"], ["published", "draft"]])("denies editor status change %s → %s through Save", async (current, next) => {
    mocks.existing.mockResolvedValue({ id: "unit-test-row", status: current, slug: "audit-fixture" });
    expect(await upsertResourceAction({ ok: true }, form(next, "unit-test-row"))).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(mocks.query.update).not.toHaveBeenCalled();
  });
  it("keeps editor draft creation working", async () => {
    expect((await upsertResourceAction({ ok: true }, form("draft"))).ok).toBe(true);
    expect(mocks.query.insert).toHaveBeenCalledWith(expect.objectContaining({ status: "draft" }));
  });
  it.each(["draft", "published"])("keeps content editing working when %s status is unchanged", async status => {
    mocks.existing.mockResolvedValue({ id: "unit-test-row", status, slug: "audit-fixture" });
    expect((await upsertResourceAction({ ok: true }, form(status, "unit-test-row"))).ok).toBe(true);
    expect(mocks.query.update).toHaveBeenCalledOnce();
    expect(mocks.query.update.mock.calls[0][0]).not.toHaveProperty("status");
  });
  it.each(["admin", "super_admin"])("allows %s to publish", async role => {
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role });
    expect((await upsertResourceAction({ ok: true }, form("published"))).ok).toBe(true);
    expect(mocks.query.insert).toHaveBeenCalledWith(expect.objectContaining({ status: "published" }));
    expect((await upsertResourceAction({ ok: true }, form("published", "unit-test-row"))).ok).toBe(true);
    expect(mocks.query.update).toHaveBeenCalledWith(expect.objectContaining({ status: "published" }));
  });
  it("does not return success for a write with no returned row", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      mocks.query.limit.mockResolvedValue({ data: [], error: null });
      expect((await upsertResourceAction({ ok: true }, form("draft"))).ok).toBe(false);
    } finally { log.mockRestore(); }
  });
  it("the separate publish action also denies editors", async () => {
    await setResourceStatusAction(form("published", "unit-test-row"));
    expect(mocks.query.update).not.toHaveBeenCalled();
  });
});
