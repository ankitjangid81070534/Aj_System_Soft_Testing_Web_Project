import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BottomNavigation } from "./BottomNavigation";
import { ToastProvider } from "./Toast";
import { LEGAL_NAV_LINKS, NAV_LINKS, withLegalNavigation } from "@/lib/navigation";
import { splitNavigation } from "@/lib/bottom-navigation";

const state = vi.hoisted(() => ({ pathname: "/privacy" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));
beforeEach(() => { vi.stubGlobal("React", React); state.pathname = "/privacy"; });
afterEach(() => vi.unstubAllGlobals());

const render = (navLinks: readonly { label: string; href: string }[] = NAV_LINKS) => renderToStaticMarkup(React.createElement(BottomNavigation, {
  navLinks, open: false, onOpen: () => {}, onClose: () => {}, onPortal: () => {},
  authenticated: false, brandName: "AJ System Soft Technology", ctaLabel: "Start Project", ctaHref: "/request-quote",
}));

describe("Phase 15 legal navigation and notification semantics", () => {
  it("supplements the original navigation without mutation or duplicate legal destinations", () => {
    const links = withLegalNavigation(NAV_LINKS);
    expect(links).toEqual([...NAV_LINKS, ...LEGAL_NAV_LINKS]);
    expect(withLegalNavigation(links)).toEqual(links);
    expect(NAV_LINKS).toHaveLength(8);
  });
  it("preserves managed labels, ordering and external destinations", () => {
    const managed = [{ label: "Our privacy policy", href: "/privacy" }, { label: "Docs", href: "https://example.com/docs" }];
    expect(withLegalNavigation(managed)).toEqual([...managed, LEGAL_NAV_LINKS[1]]);
    expect(managed).toHaveLength(2);
  });
  it("always keeps legal links inside More, including sparse CMS navigation", () => {
    for (const base of [[], [{ label: "Home", href: "/" }], NAV_LINKS]) {
      const links = withLegalNavigation(base);
      const { primary, overflow } = splitNavigation(links);
      for (const legal of LEGAL_NAV_LINKS) {
        expect(primary.some(link => link.href === legal.href)).toBe(false);
        expect(overflow).toContainEqual(legal);
      }
      expect([...primary, ...overflow]).toHaveLength(links.length);
    }
  });
  it("renders both legal destinations in the desktop identity area and More", () => {
    const html = render();
    const desktop = html.match(/<div[^>]*data-legal-navigation[^>]*>([\s\S]*?)<\/div>/)?.[1];
    const more = html.match(/<nav aria-label="More"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    for (const legal of LEGAL_NAV_LINKS) {
      expect(desktop).toContain(`href="${legal.href}"`);
      expect(more).toContain(`href="${legal.href}"`);
    }
    for (const original of NAV_LINKS) expect(html).toContain(`href="${original.href}"`);
    const current = html.match(/<a\b[^>]*>/g)!.filter(tag => tag.includes('href="/privacy"'));
    expect(current).toHaveLength(2);
    for (const tag of current) expect(tag).toContain('aria-current="page"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('href="/request-quote"');
  });
  it("retains CMS legal labels without rendering duplicate desktop links", () => {
    const html = render([{ label: "Our privacy policy", href: "/privacy" }]);
    expect(html.match(/href="\/privacy"/g)).toHaveLength(2);
    expect(html).toContain("Our privacy policy");
    expect(html).toContain("Disclaimer");
  });
  it("gives the polite notification container a nameable role without changing announcements", () => {
    const html = renderToStaticMarkup(React.createElement(ToastProvider, null, React.createElement("p", null, "Existing content")));
    expect(html).toContain('role="region" aria-live="polite" aria-label="Notifications"');
    expect(html).toContain("Existing content");
    expect(html).not.toContain('role="alert"');
  });
});
