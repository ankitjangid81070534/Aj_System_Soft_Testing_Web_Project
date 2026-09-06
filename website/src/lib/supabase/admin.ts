import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requirePublicSupabaseEnv } from "@/lib/env";
import { requireSupabaseServiceRoleKey } from "@/lib/env.server";

/**
 * Service-role client: bypasses RLS. Server-only (guarded by "server-only").
 * Use only for trusted server operations; ordinary content reads must go
 * through the RLS-bound clients so policies stay the single source of truth.
 */
export function createSupabaseAdminClient() {
  const { url } = requirePublicSupabaseEnv();
  const serviceRoleKey = requireSupabaseServiceRoleKey();
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Same service-role credentials, but without the Database generic: used ONLY
 * by the generic admin CRUD layer, where the table name is dynamic and every
 * payload is allow-listed by a per-resource Zod schema before it reaches the
 * database. Server actions calling this must have already verified the
 * caller's role via lib/auth/permissions.
 */
export function createSupabaseAdminLooseClient() {
  const { url } = requirePublicSupabaseEnv();
  const serviceRoleKey = requireSupabaseServiceRoleKey();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
