/**
 * Best-effort in-memory rate limiter. On serverless platforms this is per
 * instance only; the platform WAF / Supabase limits remain the real defense.
 * Shared by login, contact, quote and appointment submissions.
 */
const buckets = new Map<string, { count: number; firstAt: number }>();

export type RateLimitOptions = { windowMs: number; max: number };

const DEFAULTS: RateLimitOptions = { windowMs: 10 * 60 * 1000, max: 8 };

function prune(now: number, windowMs: number): void {
  for (const [key, entry] of buckets) {
    if (now - entry.firstAt > windowMs) buckets.delete(key);
  }
}

export function isRateLimited(key: string, options: RateLimitOptions = DEFAULTS): boolean {
  const now = Date.now();
  prune(now, options.windowMs);
  const entry = buckets.get(key);
  if (!entry || now - entry.firstAt > options.windowMs) {
    buckets.set(key, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > options.max;
}

/** Best-effort client IP from proxy headers; "unknown" when absent. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
