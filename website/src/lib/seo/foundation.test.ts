import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingJsonLd, localBusinessJsonLd, serviceJsonLd, webSiteJsonLd } from "./jsonld";
import { buildMetadata, buildRootMetadata, buildRouteMetadata } from "./metadata";
import robots from "@/app/robots";

vi.mock("./overrides", () => ({ getSeoOverride: vi.fn(async () => ({ noIndex: false })) }));
afterEach(() => vi.unstubAllEnvs());

const article = {
  title: "Unit article", description: "Unit description", path: "/blog/unit",
  publishedAt: null, modifiedAt: null, authorName: "AJ System Soft Technology",
};

describe("truthful, safely serialized structured data", () => {
  it("cannot break out of its script tag with CMS text", () => {
    const data = { description: '</script><script>alert("unit")</script>' };
    const html = renderToStaticMarkup(React.createElement(JsonLd, { data }));
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(JSON.parse(html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>")))).toEqual(data);
  });
  it.each([null, "not-a-date"])("omits missing/invalid article dates: %s", date => {
    const result = blogPostingJsonLd({ ...article, publishedAt: date, modifiedAt: date });
    expect(result).not.toHaveProperty("datePublished");
    expect(result).not.toHaveProperty("dateModified");
  });
  it("keeps actual dates and authors", () => {
    expect(blogPostingJsonLd({ ...article, publishedAt: "2026-01-01", modifiedAt: "2026-02-01", authorName: "Unit author" }))
      .toMatchObject({ datePublished: "2026-01-01", dateModified: "2026-02-01", author: { "@type": "Person", name: "Unit author" } });
  });
  it("uses geography for service area and industries for audience", () => {
    const result = serviceJsonLd({ name: "Unit", description: "Unit", path: "/services/unit", industries: ["Healthcare"] });
    expect(result.areaServed).toEqual(["India", "Worldwide"]);
    expect(result.audience).toEqual([{ "@type": "BusinessAudience", audienceType: "Healthcare" }]);
  });
  it("does not invent prices, ratings, or a search endpoint", () => {
    expect(localBusinessJsonLd()).not.toHaveProperty("priceRange");
    expect(localBusinessJsonLd()).not.toHaveProperty("aggregateRating");
    expect(webSiteJsonLd()).not.toHaveProperty("potentialAction");
  });
});

describe("preview and private indexing boundaries", () => {
  it.each(["base44", "vercel"])("blocks %s previews at root, page and robots levels", platform => {
    vi.stubEnv("BASE44_PUBLIC_HOST_SUFFIX", platform === "base44" ? "unit.invalid" : "");
    vi.stubEnv("VERCEL_ENV", platform === "vercel" ? "preview" : "production");
    expect(buildRootMetadata().robots).toEqual({ index: false, follow: false });
    expect(buildMetadata({ path: "/services", description: "Unit", noIndex: false }).robots).toEqual({ index: false, follow: false });
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
  it("retains indexable published pages and excludes private routes for every crawler", () => {
    vi.stubEnv("BASE44_PUBLIC_HOST_SUFFIX", "");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(buildRootMetadata().robots).toMatchObject({ index: true, follow: true });
    expect(buildMetadata({ path: "/services", description: "Unit" }).robots).toBeUndefined();
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(true);
    if (!Array.isArray(rules)) throw new Error("Expected crawler rules");
    for (const rule of rules) {
      for (const path of ["/ajadmin", "/account", "/login", "/signup", "/forgot-password", "/reset-password", "/update-password", "/design-preview"])
        expect(rule.disallow).toContain(path);
    }
  });
  it("does not let a CMS false override re-index an explicitly private route", async () => {
    vi.stubEnv("BASE44_PUBLIC_HOST_SUFFIX", "");
    vi.stubEnv("VERCEL_ENV", "production");
    expect((await buildRouteMetadata({ path: "/account", description: "Unit", noIndex: true })).robots).toEqual({ index: false, follow: false });
  });
});
