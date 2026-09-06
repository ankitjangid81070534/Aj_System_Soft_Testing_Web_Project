import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, type ButtonProps } from "./Button";
import { SocialLinks, socialPlatform } from "./SocialLinks";

const render = renderToStaticMarkup;
const renderButton = (props: ButtonProps) => render(createElement(Button, props));
describe("reference action presentation", () => {
  it("retains submit semantics and exposes pending state", () => {
    const html = renderButton({ type: "submit", loading: true, children: "Save changes" });
    expect(html).toContain('type="submit"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Save changes");
  });
  it("keeps supplied icons without adding a duplicate", () => {
    const html = renderButton({ children: [createElement("svg", { key: "icon", "aria-hidden": true }), "Send"] });
    expect(html.match(/<svg/g)).toHaveLength(1);
  });
  it("adds a decorative save icon to a text action", () => {
    const html = renderButton({ children: "Save changes" });
    expect(html).toContain("lucide-save");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-tone="success"');
  });
  it("protects external new-tab links even when a rel prop is supplied", () => {
    const html = renderButton({ href: "https://example.org/project", rel: "opener", children: "View project" });
    expect(html).toContain('href="https://example.org/project"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

describe("CMS social icon presentation", () => {
  const platforms = ["whatsapp", "instagram", "youtube", "linkedin", "facebook", "x", "github", "telegram", "website"];
  it.each(platforms)("renders the %s platform with its configured destination", platform => {
    const html = render(createElement(SocialLinks, { links: [{ platform, label: "Our profile", url: `https://example.org/${platform}` }] }));
    expect(html).toContain(`data-platform="${platform}"`);
    expect(html).toContain(`href="https://example.org/${platform}"`);
    expect(html).toContain('aria-label="Our profile (opens in a new tab)"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html.match(/<svg/g)).toHaveLength(1);
  });
  it("renders nothing when no social links are configured", () => {
    expect(render(createElement(SocialLinks, { links: [] }))).toBe("");
  });
  it("uses a readable platform label when the optional CMS label is blank", () => {
    expect(render(createElement(SocialLinks, { links: [{ platform: "instagram", label: "  ", url: "https://instagram.com/example" }] }))).toContain('aria-label="Instagram (opens in a new tab)"');
  });
  it("recognizes legacy URLs without a platform and rejects lookalike hosts", () => {
    expect(socialPlatform({ label: "Profile", url: "https://twitter.com/example" })).toBe("x");
    expect(socialPlatform({ label: "Profile", url: "https://instagram.com.evil.example" })).toBe("website");
  });
});
