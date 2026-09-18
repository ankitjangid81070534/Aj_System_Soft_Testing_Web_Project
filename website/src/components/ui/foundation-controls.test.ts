import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

const tokens = readFileSync(new URL("../../app/foundation-tokens.css", import.meta.url), "utf8");
const actions = readFileSync(new URL("../../app/action-surfaces.css", import.meta.url), "utf8");
const surfaces = readFileSync(new URL("../../app/surface-system.css", import.meta.url), "utf8");

// Source contracts complement (not replace) computed-style/browser regression.
describe("shared control foundation", () => {
  it.each(["primary", "secondary", "success", "danger", "quiet"])("centralizes the %s icon accent pair", role => {
    expect(tokens).toContain(`--action-accent-${role}:`);
    expect(tokens).toContain(`--action-accent-${role}-light:`);
    expect(actions).toContain(`var(--action-accent-${role})`);
    expect(actions).toContain(`var(--action-accent-${role}-light)`);
  });
  it("keeps readable action typography and existing touch geometry", () => {
    expect(tokens).toContain("--action-line-height: 1.4;");
    expect(tokens).toContain("--control-height: 2.75rem;");
    expect(actions).toContain("line-height: var(--action-line-height)");
    expect(actions).toContain("min-width: var(--control-height)");
    expect(surfaces).not.toContain("transition-duration: 380ms");
  });
  it("uses bounded icon elevation, not a colored outer glow", () => {
    expect(actions).toContain("box-shadow: var(--shadow-action-icon)");
    expect(actions).not.toContain("0 0 10px -3px var(--action-color)");
  });
  it("keeps native high-contrast focus and neutral control boundaries", () => {
    expect(actions).toContain("@media (forced-colors: active)");
    expect(actions).toContain("background: ButtonFace; color: ButtonText; border-color: ButtonText");
    expect(actions).toContain("outline-color: Highlight");
    expect(actions).not.toContain("forced-color-adjust: none");
  });
  it("retains reduced-motion and disabled contracts", () => {
    expect(tokens).toContain("--duration-control: 0ms; --duration-surface: 0ms; --surface-lift: 0px");
    expect(actions).toContain(".action-control.action-control:active { transform: none; }");
    expect(actions).toContain(":disabled { opacity: .5; transform: none; box-shadow: none;");
  });
});

describe("button variant and size preservation", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());
  for (const variant of ["primary", "secondary", "outline", "ghost", "danger"] as const) {
    it.each(["xs", "sm", "md", "lg"] as const)(`${variant} %s preserves native button semantics`, size => {
      const html = renderToStaticMarkup(Button({ variant, size, type: "button", disabled: true, children: "Keep this action" }));
      expect(html).toContain(`action-${variant}`);
      expect(html).toContain(`action-${size}`);
      expect(html).toContain('type="button"');
      expect(html).toContain('disabled=""');
      expect(html).toContain("Keep this action");
    });
  }
});
