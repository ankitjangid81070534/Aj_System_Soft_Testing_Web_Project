import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requirePublicSupabaseEnv } from "@/lib/env";

/**
 * Server client bound to the request cookie store, for Server Components,
 * Server Actions and Route Handlers. Uses the anon key — every query is
 * subject to RLS.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Cookie writes from a Server Component render are handled by the
          // proxy session refresh instead of throwing.
        }
      },
    },
  });
}

/**
 * Request-session client without the generated Database generic. This is for
 * the schema-driven admin CMS where table names are dynamic. It still uses the
 * public key plus the signed-in user's cookies, so every operation is checked
 * by Supabase RLS and audit triggers receive the real auth.uid().
 */
export async function createSupabaseServerLooseClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies; the proxy refreshes them.
        }
      },
    },
  });
}
