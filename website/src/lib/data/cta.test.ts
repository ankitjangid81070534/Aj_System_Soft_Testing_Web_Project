import { describe, expect, it } from "vitest";
import { DEFAULT_CTA_HREF, DEFAULT_CTA_LABEL, sanitizeCta } from "@/lib/data/cta";

describe("sanitizeCta", () => {
  it("falls back when the admin saved a blank label (the empty header pill bug)", () => {
    expect(sanitizeCta("", "/request-quote")).toEqual({
      label: DEFAULT_CTA_LABEL,
      href: "/request-quote",
    });
    expect(sanitizeCta("   ", "").label).toBe(DEFAULT_CTA_LABEL);
  });

  it("keeps a real label and trims whitespace", () => {
    expect(sanitizeCta("  Book a call ", "/contact")).toEqual({
      label: "Book a call",
      href: "/contact",
    });
  });

  it("only accepts internal paths or https URLs as href", () => {
    expect(sanitizeCta("Go", "javascript:alert(1)").href).toBe(DEFAULT_CTA_HREF);
    expect(sanitizeCta("Go", "http://insecure.example").href).toBe(DEFAULT_CTA_HREF);
    expect(sanitizeCta("Go", "https://wa.me/910000000000").href).toBe("https://wa.me/910000000000");
    expect(sanitizeCta("Go", undefined).href).toBe(DEFAULT_CTA_HREF);
  });
});
