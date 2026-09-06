import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requirePublicSupabaseEnv } from "@/lib/env";

/**
 * Cookie-free anonymous client for published website content. Keeping public
 * reads independent from the visitor session lets Next.js cache/ISR the page
 * while Supabase RLS still limits access to public rows.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
