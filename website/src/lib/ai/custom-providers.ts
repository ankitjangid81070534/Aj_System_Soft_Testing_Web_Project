import "server-only";

import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { decryptSecret, isEncryptionConfigured } from "@/lib/security/crypto";

/**
 * Admin-managed, OpenAI-compatible endpoints (migration 0023). Loaded with a
 * short in-memory cache so tool runs never wait on the database, and a key
 * that just failed is parked briefly so the next customer skips it instantly.
 */
export type CustomProvider = { id: string; label: string; baseUrl: string; model: string; key: string };

const CACHE_MS = 30_000;
const COOLDOWN_MS = 90_000;
let cache: { at: number; rows: CustomProvider[] } | null = null;
const cooldown = new Map<string, number>();

export function invalidateCustomProviders() {
  cache = null;
}

export function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "").replace(/\/chat\/completions$/, "");
}

async function load(): Promise<CustomProvider[]> {
  if (!isSupabaseConfigured || !isEncryptionConfigured()) return [];
  try {
    const { data, error } = await createSupabaseAdminLooseClient()
      .from("ai_provider_keys")
      .select("id, label, base_url, model, api_key_encrypted")
      .eq("is_active", true)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as Record<string, string>[]).flatMap((row) => {
      const key = decryptSecret(row.api_key_encrypted);
      return key ? [{ id: row.id, label: row.label, baseUrl: normalizeBaseUrl(row.base_url), model: row.model, key }] : [];
    });
  } catch {
    return [];
  }
}

/** Active custom providers in priority order, cooled-down ones moved last. */
export async function activeCustomProviders(): Promise<CustomProvider[]> {
  if (!cache || Date.now() - cache.at > CACHE_MS) cache = { at: Date.now(), rows: await load() };
  const now = Date.now();
  const ready = cache.rows.filter((p) => (cooldown.get(p.id) ?? 0) < now);
  const parked = cache.rows.filter((p) => (cooldown.get(p.id) ?? 0) >= now);
  return [...ready, ...parked];
}

export function markCustomProviderFailed(id: string) {
  cooldown.set(id, Date.now() + COOLDOWN_MS);
}

export function markCustomProviderOk(id: string) {
  cooldown.delete(id);
}
