import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
  it("joins truthy class names with spaces", () => {
    expect(cn("a", "b c", "d")).toBe("a b c d");
  });

  it("skips false, null and undefined", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
