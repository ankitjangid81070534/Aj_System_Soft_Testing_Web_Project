import { describe, expect, it } from "vitest";
import { buildMetadata, buildRootMetadata, HOMEPAGE_TITLE } from "@/lib/seo/metadata";

describe("buildMetadata", () => {
  it("resolves the canonical URL against the site URL", () => {
    const metadata = buildMetadata({ description: "Test description", path: "/services" });
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/services");
  });

  it("uses the absolute homepage title with the full brand name", () => {
    const metadata = buildMetadata({
      absoluteTitle: true,
      title: HOMEPAGE_TITLE,
      description: "Test description",
      path: "/",
    });
    expect(metadata.title).toEqual({
      absolute: "AJ System Soft Technology | Custom Software Development Company India",
    });
  });

  it("installs the supplied AdSense account declaration", () => {
    expect(buildRootMetadata().other).toEqual({
      "google-adsense-account": "ca-pub-5453930363427434",
    });
  });

  it("normalizes a full Search Console verification assignment", () => {
    const previous = process.env.GOOGLE_SITE_VERIFICATION;
    process.env.GOOGLE_SITE_VERIFICATION = "google-site-verification=abc123";
    expect(buildRootMetadata().verification).toEqual({ google: "abc123" });
    if (previous === undefined) delete process.env.GOOGLE_SITE_VERIFICATION;
    else process.env.GOOGLE_SITE_VERIFICATION = previous;
  });

  it("marks private pages noindex", () => {
    const metadata = buildMetadata({ description: "d", path: "/ajadmin", noIndex: true });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("preserves article dates and authors without unsafe casts", () => {
    const article = { publishedTime: "2026-09-06", modifiedTime: "2026-09-07", authors: ["AJS Technology"] };
    const metadata = buildMetadata({ description: "Article", path: "/blog/example", type: "article", article });
    expect(metadata.openGraph).toMatchObject({ type: "article", ...article });
  });

  it("does not attach article-only fields to website metadata", () => {
    const metadata = buildMetadata({ description: "Page", path: "/about", article: { publishedTime: "2026-09-06" } });
    expect(metadata.openGraph).not.toHaveProperty("publishedTime");
  });

  it("leaves robots undefined for public pages", () => {
    const metadata = buildMetadata({ description: "d", path: "/about" });
    expect(metadata.robots).toBeUndefined();
  });
});
