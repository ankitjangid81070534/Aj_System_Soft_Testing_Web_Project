import { describe, expect, it } from "vitest";
import { getContactHubActions, safeContactDestination, showsContactHub } from "./contact-hub";

const empty = { phone: null, whatsapp: null, contactEmail: null, globalCtaHref: "", globalCtaLabel: "" };

describe("contact hub actions", () => {
  it("keeps honest existing destinations without configured contacts or AI", () => {
    expect(getContactHubActions(null)).toEqual([
      { kind: "project", label: "Start Your Project", href: "/request-quote" },
      { kind: "contact", label: "Discuss your project", href: "/contact#consultation" },
    ]);
  });
  it("uses only validated settings for direct channels", () => {
    const actions = getContactHubActions({ ...empty, phone: "+1 (202) 555-0100", whatsapp: "+1 202 555 0100", contactEmail: "test@example.invalid" });
    expect(actions.slice(0, 3).map((a) => a.href)).toEqual(["https://wa.me/12025550100", "tel:+12025550100", "mailto:test@example.invalid"]);
  });
  it.each(["", "call 12345678", "123", "1234567890123456", "+12345678;ext=9", "javascript:12345678"])("hides malformed phone values: %s", (value) => {
    expect(getContactHubActions({ ...empty, phone: value, whatsapp: value }).some((a) => a.kind === "phone" || a.kind === "whatsapp")).toBe(false);
  });
  it.each(["", "not email", "a@b", "a@example.com?subject=hello", "a@example.com\nBcc:x@y.com"])("hides malformed email: %s", (contactEmail) => {
    expect(getContactHubActions({ ...empty, contactEmail }).some((a) => a.kind === "email")).toBe(false);
  });
  it("encodes email local parts without introducing headers or fragments", () => {
    expect(getContactHubActions({ ...empty, contactEmail: "a#b@example.com" })[0].href).toBe("mailto:a%23b@example.com");
  });
  it("retains a distinct configured CTA and suppresses duplicate quote destinations", () => {
    expect(getContactHubActions({ ...empty, globalCtaHref: "/services", globalCtaLabel: "Explore services" }).map((a) => a.label)).toEqual(["Explore services", "Request Quote", "Discuss your project"]);
    expect(getContactHubActions({ ...empty, globalCtaHref: "/request-quote/" }).filter((a) => a.kind === "quote")).toHaveLength(0);
    expect(getContactHubActions({ ...empty, globalCtaHref: "/contact#consultation" }).filter((a) => a.kind === "contact")).toHaveLength(0);
  });
  it("invalid destinations fall back with an accurate default label", () => {
    expect(getContactHubActions({ ...empty, globalCtaHref: "//bad.example", globalCtaLabel: "Different action" })[0].label).toBe("Start Your Project");
  });
});

describe("hub URL boundary", () => {
  it.each(["//example.com", "/\\example.com", "javascript:alert(1)", "http://example.com", "https://user:pass@example.com", "https://", "/foo\nbar", "data:text/html,test"])("rejects %s", (value) => expect(safeContactDestination(value)).toBeNull());
  it.each(["/services", "/contact#consultation", "https://example.com/path"])("accepts %s", (value) => expect(safeContactDestination(value)).toBe(value));
});

describe("public discovery scope", () => {
  it.each(["/", "/services", "/services/custom-software", "/projects", "/blog/example", "/about", "/team", "/reviews", "/ai-methods"])("allows %s", (path) => expect(showsContactHub(path)).toBe(true));
  it.each(["/request-quote", "/contact", "/login", "/signup", "/account", "/account/profile", "/ajadmin", "/auth/callback", "/privacy", "/service-agreement", "/unknown", "/services/a/b"])("excludes %s", (path) => expect(showsContactHub(path)).toBe(false));
});
