import { z } from "zod";

/**
 * Public environment module — safe to import from browser bundles and the Edge
 * middleware. Only NEXT_PUBLIC_* values may be read here; server-only values
 * live in lib/env.server.ts and must never be referenced from this file.
 */

export type PublicSupabaseEnv = { url: string; anonKey: string };

const PLACEHOLDER_MARKER = "REPLACE_WITH";
const DEFAULT_SITE_URL = "http://localhost:3000";

function isPlaceholder(value: string): boolean {
  return value.includes(PLACEHOLDER_MARKER);
}

export function parseSiteUrl(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "" || isPlaceholder(raw)) {
    return DEFAULT_SITE_URL;
  }
  const parsed = z.url().safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid NEXT_PUBLIC_SITE_URL: "${raw}"`);
  }
  return parsed.data.replace(/\/+$/, "");
}

export function parsePublicSupabaseEnv(
  source: Record<string, string | undefined>,
): PublicSupabaseEnv | null {
  const url = source.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const urlMissing = url === "" || isPlaceholder(url);
  const keyMissing = anonKey === "" || isPlaceholder(anonKey);

  if (urlMissing && keyMissing) {
    return null;
  }
  if (urlMissing || keyMissing) {
    throw new Error(
      "Supabase environment is partially configured: set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to real values.",
    );
  }
  const parsedUrl = z.url().safeParse(url);
  if (!parsedUrl.success) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}"`);
  }
  return { url, anonKey };
}

export const siteUrl = parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
// The two names MUST be read as literal `process.env.X` expressions here: the
// bundler only inlines NEXT_PUBLIC_* values for static property access, so
// handing it the whole `process.env` object left the browser bundle with no
// credentials at all ("Supabase is not configured" on Google sign-in).
export const supabasePublicEnv = parsePublicSupabaseEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
export const isSupabaseConfigured = supabasePublicEnv !== null;

export function requirePublicSupabaseEnv(): PublicSupabaseEnv {
  if (!supabasePublicEnv) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in the Supabase values.",
    );
  }
  return supabasePublicEnv;
}
