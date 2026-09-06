import { describe, expect, it } from "vitest";
import {
  applyFilters,
  buildFilterHref,
  deriveFacets,
  type ProjectFilters,
} from "@/lib/data/projects";
import type { ProjectTeaser } from "@/lib/data/mappers";

function project(partial: Partial<ProjectTeaser>): ProjectTeaser {
  return {
    id: partial.id ?? Math.random().toString(),
    slug: partial.slug ?? "x",
    name: partial.name ?? "Project",
    summary: "",
    coverUrl: null,
    platformType: partial.platformType ?? null,
    industry: partial.industry ?? null,
    clientName: partial.clientName ?? null,
    status: "published",
    isFeatured: partial.isFeatured ?? false,
  };
}

describe("deriveFacets — filters only appear where data exists", () => {
  it("collects unique, sorted platform and industry values", () => {
    const facets = deriveFacets([
      project({ platformType: "Web", industry: "Healthcare" }),
      project({ platformType: "web", industry: "Retail" }),
      project({ platformType: null, industry: null }),
      project({ platformType: "Windows desktop", industry: "Healthcare" }),
    ]);
    expect(facets.platforms).toEqual(["Web", "Windows desktop"]);
    expect(facets.industries).toEqual(["Healthcare", "Retail"]);
  });

  it("returns empty facets when no project carries the fields", () => {
    expect(deriveFacets([project({})])).toEqual({ platforms: [], industries: [] });
  });
});

describe("buildFilterHref — chip toggle semantics", () => {
  it("sets a value, combines two, and removes on second click", () => {
    expect(buildFilterHref({}, "platform", "Web")).toBe("/projects?platform=Web");
    const both: ProjectFilters = { platform: "Web" };
    expect(buildFilterHref(both, "industry", "Retail")).toBe(
      "/projects?platform=Web&industry=Retail",
    );
    expect(buildFilterHref(both, "platform", "Web")).toBe("/projects");
  });
});

describe("applyFilters — case-insensitive match", () => {
  const list = [
    project({ id: "1", platformType: "Web", industry: "Healthcare" }),
    project({ id: "2", platformType: "Windows desktop", industry: "Retail" }),
  ];

  it("filters by platform and industry", () => {
    expect(applyFilters(list, { platform: "web" }).map((p) => p.id)).toEqual(["1"]);
    expect(applyFilters(list, { industry: "retail" }).map((p) => p.id)).toEqual(["2"]);
    expect(
      applyFilters(list, { platform: "Web", industry: "Healthcare" }).map((p) => p.id),
    ).toEqual(["1"]);
  });

  it("keeps everything when no filters are active", () => {
    expect(applyFilters(list, {})).toHaveLength(2);
  });
});
