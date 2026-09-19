import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketingHeader } from "./MarketingHeader";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));
vi.mock("@/lib/supabase/client", () => ({ createSupabaseBrowserClient: vi.fn() }));
vi.mock("@/components/portal/PortalLoginModal", () => ({ PortalLoginModal: () => null }));

const render = (props: React.ComponentProps<typeof MarketingHeader> = {}) => renderToStaticMarkup(React.createElement(MarketingHeader, props));

describe("Phase 5 brand header contracts", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());

  it("server-renders brand and a real project link without waiting for animation or session", () => {
    const html = render();
    expect(html).toContain("data-brand-header");
    expect(html).toContain('aria-label="AJ System Soft Technology — home"');
    expect(html).toContain('href="/request-quote"');
    expect(html).toContain("Start Project");
    expect(html).toContain('aria-hidden="true"');
  });

  it("keeps dialog triggers disabled in server HTML while project links remain usable", () => {
    const html = render();
    for (const name of ["More navigation options", "Search navigation"]) {
      const button = html.match(/<button\b[^>]*>/g)!.find(tag => tag.includes(`aria-label="${name}"`));
      expect(button).toContain('disabled=""');
    }
    const cta = html.match(/<a\b[^>]*>/g)!.find(tag => tag.includes('href="/request-quote"'));
    expect(cta).not.toMatch(/\s(?:disabled|aria-disabled)=/);
  });

  it("preserves CMS branding and CTA destination", () => {
    const html = render({ brandName: "Custom company name", brandShortName: "Custom brand", ctaLabel: "Discuss requirements", ctaHref: "/contact" });
    expect(html).toContain('aria-label="Custom company name — home"');
    expect(html).toContain("Custom brand");
    expect(html).toContain("Discuss requirements");
    expect(html).toContain('href="/contact"');
  });

  it("keeps existing blank-setting fallbacks", () => {
    const html = render({ brandName: " ", brandShortName: " ", ctaLabel: " ", ctaHref: " " });
    expect(html).toContain("AJ System Soft Technology");
    expect(html).toContain("AJS Technology");
    expect(html).toContain("Start Project");
    expect(html).toContain('href="/request-quote"');
  });
});
