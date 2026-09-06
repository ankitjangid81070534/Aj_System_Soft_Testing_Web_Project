import { describe, expect, it } from "vitest";
import { FALLBACK_SERVICES } from "@/lib/data/services-fallback";
import { pickRelatedServices, pickRelevantProjectIds } from "@/lib/data/services";

describe("fallback service catalogue", () => {
  it("covers the fifteen core services from the master spec", () => {
    expect(FALLBACK_SERVICES.length).toBe(15);
  });

  it("has unique slugs and complete page content", () => {
    const slugs = new Set(FALLBACK_SERVICES.map((service) => service.slug));
    expect(slugs.size).toBe(15);
    for (const service of FALLBACK_SERVICES) {
      expect(service.name).not.toContain("lorem");
      expect(service.shortDescription.length).toBeGreaterThan(30);
      expect(service.problems.length).toBeGreaterThanOrEqual(3);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(4);
      expect(service.platforms.length).toBeGreaterThanOrEqual(1);
      expect(service.features.length).toBeGreaterThanOrEqual(4);
      expect(service.processSteps.length).toBeGreaterThanOrEqual(4);
      expect(service.faqs.length).toBe(3);
      expect(service.seoDescription).toBeTruthy();
    }
  });
});

describe("pickRelatedServices", () => {
  const all = [
    { id: "1", slug: "a", name: "A", shortDescription: "", category: "One", icon: null },
    { id: "2", slug: "b", name: "B", shortDescription: "", category: "One", icon: null },
    { id: "3", slug: "c", name: "C", shortDescription: "", category: "Two", icon: null },
    { id: "4", slug: "d", name: "D", shortDescription: "", category: "Two", icon: null },
  ];

  it("prefers the same category, excludes the current service", () => {
    const related = pickRelatedServices(all, "a");
    expect(related.map((service) => service.slug)).toEqual(["b", "c", "d"]);
  });
});

describe("pickRelevantProjectIds", () => {
  const projects = [
    { id: "p1", industry: "Healthcare", platformType: "Web" },
    { id: "p2", industry: "Retail", platformType: "Windows desktop" },
    { id: "p3", industry: null, platformType: "Web" },
    { id: "p4", industry: "Hospitality", platformType: "Android" },
  ];

  it("ranks industry matches above platform-only matches", () => {
    const ids = pickRelevantProjectIds(projects, {
      industries: ["Healthcare"],
      platforms: ["Web"],
    });
    expect(ids[0]).toBe("p1");
  });

  it("returns only projects with some relevance", () => {
    const ids = pickRelevantProjectIds(projects, {
      industries: ["Healthcare"],
      platforms: ["iOS"],
    });
    expect(ids).toEqual(["p1"]);
  });
});
