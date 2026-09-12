import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(), from: vi.fn(),
  query: { select: vi.fn(), eq: vi.fn(), is: vi.fn(), order: vi.fn(), limit: vi.fn() },
}));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: true }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/auth/actions", () => ({ signOutAction: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminLooseClient: () => ({ from: mocks.from }) }));
vi.mock("next/link", () => ({ default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => React.createElement("a", { href, ...props }, children) }));
import AdminDashboardPage from "./page";

describe("dashboard lead access (server render with mocked data adapters)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("React", React);
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role: "editor", fullName: null });
    mocks.from.mockReturnValue(mocks.query);
    for (const key of ["select", "eq", "is", "order"] as const) mocks.query[key].mockReturnValue(mocks.query);
    mocks.query.limit.mockResolvedValue({ data: [{ id: "unit-test-lead", full_name: "Private lead fixture", email: "fixture@example.test", created_at: "2026-01-01T00:00:00Z" }], error: null });
  });
  afterEach(() => vi.unstubAllGlobals());
  it.each([null, "client"])("does not query privileged data for %s", async role => {
    mocks.user.mockResolvedValue(role ? { id: "unit-test-actor", role } : null);
    await AdminDashboardPage();
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("editors never query or receive lead data or lead controls", async () => {
    const html = renderToStaticMarkup(await AdminDashboardPage());
    expect(mocks.from).not.toHaveBeenCalledWith("quote_requests");
    expect(html).not.toContain("Private lead fixture");
    expect(html).not.toContain("Latest quote requests");
    expect(html).not.toContain("/ajadmin/leads");
    expect(html).toContain("New project");
  });
  it.each(["admin", "super_admin"])("preserves authorized lead access for %s", async role => {
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role, fullName: null });
    const html = renderToStaticMarkup(await AdminDashboardPage());
    expect(mocks.from).toHaveBeenCalledWith("quote_requests");
    expect(html).toContain("Private lead fixture");
    expect(html).toContain("/ajadmin/leads");
  });
  it("reports failed lead reads instead of claiming the inbox is empty", async () => {
    mocks.user.mockResolvedValue({ id: "unit-test-actor", role: "admin", fullName: null });
    mocks.query.limit.mockResolvedValue({ data: null, error: { code: "XX000" } });
    const html = renderToStaticMarkup(await AdminDashboardPage());
    expect(html).toContain("Quote requests could not be loaded");
    expect(html).not.toContain("No quote requests yet.");
  });
});
