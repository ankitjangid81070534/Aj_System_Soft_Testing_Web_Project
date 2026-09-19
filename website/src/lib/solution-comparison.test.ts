import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_SERVICES } from "./data/services-fallback";
import { getComparisonServices, SOLUTION_COMPARISONS } from "./solution-comparison";
import { SolutionComparison } from "@/components/site/SolutionComparison";
import { Industries } from "@/components/site/Industries";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children),
}));

describe("industry and solution decision guidance", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());

  it.each(SOLUTION_COMPARISONS)("maps $id only to current service routes", (comparison) => {
    expect(getComparisonServices(FALLBACK_SERVICES, comparison.id).map((service) => service.slug)).toEqual(comparison.slugs);
    expect(comparison.options).toHaveLength(2);
    for (const option of comparison.options) {
      expect(option.fit.length).toBeGreaterThan(30);
      expect(option.consideration.length).toBeGreaterThan(30);
    }
  });

  it("does not resurrect unavailable services or guess custom slugs", () => {
    expect(getComparisonServices([], "website-web-app")).toEqual([]);
    expect(getComparisonServices(FALLBACK_SERVICES, "unknown")).toEqual([]);
    expect(getComparisonServices([{ ...FALLBACK_SERVICES[0], slug: "custom-cms-slug" }], "custom-off-the-shelf")).toEqual([]);
  });

  it("retains managed names and only supplied matches", () => {
    const managed = { ...FALLBACK_SERVICES[0], name: "Managed title" };
    expect(getComparisonServices([managed], "custom-off-the-shelf")).toEqual([managed]);
    const html = renderToStaticMarkup(React.createElement(SolutionComparison, { services: [managed] }));
    expect(html).toContain("Managed title");
    expect(html).not.toContain('href="/services/api-system-integrations"');
  });

  it("renders five native, mutually exclusive disclosures and both sides on the server", () => {
    const html = renderToStaticMarkup(React.createElement(SolutionComparison, { services: FALLBACK_SERVICES }));
    expect(html.match(/<details\b/g)).toHaveLength(5);
    expect(html.match(/<summary\b/g)).toHaveLength(5);
    expect(html.match(/name="solution-comparison"/g)).toHaveLength(5);
    expect(html.match(/<dl\b/g)).toHaveLength(10);
    expect(new Set(SOLUTION_COMPARISONS.map((item) => item.id)).size).toBe(5);
    expect(html).toContain("not a fixed scope, price or delivery promise");
    expect(html).toContain('href="/request-quote"');
  });

  it("keeps human contact when there are no service matches", () => {
    const html = renderToStaticMarkup(React.createElement(SolutionComparison, { services: [] }));
    expect(html).not.toContain('href="/services/');
    expect(html).toContain("No related service page is currently listed.");
    expect(html).toContain("Discuss your workflow");
  });

  it("keeps eight existing industries, workflow context and existing-route exits", () => {
    const html = renderToStaticMarkup(React.createElement(Industries));
    expect(html.match(/<h3\b/g)).toHaveLength(8);
    expect(html).toContain("Healthcare &amp; clinics");
    expect(html).toContain("Education &amp; institutes");
    expect(html).toContain("Appointments, patient records and billing");
    expect(html).toContain("Workflow examples to discuss");
    expect(html).toContain('href="/services#service-matcher"');
    expect(html).toContain('href="/services#solution-comparison"');
    expect(html).not.toContain('href="/industries');
  });

  it("adds no client state, persistence, animation loop or fallback imports to guidance", () => {
    const source = readFileSync(new URL("../components/site/SolutionComparison.tsx", import.meta.url), "utf8") + readFileSync(new URL("./solution-comparison.ts", import.meta.url), "utf8");
    for (const forbidden of ['"use client"', "useState", "useEffect", "localStorage", "sessionStorage", "fetch(", "setTimeout", "requestAnimationFrame", "services-fallback", "onClick"])
      expect(source).not.toContain(forbidden);
  });
});
