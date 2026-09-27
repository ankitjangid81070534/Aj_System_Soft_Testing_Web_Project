"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret, isEncryptionConfigured } from "@/lib/security/crypto";
import { invalidateCustomProviders, normalizeBaseUrl } from "@/lib/ai/custom-providers";
import { runOpenaiCompatible } from "@/lib/ai/providers";

const PAGE = "/ajadmin/ai-providers";

function back(kind: "ok" | "error", message: string): never {
  redirect(`${PAGE}?${kind}=${encodeURIComponent(message)}`);
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "settings:write")) back("error", "Your role cannot manage AI providers.");
}

function text(formData: FormData, name: string, max: number): string {
  const raw = formData.get(name);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

function tableMissing(code?: string) {
  return code === "42P01" || code === "PGRST205";
}

export async function addAiProviderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  if (!isEncryptionConfigured()) back("error", "DATA_ENCRYPTION_KEY is not configured.");

  const label = text(formData, "label", 80);
  const baseUrl = normalizeBaseUrl(text(formData, "base_url", 300));
  const model = text(formData, "model", 200);
  const apiKey = text(formData, "api_key", 500);
  const priority = Number.parseInt(text(formData, "priority", 6) || "100", 10);

  if (!label || !model || !apiKey) back("error", "Name, model and API key are required.");
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:") throw new Error();
  } catch {
    back("error", "Base URL must be a valid https:// address.");
  }

  const { error } = await createSupabaseAdminLooseClient().from("ai_provider_keys").insert({
    label,
    base_url: baseUrl,
    model,
    api_key_encrypted: encryptSecret(apiKey),
    key_hint: `…${apiKey.slice(-4)}`,
    priority: Number.isFinite(priority) ? priority : 100,
  });
  if (error) back("error", tableMissing(error.code) ? "Run migration 0023_ai_provider_keys.sql in Supabase first." : "Could not save the provider.");
  invalidateCustomProviders();
  back("ok", `${label} added. Use “Test” to confirm it responds.`);
}

export async function toggleAiProviderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id", 64);
  const active = text(formData, "active", 5) === "true";
  const { error } = await createSupabaseAdminLooseClient().from("ai_provider_keys").update({ is_active: !active }).eq("id", id);
  if (error) back("error", "Could not update the provider.");
  invalidateCustomProviders();
  back("ok", active ? "Provider paused." : "Provider enabled.");
}

export async function updateAiProviderPriorityAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id", 64);
  const priority = Number.parseInt(text(formData, "priority", 6), 10);
  if (!Number.isFinite(priority)) back("error", "Priority must be a number.");
  const { error } = await createSupabaseAdminLooseClient().from("ai_provider_keys").update({ priority }).eq("id", id);
  if (error) back("error", "Could not update the priority.");
  invalidateCustomProviders();
  back("ok", "Priority updated.");
}

export async function deleteAiProviderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id", 64);
  const { error } = await createSupabaseAdminLooseClient().from("ai_provider_keys").delete().eq("id", id);
  if (error) back("error", "Could not delete the provider.");
  invalidateCustomProviders();
  back("ok", "Provider deleted.");
}

export async function testAiProviderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id", 64);
  const admin = createSupabaseAdminLooseClient();
  const { data } = await admin
    .from("ai_provider_keys")
    .select("label, base_url, model, api_key_encrypted")
    .eq("id", id)
    .maybeSingle();
  const row = data as Record<string, string> | null;
  const key = row ? decryptSecret(row.api_key_encrypted) : null;
  if (!row || !key) back("error", "Provider not found or key unreadable.");

  let status = "ok";
  try {
    const reply = await runOpenaiCompatible(row.base_url, key, row.model, {
      system: "You are a health check.",
      prompt: "Reply with the single word: OK",
      maxTokens: 10,
    }, 25_000);
    if (!reply) status = "empty reply";
  } catch (error) {
    status = error instanceof Error ? error.message : "unreachable";
  }
  await admin.from("ai_provider_keys").update({ last_status: status, last_checked_at: new Date().toISOString() }).eq("id", id);
  back(status === "ok" ? "ok" : "error", status === "ok" ? `${row.label} is working.` : `${row.label}: ${status}`);
}
