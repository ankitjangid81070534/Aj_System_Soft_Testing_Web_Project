import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProjectEdge } from "./ProjectEdge";

const css = readFileSync(new URL("./project-edge.module.css", import.meta.url), "utf8");

describe("project CTA edge safety", () => {
  it("keeps the decorative mask out of accessibility and input paths", () => {
    vi.stubGlobal("React", React);
    try {
      const html = renderToStaticMarkup(React.createElement(ProjectEdge));
      expect(html).toContain('aria-hidden="true"');
      expect(html).not.toMatch(/tabindex|role=|<button|<a /);
    } finally { vi.unstubAllGlobals(); }
    expect(css).toContain("mask-composite: exclude");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("border-radius: inherit");
  });

  it("animates only the inner color layer with bounded transform work", () => {
    expect(css).toContain(".ring::before { animation: travel 4s linear 1; }");
    expect(css).toContain("transform: translate(-50%, -50%) rotate(1turn)");
    expect(css).not.toMatch(/@property|filter:|will-change:|\binfinite\b/);
    expect(css).toContain(".edge.edge { position: relative; }");
  });

  it("has reduced-motion, unsupported-mask and forced-colors fallbacks", () => {
    expect(css).toContain(".ring { display: none; }");
    expect(css).toContain("@supports");
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(css).toMatch(/forced-colors: active[\s\S]*content: none/);
  });

  it("preserves shared Button defaults and explicitly opts in project CTAs", () => {
    const button = readFileSync(new URL("./Button.tsx", import.meta.url), "utf8");
    expect(button).not.toContain("projectEdge");
    for (const path of ["./MarketingHeader.tsx", "./BottomNavigation.tsx", "../design-preview/HomeHero.tsx", "../design-preview/HomeExperience.tsx"]) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      expect(source).toContain("projectEdge.edge");
      expect(source).toContain("<ProjectEdge />");
    }
  });
});
