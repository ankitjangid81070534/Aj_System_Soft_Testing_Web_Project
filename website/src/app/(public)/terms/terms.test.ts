import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TermsPage from "./page";
import { TERMS_TITLE } from "./terms-content";

vi.mock("@/lib/seo/metadata", () => ({ buildRouteMetadata: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", props, children),
}));

const plainText = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&");

describe("Terms of Service page", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());

  it("renders the supplied title, four numbered sections, and eight list items", () => {
    const html = renderToStaticMarkup(React.createElement(TermsPage));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(TERMS_TITLE);
    expect(html.match(/<h2\b/g)).toHaveLength(4);
    // Breadcrumbs also use list items; only count the legal article.
    const article = html.slice(html.indexOf("<article"));
    expect(article.match(/<li\b/g)).toHaveLength(8);
    for (const heading of [
      "1. Scope of Work & Requirements",
      "2. Source Code Ownership & Copyright Protection",
      "3. Strict Limitation of Liability (Software Misuse Clause)",
      "4. Governing Law",
    ]) expect(plainText(article)).toContain(heading);
    expect(article).not.toContain("##");
    expect(article).not.toContain("**");
  });

  it("preserves the supplied emphasis, legal names, and jurisdiction without the old copy", () => {
    const html = renderToStaticMarkup(React.createElement(TermsPage));
    for (const emphasized of [
      "Copyright Claim Prevention:",
      "AJ System Soft Technology acts strictly as a technology development provider.",
      "client bears 100% legal ownership and responsibility for its operation.",
      "AJ System Soft Technology, its owner Ankit Jangid, and its management shall hold ZERO legal or financial liability.",
    ]) expect(html).toContain(`<strong>${emphasized}</strong>`);
    expect(html).toContain("Welcome to AJ System Soft Technology (Ankit System Soft Technology).");
    expect(html).toContain("exclusive jurisdiction of the courts in Rajasthan, India.");
    expect(html).not.toContain("The short version:");
    expect(html).not.toContain("30 August 2026");
    expect(html).not.toContain("Terms &amp; Conditions");
  });
});
