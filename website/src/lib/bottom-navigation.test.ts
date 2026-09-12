import { describe, expect, it } from "vitest";
import { NAV_LINKS } from "./navigation";
import { isNavigationActive, splitNavigation } from "./bottom-navigation";

describe("bottom navigation", () => {
  it("places four main destinations on the dock without dropping other links", () => {
    const { primary, overflow } = splitNavigation(NAV_LINKS);
    expect(primary.map(link => link.href)).toEqual(["/", "/services", "/projects", "/contact"]);
    expect(overflow.map(link => link.href)).toEqual(["/ai-methods", "/reviews", "/about", "/team"]);
    expect(new Set([...primary, ...overflow]).size).toBe(NAV_LINKS.length);
  });
  it("retains custom CMS URLs and labels without adding disabled destinations", () => {
    const custom = [
      { href: "/custom", label: "Custom work" },
      { href: "/services", label: "What we do" },
      { href: "https://example.com/docs", label: "Docs" },
      { href: "/news", label: "News" },
      { href: "/team", label: "Our people" },
    ];
    const { primary, overflow } = splitNavigation(custom);
    expect(primary[0]).toEqual(custom[1]);
    expect([...primary, ...overflow]).toHaveLength(custom.length);
    expect([...primary, ...overflow]).toEqual(expect.arrayContaining(custom));
    expect(splitNavigation([])).toEqual({ primary: [], overflow: [] });
  });
  it("highlights nested destinations, not similar route prefixes or external links", () => {
    expect(isNavigationActive("/projects/example", "/projects")).toBe(true);
    expect(isNavigationActive("/projects", "/")).toBe(false);
    expect(isNavigationActive("/teamwork", "/team")).toBe(false);
    expect(isNavigationActive("/", "/")).toBe(true);
    expect(isNavigationActive("/docs", "https://example.com/docs")).toBe(false);
  });
});
