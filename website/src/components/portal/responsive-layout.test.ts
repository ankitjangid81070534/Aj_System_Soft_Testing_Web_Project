import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthCard } from "./AuthCard";
import PrivacyPage from "@/app/(public)/privacy/page";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", props, children),
}));
vi.mock("@/lib/seo/metadata", () => ({ buildRouteMetadata: vi.fn() }));

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

// Presentation contracts only; real browser measurements are recorded in the
// Phase 14 evidence. These tests do not claim to measure CSS geometry.
describe("responsive content boundaries", () => {
  it("allows long privacy URLs to wrap without rewriting legal copy", () => {
    const html = renderToStaticMarkup(React.createElement(PrivacyPage));
    expect(html).toContain('class="mt-10 flex flex-col gap-10 [overflow-wrap:anywhere]"');
    expect(html).toContain("https://policies.google.com/technologies/partner-sites.");
    expect(html).toContain("Last updated: 4 September 2026");
    expect(html).toContain('href="/contact"');
  });

  it("gives workspace labels room at the first two-column breakpoint", () => {
    const html = renderToStaticMarkup(
      AuthCard({
        eyebrow: "Account", title: "Sign up", description: "Account details",
        children: React.createElement("form", { "aria-label": "Existing form" },
          React.createElement("input", { name: "email" })),
      }),
    );
    expect(html).toContain("absolute inset-x-4 top-0");
    expect(html).toContain("xl:inset-x-8");
    expect(html.match(/min-w-0 rounded-2xl border border-line bg-canvas p-2 \[overflow-wrap:anywhere\] xl:p-3/g)).toHaveLength(3);
    for (const text of ["Requirements", "Captured", "Status", "In progress", "Support", "Connected"]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('<form aria-label="Existing form"><input name="email"/></form>');
  });
});
