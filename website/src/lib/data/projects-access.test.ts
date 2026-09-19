import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ publicClient: vi.fn(), serverClient: vi.fn(), user: vi.fn() }));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: true }));
vi.mock("@/lib/supabase/public", () => ({ createSupabasePublicClient: mocks.publicClient }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.serverClient }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
import { getPublicProjects, getProjectCaseStudy, getProjectSitemapEntries } from "./projects";

// Mocked reader contracts, not hosted RLS or persistence tests. No records are saved.
const record = { id: "unit-project", slug: "unit-only", name: "Unit only", short_summary: "Unit summary", status: "published", client_id: "unit-client", key_features: [], technology_stack: [], integrations: [], impact_results: [] };
function query(data: unknown[] = [], error: unknown = null) {
  const result = { data, error };
  return {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
}
beforeEach(() => { vi.clearAllMocks(); mocks.user.mockResolvedValue(null); });

describe("existing project reader boundaries", () => {
  it.each([getPublicProjects, getProjectSitemapEntries])("retains all three public predicates", async (read) => {
    const projects = query();
    mocks.publicClient.mockReturnValue({ from: vi.fn(() => projects) });
    expect(await read()).toEqual([]);
    expect(projects.eq.mock.calls).toEqual([["status", "published"], ["is_active", true], ["is_public", true]]);
    expect(mocks.serverClient).not.toHaveBeenCalled();
  });

  it("keeps anonymous details restricted and missing client identity absent", async () => {
    const projects = query([record]);
    const clients = query();
    const media = query();
    mocks.serverClient.mockResolvedValue({ from: vi.fn((table) => table === "projects" ? projects : table === "clients" ? clients : media) });
    expect(await getProjectCaseStudy("unit-only")).toMatchObject({ clientName: null, gallery: [], slug: "unit-only" });
    expect(projects.eq.mock.calls).toEqual([["slug", "unit-only"], ["status", "published"], ["is_active", true], ["is_public", true]]);
    expect(media.eq).toHaveBeenCalledWith("project_id", record.id);
  });

  it("preserves authorized staff draft previews", async () => {
    mocks.user.mockResolvedValue({ role: "editor" });
    const projects = query([{ ...record, status: "draft", client_id: null }]);
    mocks.serverClient.mockResolvedValue({ from: vi.fn((table) => table === "projects" ? projects : query()) });
    expect(await getProjectCaseStudy("unit-only")).toMatchObject({ status: "draft" });
    expect(projects.eq.mock.calls).toEqual([["slug", "unit-only"]]);
  });

  it("does not invent a case study when the read fails", async () => {
    mocks.serverClient.mockResolvedValue({ from: vi.fn(() => query([], { message: "unit failure" })) });
    expect(await getProjectCaseStudy("missing")).toBeNull();
    mocks.publicClient.mockImplementation(() => { throw new Error("unit failure"); });
    expect(await getPublicProjects()).toEqual([]);
  });
});
