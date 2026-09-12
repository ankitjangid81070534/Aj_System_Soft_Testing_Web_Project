import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", props, children),
}));

const legalNotice =
  "© 2026 Ankit System Soft Technology. All rights reserved. | An MSME Registered Enterprise | Udyam Reg No: UDYAM-RJ-17-0685557";

describe("footer legal notice", () => {
  beforeEach(() => vi.stubGlobal("React", React));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders the supplied legal name and identifier without a certificate embed", () => {
    const html = renderToStaticMarkup(React.createElement(Footer));
    expect(html).toContain(legalNotice);
    expect(html).not.toMatch(/<(?:iframe|embed|object)\b/);
    expect(html).toContain('href="/request-quote"');
  });

  it("keeps the requested official year independent of the current date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    expect(renderToStaticMarkup(React.createElement(Footer))).toContain(legalNotice);
  });
});
