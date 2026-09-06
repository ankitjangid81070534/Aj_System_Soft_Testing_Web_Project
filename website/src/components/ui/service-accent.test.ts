import { describe, expect, it } from "vitest";
import { serviceAccent } from "./service-accent";

describe("semantic service surfaces", () => {
  it.each([
    ["ai-automation", "violet"],
    ["security-testing", "emerald"],
    ["cloud-deployment", "cyan"],
    ["ui-ux-design", "coral"],
    ["erp-business-software", "amber"],
    ["custom-software-development", "blue"],
    ["unknown-service", "blue"],
    ["web-application-development", "coral"],
    ["website-development", "amber"],
    ["ecommerce-development", "emerald"],
    ["windows-desktop", "violet"],
  ])("assigns %s a stable %s accent", (slug, accent) => {
    expect(serviceAccent(`/services/${slug}`)).toBe(accent);
  });
});
