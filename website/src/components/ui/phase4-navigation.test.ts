import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BottomNavigation } from "./BottomNavigation";
import { NAV_LINKS } from "@/lib/navigation";

const state = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));
const props = { navLinks: NAV_LINKS, open: false, onOpen: () => {}, onClose: () => {}, onPortal: () => {}, authenticated: false, brandName: "AJ System Soft Technology", ctaLabel: "Start Project", ctaHref: "/request-quote" };
const render = (overrides: Partial<React.ComponentProps<typeof BottomNavigation>> = {}) => renderToStaticMarkup(React.createElement(BottomNavigation, { ...props, ...overrides }));

describe("Phase 4 navigation preservation and portal disclosure", () => {
  beforeEach(() => { vi.stubGlobal("React", React); state.pathname = "/"; });
  afterEach(() => vi.unstubAllGlobals());
  it("retains all eight links and the managed primary CTA", () => {
    const html = render({ ctaLabel: "Discuss a build", ctaHref: "/contact" });
    for (const link of NAV_LINKS) { expect(html).toContain(`href="${link.href}"`); expect(html).toContain(link.label); }
    expect(html).toContain("Discuss a build");
    expect(html).toContain('href="/contact"');
    expect(html).toContain("More navigation options");
  });
  it("identifies signed-out portal triggers as dialogs without changing the label", () => {
    const html = render();
    const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)!.filter(button => button.includes("Client Login"));
    expect(buttons).toHaveLength(2);
    for (const button of buttons) { expect(button).toContain('aria-haspopup="dialog"'); expect(button).toContain('aria-expanded="false"'); }
  });
  it("exposes the open portal relationship for both triggers", () => {
    const html = render({ portalOpen: true });
    expect(html.match(/aria-controls="portal-login-dialog"/g)).toHaveLength(2);
    const source = readFileSync(new URL("../portal/PortalLoginModal.tsx", import.meta.url), "utf8");
    expect(source).toContain('id="portal-login-dialog"');
    expect(source).toContain('aria-labelledby="portal-login-title"');
  });
  it("does not label signed-in account navigation as a dialog", () => {
    const html = render({ authenticated: true });
    const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)!.filter(button => button.includes("Open Account"));
    expect(buttons).toHaveLength(2);
    for (const button of buttons) expect(button).not.toContain("aria-haspopup");
  });
  it("keeps Services current on real detail paths and not similar prefixes", () => {
    state.pathname = "/services/custom-software-development";
    const links = render().match(/<a\b[^>]*>/g)!.filter(a => a.includes('href="/services"'));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toContain('aria-current="page"');
    state.pathname = "/services-archive";
    for (const link of render().match(/<a\b[^>]*>/g)!.filter(a => a.includes('href="/services"'))) expect(link).not.toContain("aria-current");
  });
});
