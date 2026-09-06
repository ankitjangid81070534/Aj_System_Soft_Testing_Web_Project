import { describe, expect, it } from "vitest";
import { loginSchema, safeAdminPath } from "@/lib/validation/auth";

describe("loginSchema", () => {
  it("accepts a valid email and sufficiently long password", () => {
    const parsed = loginSchema.safeParse({
      email: "owner@ajs-technology.local",
      password: "correct-horse",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a username identifier and sufficiently long password", () => {
    const parsed = loginSchema.safeParse({
      identifier: "ankit",
      password: "correct-horse",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.identifier).toBe("ankit");
    }
  });

  it("rejects an empty identifier/email", () => {
    expect(loginSchema.safeParse({ email: " ", password: "correct-horse" }).success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      loginSchema.safeParse({ email: "owner@ajs-technology.local", password: "short" }).success,
    ).toBe(false);
  });
});

describe("safeAdminPath — open-redirect protection for ?next=", () => {
  it("keeps admin paths", () => {
    expect(safeAdminPath("/ajadmin/projects")).toBe("/ajadmin/projects");
    expect(safeAdminPath("/ajadmin")).toBe("/ajadmin");
  });

  it("forces non-admin paths back to the dashboard", () => {
    expect(safeAdminPath("https://evil.example")).toBe("/ajadmin");
    expect(safeAdminPath("/public")).toBe("/ajadmin");
    expect(safeAdminPath(undefined)).toBe("/ajadmin");
    expect(safeAdminPath(42)).toBe("/ajadmin");
  });

  it("blocks protocol-relative and backslash tricks", () => {
    expect(safeAdminPath("//evil.example")).toBe("/ajadmin");
    expect(safeAdminPath("/ajadmin//evil")).toBe("/ajadmin");
    expect(safeAdminPath("/ajadmin\\evil")).toBe("/ajadmin");
  });
});
