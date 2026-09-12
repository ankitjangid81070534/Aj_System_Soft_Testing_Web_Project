import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeHero } from "./HomeHero";

vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));
const source = readFileSync(new URL("./HomeHero.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("./home-hero.module.css", import.meta.url), "utf8");
const rgb = (hex: string) => hex.match(/[a-f\d]{2}/gi)!.map(v => parseInt(v, 16) / 255);
const luminance = (color: number[]) => color.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const contrast = (a: string, b: string) => (Math.max(luminance(rgb(a)), luminance(rgb(b))) + .05) / (Math.min(luminance(rgb(a)), luminance(rgb(b))) + .05);

describe("requirements-led hero contracts", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());
  it("server-renders one named heading without a client animation gate", () => {
    const html = renderToStaticMarkup(React.createElement(HomeHero));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('aria-labelledby="home-hero-title"');
    expect(html).toContain("Software built around<br/>your requirements.");
    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("onClick=");
    expect(source).not.toContain("setTimeout");
  });
  it("preserves both conversion links, their copy and the native services anchor", () => {
    const html = renderToStaticMarkup(React.createElement(HomeHero));
    for (const [label, href] of [["Start Your Project", "/request-quote"], ["Explore Projects", "/projects"], ["Explore what we build", "#home-services"]]) {
      expect(html).toContain(label);
      expect(html).toContain(`href="${href}"`);
    }
    expect(html.match(/<a\b/g)).toHaveLength(3);
  });
  it.each(["Requirements-first delivery", "You own the source code", "Support after launch", "from first mockup to launch"])("preserves %s", text => {
    expect(renderToStaticMarkup(React.createElement(HomeHero))).toContain(text);
  });
  it.each(["Websites &amp; web apps", "web platforms", "SaaS", "Android &amp; iOS apps", "Desktop software", "ERP / CRM / POS", "Industry software", "business automation systems", "API integrations"])("makes the real %s service family explicit", text => {
    expect(renderToStaticMarkup(React.createElement(HomeHero))).toContain(text);
  });
  it("hides decorative icons/art from assistive technology and preserves the scene", () => {
    const html = renderToStaticMarkup(React.createElement(HomeHero));
    expect(html).toContain("data-scroll-scene");
    expect(html).toContain("data-orbit-entry");
    expect(html).toContain('aria-label="Additional software services"');
    const icons = source.match(/<(?:ArrowDown|ArrowUpRight|Check|Layers3|Sparkles)\b[^>]*>/g) ?? [];
    expect(icons).toHaveLength(5);
    for (const icon of icons) expect(icon).toContain('aria-hidden="true"');
  });
  it("keeps primary text contrast AA for both themes and hover colors", () => {
    const sections = css.split(':global(.dark) .hero.hero');
    for (const section of sections.slice(0, 2)) {
      const token = (name: string) => section.match(new RegExp(`--hero-${name}: (#[a-f\\d]{6});`, "i"))![1];
      expect(contrast(token("on-action"), token("action"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token("on-action"), token("action-hover"))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
