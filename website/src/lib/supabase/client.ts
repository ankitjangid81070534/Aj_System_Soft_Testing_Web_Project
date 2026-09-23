import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabasePublicEnv } from "@/lib/env";

/**
 * Browser client using the anon key. Every query is subject to RLS.
 */
export function createSupabaseBrowserClient() {
  if (!supabasePublicEnv) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in the Supabase values.",
    );
  }
  return createBrowserClient<Database>(supabasePublicEnv.url, supabasePublicEnv.anonKey);
}

/**
 * Same anon credentials without the generated Database generic — used by the
 * realtime chat, whose tables (migration 0021) are not in the generated types.
 * RLS still scopes every read/write to the signed-in user.
 */
export function createSupabaseBrowserLooseClient() {
  if (!supabasePublicEnv) {
    throw new Error("Supabase is not configured.");
  }
  return createBrowserClient(supabasePublicEnv.url, supabasePublicEnv.anonKey);
}
