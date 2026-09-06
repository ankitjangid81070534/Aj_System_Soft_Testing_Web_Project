import "server-only";

/**
 * Server-only environment module. The "server-only" import makes any attempt
 * to bundle this into client code fail the build.
 */

const PLACEHOLDER_MARKER = "REPLACE_WITH";

export function requireSupabaseServiceRoleKey(): string {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (raw === "" || raw.includes(PLACEHOLDER_MARKER)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Set it in .env.local — it is server-only and must never be exposed to the browser.",
    );
  }
  return raw;
}
