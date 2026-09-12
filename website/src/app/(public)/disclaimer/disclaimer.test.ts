import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DisclaimerPage from "./page";
import { Footer } from "@/components/ui/Footer";

vi.mock("@/lib/seo/metadata", () => ({ buildRouteMetadata: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", props, children),
}));

const expectedParagraphs = [
  'The information and custom digital services provided by AJ System Soft Technology are engineered around custom business workflows on an "as-is" and "as-available" basis.',
  "AJ System Soft Technology does not monitor, control, or take responsibility for how clients deploy, host, or execute the software products after project delivery. We explicitly disclaim all liability for any direct, indirect, incidental, or consequential damages or legal penalties resulting from the misuse, illegal setup, or fraudulent applications of our custom-developed systems by the client or end-users.",
  "Clients are strictly advised to operate their delivered web apps and platforms within the bounds of information technology laws and regional compliance rules.",
];

describe("Legal Disclaimer", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => vi.unstubAllGlobals());

  it("preserves all three supplied paragraphs exactly", () => {
    const html = renderToStaticMarkup(React.createElement(DisclaimerPage));
    const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)]
      .map(([, text]) => text.replace(/&quot;/g, '"'));
    expect(paragraphs).toEqual(expectedParagraphs);
  });

  it("renders one page heading and a clearly labelled liability section", () => {
    const html = renderToStaticMarkup(React.createElement(DisclaimerPage));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('id="disclaimer-title"');
    expect(html).toContain("Legal Disclaimer</h1>");
    expect(html).toContain("No Liability for Client Operations</h2>");
    expect(html).toContain('aria-labelledby="client-operations-title"');
  });

  it("keeps the Disclaimer accessible through the footer legal links", () => {
    const html = renderToStaticMarkup(React.createElement(Footer));
    expect(html).toContain('href="/disclaimer">Disclaimer</a>');
    expect(html).toContain('href="/terms">Terms of Service</a>');
  });
});
