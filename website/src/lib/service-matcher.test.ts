import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_SERVICES } from "./data/services-fallback";
import { matchServices, SERVICE_GOALS } from "./service-matcher";
import { ServiceMatcher } from "@/components/site/ServiceMatcher";
import { ServiceCard } from "@/components/ui/ServiceCard";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children),
}));

const matcherSource = readFileSync(new URL("../components/site/ServiceMatcher.tsx", import.meta.url), "utf8");

describe("service guidance from the existing public catalogue", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());

  it.each(SERVICE_GOALS.filter((goal) => goal.slugs.length))("maps $id only to existing relevant routes", (goal) => {
    const matches = matchServices(FALLBACK_SERVICES, goal.id);
    expect(matches.map((service) => service.slug)).toEqual(goal.slugs);
  });

  it("covers every current capability without a duplicate catalogue", () => {
    const slugs = new Set(SERVICE_GOALS.flatMap((goal) => [...goal.slugs]));
    expect([...slugs].sort()).toEqual(FALLBACK_SERVICES.map((service) => service.slug).sort());
    expect(new Set(SERVICE_GOALS.map((goal) => goal.id)).size).toBe(SERVICE_GOALS.length);
  });

  it("does not resurrect a hidden or unavailable service", () => {
    const available = FALLBACK_SERVICES.filter((service) => service.slug === "ios-app-development");
    expect(matchServices(available, "mobile").map((service) => service.slug)).toEqual(["ios-app-development"]);
    expect(matchServices([], "mobile")).toEqual([]);
  });

  it("keeps managed names and route data, without guessing from keywords", () => {
    const managed = { ...FALLBACK_SERVICES[0], name: "Managed service name", shortDescription: "Managed copy" };
    expect(matchServices([managed], "business")).toEqual([managed]);
    expect(matchServices([{ ...managed, slug: "new-managed-service" }], "business")).toEqual([]);
  });

  it.each(["unsure", "unknown"])("does not invent a match for %s", (id) => {
    expect(matchServices(FALLBACK_SERVICES, id)).toEqual([]);
  });

  it("server renders nine native keyboard disclosures and actual service links", () => {
    const html = renderToStaticMarkup(React.createElement(ServiceMatcher, { services: FALLBACK_SERVICES }));
    expect(html.match(/<details\b/g)).toHaveLength(9);
    expect(html.match(/<summary\b/g)).toHaveLength(9);
    expect(html.match(/name="service-goal"/g)).toHaveLength(9);
    expect(html).toContain('href="#service-catalogue"');
    expect(html).toContain('href="/request-quote"');
    for (const service of FALLBACK_SERVICES) expect(html).toContain(`href="/services/${service.slug}"`);
    expect(html).toContain("not a fixed scope or quote");
  });

  it("uses an honest empty result with a human enquiry exit", () => {
    const html = renderToStaticMarkup(React.createElement(ServiceMatcher, { services: [] }));
    expect(html).not.toContain('href="/services/');
    expect(html).toContain("No matching service page is currently listed.");
    expect(html).toContain("Discuss your requirements");
  });

  it("keeps service fragments in app-router history as well as no-JS HTML", () => {
    const hub = readFileSync(new URL("../app/(public)/services/page.tsx", import.meta.url), "utf8");
    expect(hub).toContain('import Link from "next/link"');
    expect(hub).toContain('href="#service-matcher"');
    expect(hub).not.toMatch(/<a\s/);
    expect(matcherSource).not.toMatch(/<a\s/);
  });

  it("adds no client state, network writes, storage, timers or motion loop", () => {
    for (const forbidden of ['"use client"', "useState", "useEffect", "localStorage", "sessionStorage", "fetch(", "setTimeout", "requestAnimationFrame", "onClick"])
      expect(matcherSource).not.toContain(forbidden);
  });

  it("shows complete service summaries with one clear native detail link", () => {
    const description = "A service summary that should remain available in full on every screen.";
    const html = renderToStaticMarkup(React.createElement(ServiceCard, { title: "Service", description, href: "/services/custom-software-development" }));
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain(description);
    expect(html).not.toContain("line-clamp");
    expect(html).toContain("Explore service");
  });
});
