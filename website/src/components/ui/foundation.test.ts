import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Badge, StatusPill } from "./Badge";
import { Card, CardBody, CardTitle } from "./Card";
import { Button } from "./Button";
import { Input, Textarea, Select } from "./Input";

vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));
const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const accents = readFileSync(new URL("../../app/accent-surfaces.css", import.meta.url), "utf8");
const foundations = readFileSync(new URL("../../app/foundation-tokens.css", import.meta.url), "utf8");
const rgb = (hex: string) => hex.match(/[a-f\d]{2}/gi)!.map(v => parseInt(v, 16) / 255);
const mix = (a: number[], b: number[], amount: number) => a.map((v, i) => v * amount + b[i] * (1 - amount));
const luminance = (color: number[]) => color.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const contrast = (a: number[], b: number[]) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
const token = (name: string, dark = false) => {
  const source = dark ? css.slice(css.indexOf("\n.dark {")) : css;
  const value = source.match(new RegExp(`--color-${name}: (#[a-f\\d]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing ${name} theme token`);
  return rgb(value);
};

describe("foundation contrast contracts (not a whole-page accessibility audit)", () => {
  it.each(["canvas", "canvas-raised", "surface"])("muted text meets AA on light %s", surface => {
    expect(contrast(token("ink-muted"), token(surface))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(["canvas", "canvas-raised", "surface"])("muted text meets AA on dark %s", surface => {
    expect(contrast(token("ink-muted", true), token(surface, true))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(["success", "warning", "danger", "info"])("%s badge text meets AA on its light soft surface", tone => {
    expect(contrast(token(tone), token(`${tone}-soft`))).toBeGreaterThanOrEqual(4.5);
  });
  const pairs = [...accents.matchAll(/--card-accent: (#[a-f\d]{6}); --card-light: (#[a-f\d]{6})/gi)];
  it.each(pairs.map(([, accent, light]) => [accent, light]))("white card copy meets AA at the brightest %s highlight", (accent, light) => {
    // Lock the actual recipe before evaluating its brightest endpoint.
    expect(accents).toContain("var(--card-light), transparent 86%");
    expect(accents).toContain("var(--card-accent), #000 15%");
    const backdrop = mix(rgb(light), mix(rgb(accent), [0, 0, 0], .85), .14);
    const paragraph = mix([1, 1, 1], backdrop, .92);
    expect(contrast(paragraph, backdrop)).toBeGreaterThanOrEqual(4.5);
  });
  it("focus outlines contrast with both neutral themes", () => {
    expect(contrast(rgb("#1d4ed8"), token("surface"))).toBeGreaterThanOrEqual(3);
    expect(contrast(rgb("#93c5fd"), token("surface", true))).toBeGreaterThanOrEqual(3);
    expect(css).toContain("outline: var(--focus-width) solid var(--focus-color)");
  });
  it("keeps icon foregrounds sharp and touch/reduced-motion recipes explicit", () => {
    expect(accents).toContain("filter: none; opacity: 1");
    expect(foundations).toContain("@media (max-width: 700px)");
    expect(foundations).toContain("--duration-control: 0ms; --duration-surface: 0ms; --surface-lift: 0px");
    expect(accents).not.toContain("color: #fff !important");
  });
});

describe("shared component rendering contracts", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());
  it("retains native disabled/loading button semantics", () => {
    const html = renderToStaticMarkup(Button({ loading: true, type: "submit", children: "Save" }));
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('type="submit"');
    expect(html).toContain("Save");
  });
  it("retains internal/external link destinations and safe external rel", () => {
    expect(renderToStaticMarkup(Button({ href: "/request-quote", children: "Start Your Project" }))).toContain('href="/request-quote"');
    const external = renderToStaticMarkup(Button({ href: "https://example.test", children: "Documentation" }));
    expect(external).toContain('rel="noopener noreferrer"');
    expect(external).toContain('target="_blank"');
  });
  it("retains neutral/display card variants and content", () => {
    const child = React.createElement(CardBody, null, React.createElement(CardTitle, null, "Settings"));
    const neutral = renderToStaticMarkup(React.createElement(Card, { flat: true }, child));
    expect(neutral).not.toContain("card-3d");
    expect(neutral).toContain("p-card sm:p-card-lg");
    expect(neutral).toContain("Settings");
    expect(renderToStaticMarkup(React.createElement(Card, null, "Content"))).toContain("card-3d");
  });
  it("retains badge text/tone and unknown status fallback", () => {
    const html = renderToStaticMarkup(Badge({ tone: "success", children: "Published" }));
    expect(html).toContain("text-success");
    expect(html).toContain("text-label");
    expect(html).toContain("Published");
    expect(renderToStaticMarkup(React.createElement(StatusPill, { status: "Custom status" }))).toContain("Custom status");
  });
  it("retains input constraints and invalid semantics across fields", () => {
    for (const field of [Input, Textarea, Select]) {
      const html = renderToStaticMarkup(field({ invalid: true, required: true, name: "requirement", disabled: true }));
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('required=""');
      expect(html).toContain('disabled=""');
      expect(html).toContain('name="requirement"');
      expect(html).toContain("focus-ring");
    }
  });
});
