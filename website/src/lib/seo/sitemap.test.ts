import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data/services", () => ({ getServiceSitemapEntries: async () => [
  { slug: "unit-service", updatedAt: "2026-01-02" },
  { slug: "invalid-date", updatedAt: "not-a-date" },
] }));
vi.mock("@/lib/data/projects", () => ({ getProjectSitemapEntries: async () => [{ slug: "unit-project", updatedAt: null }] }));
vi.mock("@/lib/data/blog", () => ({ getPostSitemapEntries: async () => [{ slug: "unit-post", updatedAt: "2026-01-03" }] }));
vi.mock("./overrides", () => ({ getSeoOverride: async (path: string) => path === "/reviews" ? { noIndex: true } : null }));
// A configured offer/update must not advertise routes that do not exist.
vi.mock("@/lib/data/growth", () => ({
  getOfferSitemapEntries: async () => [{ slug: "unit-offer", updatedAt: "2026-01-01" }],
  getUpdateSitemapEntries: async () => [{ slug: "unit-update", updatedAt: "2026-01-01" }],
}));
import sitemap from "@/app/sitemap";

describe("sitemap matches public route and metadata contracts (mocked records)", () => {
  it("includes only implemented public routes and omits explicit noindex hubs", async () => {
    const entries = await sitemap();
    const paths = entries.map(entry => new URL(entry.url).pathname);
    expect(paths).not.toContain("/reviews");
    expect(paths).not.toContain("/offers/unit-offer");
    expect(paths).not.toContain("/updates/unit-update");
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path).not.toMatch(/^\/(ajadmin|account|login|signup|auth|api|design-preview)/);
      const route = path.replace(/^(\/(services|projects|blog))\/[^/]+$/, "$1/[slug]");
      expect(existsSync(resolve("src/app/(public)", `.${route}`, "page.tsx"))).toBe(true);
    }
  });
  it("uses genuine content modification dates and omits invalid or absent dates", async () => {
    const entries = await sitemap();
    const at = (path: string) => entries.find(entry => new URL(entry.url).pathname === path);
    expect(at("/")?.lastModified).toEqual(new Date("2026-01-03"));
    expect(at("/services/unit-service")?.lastModified).toEqual(new Date("2026-01-02"));
    expect(at("/services/invalid-date")).not.toHaveProperty("lastModified");
    expect(at("/projects/unit-project")).not.toHaveProperty("lastModified");
    expect(at("/privacy")).not.toHaveProperty("lastModified");
  });
});
