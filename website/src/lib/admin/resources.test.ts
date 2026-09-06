import { describe, expect, it } from "vitest";
import {
  RESOURCES,
  buildResourceSchema,
  isSafeInternalPath,
  isSafeNavigationTarget,
} from "@/lib/admin/resources";

describe("admin resource persistence schemas", () => {
  it("only sends actor columns to tables that physically own them", () => {
    expect(
      Object.entries(RESOURCES)
        .filter(([, config]) => config.actorColumns)
        .map(([key]) => key),
    ).toEqual([
      "services",
      "clients",
      "projects",
      "team",
      "testimonials",
      "posts",
      "payments",
      "ai-methods",
      "seo",
    ]);
  });

  it("accepts internal or HTTPS navigation and rejects executable schemes", () => {
    expect(isSafeNavigationTarget("/services")).toBe(true);
    expect(isSafeNavigationTarget("https://example.com/path")).toBe(true);
    expect(isSafeNavigationTarget("javascript:alert(1)")).toBe(false);
    expect(isSafeNavigationTarget("//evil.example")).toBe(false);
  });

  it("keeps redirects internal and rejects direct loops", () => {
    expect(isSafeInternalPath("/old-page")).toBe(true);
    expect(isSafeInternalPath("//evil.example")).toBe(false);

    const schema = buildResourceSchema(RESOURCES.redirects);
    expect(schema.safeParse({ from_path: "/old", to_path: "/new", is_active: true }).success).toBe(
      true,
    );
    const loop = schema.safeParse({ from_path: "/same", to_path: "/same", is_active: true });
    expect(loop.success).toBe(false);
    if (!loop.success) expect(loop.error.flatten().fieldErrors.to_path).toBeDefined();
  });

  it("validates optional client auth UUIDs before they reach Postgres", () => {
    const schema = buildResourceSchema(RESOURCES.clients);
    const base = {
      name: "Test Client",
      slug: "test-client",
      auth_user_id: "not-a-uuid",
      status: "draft",
    };
    expect(schema.safeParse(base).success).toBe(false);
    expect(schema.safeParse({ ...base, auth_user_id: "" }).success).toBe(true);
  });

  it("requires secure external payment links", () => {
    const schema = buildResourceSchema(RESOURCES.payments);
    expect(schema.safeParse({ title: "Invoice", url: "http://gateway.test" }).success).toBe(false);
    expect(schema.safeParse({ title: "Invoice", url: "https://gateway.test" }).success).toBe(true);
  });

  it("requires secure AI method links", () => {
    const schema = buildResourceSchema(RESOURCES["ai-methods"]);
    expect(
      schema.safeParse({ title: "ChatGPT", url: "http://tool.test" }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ title: "ChatGPT", url: "https://chat.openai.com" }).success,
    ).toBe(true);
  });
});
