import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { isRateLimited, type RateLimitOptions } from "@/lib/rate-limit";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";

const DEFAULTS: RateLimitOptions = { windowMs: 10 * 60 * 1000, max: 8 };

/**
 * Rate limit shared across server instances (Supabase RPC from migration 0026).
 * The in-memory limiter always runs first, so protection is never weaker than
 * before; if the RPC is missing or fails, the in-memory result is used alone.
 */
export async function isRateLimitedShared(
  key: string,
  options: RateLimitOptions = DEFAULTS,
): Promise<boolean> {
  if (isRateLimited(key, options)) return true;
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error } = await createSupabaseAdminLooseClient().rpc("ajsystemsoft_in_rate_limit_hit", {
      p_key: key,
      p_window_seconds: Math.ceil(options.windowMs / 1000),
      p_max: options.max,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}
