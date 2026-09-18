import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  client: vi.fn(),
  existing: vi.fn(),
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
    getResourceRow: mocks.existing,
    uniqueSlug: async (config: unknown, slug: string) => slug,
    getAdjacentRowId: vi.fn(),
  };
});

import { upsertResourceAction } from "./actions";
import { RESOURCES } from "./resources";

type GrowthResource = "offers" | "announcements";

function form(resource: GrowthResource, status: string, id?: string) {
  const data = new FormData();
  // Real resource schemas, including their required select fields.
  for (const field of RESOURCES[resource].fields) {
    if (field.type === "select" && field.options?.[0]) {
      data.set(field.name, field.options[0].value);
    }
  }
  data.set("__resource", resource);
  data.set("title", "Unit-test fixture only");
  data.set("slug", "unit-test-fixture");
  data.set("status", status);
  if (id) data.set("__id", id);
  return data;
}

describe.each<GrowthResource>(["offers", "announcements"])(
  "%s publication through Save (mocked adapters; no hosted writes)",
  (resource) => {
    beforeEach(() => {
      vi.clearAllMocks();
      mocks.user.mockResolvedValue({ id: "unit-test-actor", role: "editor" });
      mocks.client.mockReturnValue({ from: () => mocks.query });
      for (const key of ["insert", "update", "select", "eq"] as const) {
        mocks.query[key].mockReturnValue(mocks.query);
      }
      mocks.query.limit.mockResolvedValue({ data: [{ id: "unit-test-row" }], error: null });
      mocks.existing.mockResolvedValue({ id: "unit-test-row", status: "draft" });
    });

    it("does not confuse an absent quick-publish control with permission to publish", async () => {
      expect(RESOURCES[resource].supports.publish).toBeUndefined();
      expect(await upsertResourceAction({ ok: null }, form(resource, "published")))
        .toMatchObject({ ok: false, code: "FORBIDDEN" });
      expect(mocks.client).not.toHaveBeenCalled();
      expect(mocks.query.insert).not.toHaveBeenCalled();
    });

    it.each([["draft", "published"], ["published", "draft"]])(
      "denies editor status transition %s → %s",
      async (current, next) => {
        mocks.existing.mockResolvedValue({ id: "unit-test-row", status: current });
        expect(await upsertResourceAction({ ok: null }, form(resource, next, "unit-test-row")))
          .toMatchObject({ ok: false, code: "FORBIDDEN" });
        expect(mocks.query.update).not.toHaveBeenCalled();
      },
    );

    it.each(["draft", "published"])("preserves editor content edits without writing %s status", async (status) => {
      mocks.existing.mockResolvedValue({ id: "unit-test-row", status });
      expect(await upsertResourceAction({ ok: null }, form(resource, status, "unit-test-row")))
        .toMatchObject({ ok: true });
      expect(mocks.query.update).toHaveBeenCalledOnce();
      expect(mocks.query.update.mock.calls[0][0]).not.toHaveProperty("status");
    });

    it("preserves editor draft creation", async () => {
      expect(await upsertResourceAction({ ok: null }, form(resource, "draft")))
        .toMatchObject({ ok: true });
      expect(mocks.query.insert).toHaveBeenCalledWith(expect.objectContaining({ status: "draft" }));
    });

    it.each(["admin", "super_admin"])("preserves %s publish and unpublish saves", async (role) => {
      mocks.user.mockResolvedValue({ id: "unit-test-actor", role });
      expect(await upsertResourceAction({ ok: null }, form(resource, "published")))
        .toMatchObject({ ok: true });
      expect(mocks.query.insert).toHaveBeenCalledWith(expect.objectContaining({ status: "published" }));
      expect(await upsertResourceAction({ ok: null }, form(resource, "published", "unit-test-row")))
        .toMatchObject({ ok: true });
      expect(mocks.query.update).toHaveBeenLastCalledWith(expect.objectContaining({ status: "published" }));
      mocks.existing.mockResolvedValue({ id: "unit-test-row", status: "published" });
      expect(await upsertResourceAction({ ok: null }, form(resource, "draft", "unit-test-row")))
        .toMatchObject({ ok: true });
      expect(mocks.query.update).toHaveBeenLastCalledWith(expect.objectContaining({ status: "draft" }));
    });
  },
);
