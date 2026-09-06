import { describe, expect, it } from "vitest";
import { can, roleAtLeast, ROLE_LABELS } from "@/lib/auth/permissions";

describe("roleAtLeast", () => {
  it("orders roles super_admin > admin > editor > client", () => {
    expect(roleAtLeast("client", "client")).toBe(true);
    expect(roleAtLeast("editor", "client")).toBe(true);
    expect(roleAtLeast("editor", "editor")).toBe(true);
    expect(roleAtLeast("admin", "editor")).toBe(true);
    expect(roleAtLeast("super_admin", "admin")).toBe(true);
    expect(roleAtLeast("editor", "admin")).toBe(false);
    expect(roleAtLeast("client", "editor")).toBe(false);
    expect(roleAtLeast("admin", "super_admin")).toBe(false);
  });
});

describe("can — capability matrix mirrors the RLS policy plan", () => {
  it("clients manage only their own portal and review submissions", () => {
    expect(can("client", "portal:read")).toBe(true);
    expect(can("client", "reviews:write")).toBe(true);
    expect(can("client", "content:read")).toBe(false);
    expect(can("client", "leads:read")).toBe(false);
    expect(can("client", "settings:read")).toBe(false);
  });

  it("editors manage content and media but not leads/settings/users/audit", () => {
    expect(can("editor", "content:read")).toBe(true);
    expect(can("editor", "content:write")).toBe(true);
    expect(can("editor", "media:write")).toBe(true);
    expect(can("editor", "leads:read")).toBe(false);
    expect(can("editor", "settings:write")).toBe(false);
    expect(can("editor", "users:read")).toBe(false);
    expect(can("editor", "audit:read")).toBe(false);
  });

  it("admins manage content, leads and settings but not user roles", () => {
    expect(can("admin", "leads:manage")).toBe(true);
    expect(can("admin", "settings:write")).toBe(true);
    expect(can("admin", "audit:read")).toBe(true);
    expect(can("admin", "content:publish")).toBe(true);
    expect(can("admin", "users:read")).toBe(true);
    expect(can("admin", "users:manage")).toBe(false);
  });

  it("super admins hold every capability", () => {
    expect(can("super_admin", "users:manage")).toBe(true);
    expect(can("super_admin", "audit:read")).toBe(true);
    expect(can("super_admin", "settings:write")).toBe(true);
    expect(can("super_admin", "leads:manage")).toBe(true);
  });
});

describe("ROLE_LABELS", () => {
  it("uses the human-readable role names from the master spec", () => {
    expect(ROLE_LABELS.super_admin).toBe("Super Admin");
    expect(ROLE_LABELS.admin).toBe("Admin");
    expect(ROLE_LABELS.editor).toBe("Editor");
    expect(ROLE_LABELS.client).toBe("Client");
  });
});
