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
