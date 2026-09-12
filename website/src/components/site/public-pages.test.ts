import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), "src", path), "utf8");
const page = (route: string) => read(`app/(public)/${route}/page.tsx`);

describe("Phase 7 public presentation contracts", () => {
  it.each(["services", "services/[slug]", "projects", "projects/[slug]", "reviews", "about", "team", "contact", "blog", "blog/[slug]"])("%s uses the shared H1 and breadcrumbs", (route) => {
    expect(page(route)).toContain("<PageHero");
    expect(page(route)).not.toMatch(/<h1\b/);
    expect(page(route)).not.toContain('as="h1"');
  });

  it("keeps page titles in normal flow, without per-word reveal blocks", () => {
    const hero = read("components/site/PageHero.tsx");
    expect(hero).toContain('as="h1"');
    expect(hero).toContain("title={<span>{title}</span>}");
    expect(hero).toContain("<Breadcrumbs items={crumbs}");
  });

  it("uses a native article disclosure and accessible fragment navigation", () => {
    const contents = read("components/site/ArticleContents.tsx");
    expect(contents).toContain("<details open");
    expect(contents).toContain("<summary");
    expect(contents).toContain('aria-label="Article sections"');
    expect(contents).toContain('href={`#${entry.id}`}');
    expect(contents).not.toContain('"use client"');
    expect(page("blog/[slug]")).toContain("showToc ? <ArticleContents entries={toc}");
    expect(page("blog/[slug]")).toContain('showToc ? "lg:grid-cols-[minmax(0,1fr)_16rem]" : ""');
  });

  it("keeps contact handlers, fresh spam stamp and form props unchanged", () => {
    const contact = page("contact");
    expect(contact).toContain('export const dynamic = "force-dynamic"');
    expect(contact).toContain("const startedAt = Date.now()");
    expect(contact).toContain("<ContactForm startedAt={startedAt} />");
    expect(contact).toContain("<AppointmentForm startedAt={startedAt} />");
  });

  it("keeps publication lookups and true not-found handling on detail routes", () => {
    for (const [route, entity, getter] of [
      ["services/[slug]", "service", "getServiceBySlug"],
      ["projects/[slug]", "project", "getProjectCaseStudy"],
      ["blog/[slug]", "post", "getPostBySlug"],
    ]) {
      expect(page(route)).toContain(`await ${getter}(slug)`);
      expect(page(route).match(new RegExp(`if \\(!${entity}\\) notFound\\(\\)`, "g"))).toHaveLength(2);
    }
  });

  it("uses current-link semantics without changing filter URLs", () => {
    const filters = read("components/site/ProjectFiltersBar.tsx");
    expect(filters).toContain("href={buildFilterHref(current, paramKey, value)}");
    expect(filters).toContain('aria-current={isActive ? "true" : undefined}');
    expect(filters).not.toContain("aria-pressed");
    expect(page("blog")).not.toContain("aria-pressed");
  });

  it("connects existing service section labels to rendered headings", () => {
    const service = page("services/[slug]");
    for (const id of ["problems-heading", "related-work", "faq-heading", "related-services"]) {
      expect(service).toContain(`aria-labelledby="${id}"`);
      expect(service).toContain(`<span id="${id}">`);
    }
  });
});
