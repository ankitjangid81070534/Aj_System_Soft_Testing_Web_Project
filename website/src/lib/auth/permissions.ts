/**
 * Role/permission model — mirrored by the database RLS policies
 * (supabase/migrations/0001 and 0011). The client-side matrix is a UX helper; every
 * sensitive operation is still enforced server-side and by RLS.
 */

export const ROLES = ["super_admin", "admin", "editor", "client"] as const;
export type AppRole = (typeof ROLES)[number];

export const ROLE_RANK: Record<AppRole, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  client: 1,
};

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  client: "Client",
};

export function roleAtLeast(role: AppRole, minimum: AppRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export const CAPABILITIES = {
  super_admin: [
    "content:read",
    "content:write",
    "content:publish",
    "media:read",
    "media:write",
    "leads:read",
    "leads:manage",
    "settings:read",
    "settings:write",
    "users:read",
    "users:manage",
    "audit:read",
    "portal:read",
    "portal:write",
    "reviews:write",
  ],
  admin: [
    "content:read",
    "content:write",
    "content:publish",
    "media:read",
    "media:write",
    "leads:read",
    "leads:manage",
    "settings:read",
    "settings:write",
    "users:read",
    "audit:read",
    "portal:read",
    "portal:write",
    "reviews:write",
  ],
  editor: ["content:read", "content:write", "media:read", "media:write"],
  client: ["portal:read", "portal:write", "reviews:write"],
} as const satisfies Record<AppRole, readonly string[]>;

export type Capability = (typeof CAPABILITIES)[AppRole][number];

export function can(role: AppRole, capability: Capability): boolean {
  return (CAPABILITIES[role] as readonly string[]).includes(capability);
}
