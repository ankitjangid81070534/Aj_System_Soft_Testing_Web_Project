import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HomeContent } from "@/lib/data/home";
import type { LaunchBenefit } from "@/lib/data/growth";
import { HomeExperience } from "./HomeExperience";

vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));
vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => React.createElement("img", { src, alt }) }));
const empty: HomeContent = { services: [], projects: [], team: [], testimonials: [], posts: [] };
// Test-only records exercise optional rendering; never seeded or shown in the app.
const content: HomeContent = {
  services: [{ id: "s", slug: "test-service", name: "Test service", shortDescription: "Retained service description", category: "Test category", icon: null }],
  projects: [{ id: "p", slug: "test-project", name: "Test project", summary: "Retained project summary", coverUrl: null, platformType: "Web", industry: null, clientName: null, status: "published", isFeatured: false }],
  team: [{ id: "t", name: "Test member", roleTitle: "Test role", shortBio: "Retained biography", photoUrl: null, skills: [], linkedinUrl: null, githubUrl: null, portfolioUrl: null, email: null }],
  testimonials: [{ id: "r", quote: "Retained review text", rating: 4, title: null, projectName: null, adminResponse: "Retained response", authorName: "Test reviewer", authorRole: null, authorCompany: null }],
  posts: [{ id: "b", slug: "test-note", title: "Test note", excerpt: "Retained article excerpt", coverUrl: null, category: null, readingMinutes: 2, publishedAt: null, isFeatured: false, status: "published" }],
};
const benefits: LaunchBenefit[] = [{ id: "benefit", title: "Test benefit", description: "Retained benefit description", icon: null }];
const render = (data = content, inclusions = benefits) => renderToStaticMarkup(React.createElement(HomeExperience, { content: data, benefits: inclusions }));
const css = readFileSync(new URL("./home-sections.module.css", import.meta.url), "utf8");

describe("Phase 5 homepage preservation", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());
  it("keeps the current complete section order rather than the unapproved proposal", () => {
    const html = render();
    const order = ["benefits", "services", "platforms", "projects", "delivery", "ownership", "industries", "technology", "principles", "reviews", "team", "insights", "enquiry"];
    const positions = order.map(section => html.indexOf(`data-home-section="${section}"`));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html.indexOf("data-home-hero")).toBeLessThan(positions[0]);
    expect(html.indexOf('aria-label="How we work"')).toBeLessThan(positions[0]);
  });
  it("does not manufacture empty proof panels or default people", () => {
    const html = render(empty, []);
    for (const section of ["benefits", "projects", "reviews", "team", "insights"]) expect(html).not.toContain(`data-home-section="${section}"`);
    expect(html).not.toContain("Test member");
  });
  it.each(["Retained service description", "Retained project summary", "Retained biography", "Retained review text", "Retained response", "Retained article excerpt", "Retained benefit description"])("retains %s", text => {
    expect(render()).toContain(text);
  });
  it("retains existing routes and anchor targets", () => {
    const html = render();
    for (const href of ["/services", "/services/test-service", "/projects/test-project", "/blog/test-note", "/request-quote", "/contact", "#home-services"]) expect(html).toContain(`href="${href}"`);
    for (const id of ["home-services", "included", "delivery", "delivery-description"]) expect(html).toContain(`id="${id}"`);
  });
  it("preserves all five delivery controls and the no-script descriptions", () => {
    const html = render();
    expect(html.match(/aria-controls="delivery-description"/g)).toHaveLength(5);
    expect(html).toContain("<noscript><ol>");
    expect(html).toContain("Support &amp; growth");
  });
  it("keeps capability tiles descriptive, not fake clickable cards", () => {
    const html = render();
    const industries = html.split('data-home-section="industries"')[1].split("</section>")[0];
    expect(industries.match(/class="icon-tile/g)).toHaveLength(8);
    expect(industries).not.toContain("<a ");
    expect(industries).not.toContain("<button");
  });
  it("scopes new presentation without replacing the hero or motion implementation", () => {
    expect(css).not.toContain("[data-home-hero]");
    expect(css).not.toContain("@keyframes");
    expect(css).not.toContain("display: none");
    expect(css).toContain(":global(.dark) .sections");
    expect(css).toContain("var(--shadow-sculpted)");
  });
});
