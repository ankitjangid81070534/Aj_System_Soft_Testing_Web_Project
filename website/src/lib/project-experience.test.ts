import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectFiltersBar } from "@/components/site/ProjectFiltersBar";
import { ProjectGallery } from "@/components/site/ProjectGallery";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children),
}));

// Presentation-only fixtures. Never inserted into the application or a database.
describe("project presentation without fabricated proof", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());

  it("shows the full summary and an explicit single case-study link", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectCard, {
      name: "Test-only record", summary: "The complete supplied summary.", href: "/projects/test-only",
    }));
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain("The complete supplied summary.");
    expect(html).not.toContain("line-clamp");
    expect(html).toContain("Read case study");
    expect(html).not.toContain("Confidential");
    expect(html).not.toContain("·");
  });

  it("renders a standalone walkthrough without inventing screenshots", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectGallery, { name: "Unit only", gallery: [], videoUrl: "https://example.com/unit-video" }));
    expect(html).toContain("Watch the full walkthrough");
    expect(html).toContain('href="https://example.com/unit-video"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("Screenshot");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("<video");
  });

  it("omits the entire media section when no approved media is supplied", () => {
    expect(renderToStaticMarkup(React.createElement(ProjectGallery, { name: "Unit only", gallery: [], videoUrl: null }))).toBe("");
  });

  it("retains gallery video links and identifies them as clips", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectGallery, { name: "Unit only", gallery: [{ id: "unit-video", type: "video", url: "https://example.com/unit-clip", alt: "" }], videoUrl: null }));
    expect(html).toContain("Watch demo clip");
    expect(html).toContain('href="https://example.com/unit-clip"');
    expect(html).not.toContain("Watch the full walkthrough");
    expect(html).not.toContain("Screenshot 1");
  });

  it("does not show an action on a non-linked card", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectCard, { name: "Test-only record" }));
    expect(html).toContain("<article");
    expect(html).not.toContain("Read case study");
  });

  it("renders supplied metadata without orphan separators", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectCard, { name: "Test-only record", industry: "Test industry" }));
    expect(html).toContain("Test industry");
    expect(html).not.toContain("·");
  });

  it("keeps a clear-filter escape when no facets are available", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectFiltersBar, {
      facets: { platforms: [], industries: [] }, current: { platform: "unavailable" }, resultCount: 0,
    }));
    expect(html).toContain('href="/projects"');
    expect(html).toContain("Clear filters");
    expect(html).toContain("0 projects");
  });

  it("does not invent filters for an empty unfiltered portfolio", () => {
    expect(renderToStaticMarkup(React.createElement(ProjectFiltersBar, {
      facets: { platforms: [], industries: [] }, current: {}, resultCount: 0,
    }))).toBe("");
  });

  it("exposes selected facets and preserves native link targets", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectFiltersBar, {
      facets: { platforms: ["Web"], industries: ["Retail"] }, current: { platform: "web" }, resultCount: 1,
    }));
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('href="/projects?platform=web&amp;industry=Retail"');
    expect(html).toContain('aria-label="Project filters"');
  });
});
