import { describe, expect, it } from "vitest";
import { formatDateTime, fromBusinessInputValue, toBusinessInputValue } from "./datetime";
import { buildResourceSchema, RESOURCES, slugify } from "@/lib/admin/resources";

describe("business time zone", () => {
  it("formats UTC timestamps in India time", () => {
    expect(formatDateTime("2026-09-23T16:23:00Z")).toMatch(/9:53\s*pm/i);
  });

  it("round-trips a datetime-local value without shifting", () => {
    const stored = "2026-09-23T16:23:00.000Z";
    const local = toBusinessInputValue(stored);
    expect(local).toBe("2026-09-23T21:53");
    expect(new Date(fromBusinessInputValue(local)).toISOString()).toBe(stored);
  });

  it("keeps values that already carry an offset", () => {
    expect(fromBusinessInputValue("2026-09-23T16:23:00Z")).toBe("2026-09-23T16:23:00Z");
  });
});

describe("slug input", () => {
  it("normalises free text instead of rejecting it", () => {
    expect(slugify("My New Post!")).toBe("my-new-post");
    expect(slugify("  Café  Menu__2026 ")).toBe("cafe-menu-2026");
    const parsed = buildResourceSchema(RESOURCES.tags).safeParse({ name: "X", slug: "Hello World" });
    expect(parsed.success && parsed.data.slug).toBe("hello-world");
  });
});
