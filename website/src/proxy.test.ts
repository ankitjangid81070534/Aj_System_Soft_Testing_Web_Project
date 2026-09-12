import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch as unstable_doesProxyMatch } from "next/experimental/testing/server";
// Next normally installs this Node global in its server bootstrap.
vi.hoisted(async () => {
  const { AsyncLocalStorage } = await import("node:async_hooks");
  vi.stubGlobal("AsyncLocalStorage", AsyncLocalStorage);
});
const mocks = vi.hoisted(() => ({ configured: true, getUser: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/env", () => ({
  get isSupabaseConfigured() { return mocks.configured; },
  // Nonfunctional unit-test configuration, never delivered to the running app.
  supabasePublicEnv: { url: "https://unit-test.invalid", anonKey: "unit-test-not-a-credential" },
}));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.client }));

describe("configured redirect and session routing (mocked provider)", () => {
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks(); mocks.configured = true;
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    mocks.client.mockReturnValue({ auth: { getUser: mocks.getUser } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([]))));
  });
  afterEach(() => vi.unstubAllGlobals());
  it.each(["/services/old-service", "/projects/old-project", "/blog/old-post"])("runs saved redirects for %s without session overhead", async path => {
    const { config, proxy } = await import("./proxy");
    expect(unstable_doesProxyMatch({ config, nextConfig: {}, url: path })).toBe(true);
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([{ from_path: path, to_path: "/services/new-service" }])));
    const response = await proxy(new NextRequest(`https://site.example${path}?source=test`));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://site.example/services/new-service?source=test");
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("does not call Auth for an unmatched public detail page", async () => {
    const { proxy } = await import("./proxy");
    await proxy(new NextRequest("https://site.example/services/current"));
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("continues public navigation on redirect-provider failure", async () => {
    const { proxy } = await import("./proxy");
    vi.mocked(fetch).mockRejectedValue(new Error("unit-test provider unavailable"));
    expect((await proxy(new NextRequest("https://site.example/blog/current"))).status).toBe(200);
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it.each([["/account", "/login"], ["/ajadmin/c/services", "/ajadmin/login"]])("keeps the unauthenticated gate for %s", async (path, login) => {
    const { proxy } = await import("./proxy");
    const response = await proxy(new NextRequest(`https://site.example${path}`));
    expect(new URL(response.headers.get("location")!).pathname).toBe(login);
    expect(mocks.getUser).toHaveBeenCalledOnce();
  });
  it("keeps signed-in client navigation available", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "unit-test-user" } } });
    const { proxy } = await import("./proxy");
    expect((await proxy(new NextRequest("https://site.example/account"))).status).toBe(200);
  });
  it("keeps token-free auth callback and static assets outside proxy matching", async () => {
    const { config } = await import("./proxy");
    for (const path of ["/auth/callback", "/_next/static/chunks/test.js", "/icon", "/sitemap.xml"]) {
      expect(unstable_doesProxyMatch({ config, nextConfig: {}, url: path })).toBe(false);
    }
  });
  it.each(["/", "/projects", "/blog", "/login"])("does not log an auth warning for unconfigured public route %s", async path => {
    mocks.configured = false;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { proxy } = await import("./proxy");
      expect((await proxy(new NextRequest(`https://site.example${path}`))).status).toBe(200);
      expect(warning).not.toHaveBeenCalled();
      expect(mocks.client).not.toHaveBeenCalled();
    } finally {
      warning.mockRestore();
    }
  });
  it.each(["/ajadmin", "/account"])("retains the missing-auth warning for protected route %s", async path => {
    mocks.configured = false;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { proxy } = await import("./proxy");
      expect((await proxy(new NextRequest(`https://site.example${path}`))).status).toBe(200);
      expect(warning).toHaveBeenCalledWith("[auth] Supabase not configured — session checks unavailable for this protected route.");
      expect(mocks.client).not.toHaveBeenCalled();
    } finally {
      warning.mockRestore();
    }
  });
  it("keeps public fallback pages available without configuration", async () => {
    mocks.configured = false;
    const { proxy } = await import("./proxy");
    expect((await proxy(new NextRequest("https://site.example/services/current"))).status).toBe(200);
    expect(fetch).not.toHaveBeenCalled(); expect(mocks.client).not.toHaveBeenCalled();
  });
});
