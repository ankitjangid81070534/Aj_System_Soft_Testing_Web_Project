import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  client: vi.fn(),
  query: { select: vi.fn(), is: vi.fn(), order: vi.fn() },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: mocks.client }));
import { getAdjacentRowId } from "./crud";
import { RESOURCES } from "./resources";

// Adapter-level fixtures only; no hosted records or authenticated UI are used.
describe("admin reorder lookup does not disguise failures as list boundaries", () => {
  const row = { id: "unit-first", sort_order: 1 };
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.client.mockReturnValue({ from: () => mocks.query });
    mocks.query.select.mockReturnValue(mocks.query);
    mocks.query.is.mockReturnValue(mocks.query);
    mocks.query.order.mockResolvedValue({
      data: [row, { id: "unit-second", sort_order: 2 }], error: null,
    });
  });

  it("finds the next record", async () => {
    expect(await getAdjacentRowId(RESOURCES.services, row, "down")).toBe("unit-second");
    expect(mocks.query.is).toHaveBeenCalledWith("deleted_at", null);
  });
  it("returns null only for a genuine list edge", async () => {
    expect(await getAdjacentRowId(RESOURCES.services, row, "up")).toBeNull();
  });
  it.each([
    { data: null, error: { message: "Unit-only database failure" } },
    { data: null, error: null },
  ])("does not treat an unavailable list as a successful no-op: %j", async result => {
    mocks.query.order.mockResolvedValue(result);
    await expect(getAdjacentRowId(RESOURCES.services, row, "up")).rejects.toThrow();
  });
  it("does not pick another record when the current record disappeared", async () => {
    mocks.query.order.mockResolvedValue({ data: [{ id: "unit-second", sort_order: 2 }], error: null });
    await expect(getAdjacentRowId(RESOURCES.services, row, "down")).rejects.toThrow();
  });
  it("rejects an unavailable ordering value instead of reporting a list edge", async () => {
    await expect(getAdjacentRowId(RESOURCES.services, { id: row.id }, "up")).rejects.toThrow();
  });
});
