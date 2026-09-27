import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, KeyRound, Pause, Play, PlugZap, Trash2, TriangleAlert, Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { configuredProviders } from "@/lib/ai/providers";
import { PROVIDER_LABELS } from "@/lib/ai/providers.shared";
import {
  addAiProviderAction,
  deleteAiProviderAction,
  testAiProviderAction,
  toggleAiProviderAction,
  updateAiProviderPriorityAction,
} from "@/lib/admin/ai-provider-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — AI providers" },
  robots: { index: false, follow: false },
};

const PRESETS = [
  { name: "OpenRouter", url: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini", site: "https://openrouter.ai/keys" },
  { name: "AgentRouter", url: "https://agentrouter.org/v1", model: "gpt-4o-mini", site: "https://agentrouter.org" },
  { name: "Groq", url: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", site: "https://console.groq.com/keys" },
  { name: "Google Gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash", site: "https://aistudio.google.com/apikey" },
  { name: "OpenAI", url: "https://api.openai.com/v1", model: "gpt-4.1-mini", site: "https://platform.openai.com/api-keys" },
  { name: "DeepSeek", url: "https://api.deepseek.com/v1", model: "deepseek-chat", site: "https://platform.deepseek.com" },
  { name: "Mistral", url: "https://api.mistral.ai/v1", model: "mistral-small-latest", site: "https://console.mistral.ai" },
  { name: "Together AI", url: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", site: "https://api.together.ai" },
];

type Row = {
  id: string; label: string; base_url: string; model: string; key_hint: string;
  priority: number; is_active: boolean; last_status: string | null; last_checked_at: string | null;
};

const card = "rounded-2xl border border-line bg-surface p-5 shadow-e1";
const input = "ui-field w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink focus-ring";
const iconBtn = "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas-raised focus-ring";

export default async function AiProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "settings:write")) redirect("/ajadmin");
  const params = await searchParams;

  let rows: Row[] = [];
  let missingTable = false;
  if (isSupabaseConfigured) {
    const { data, error } = await createSupabaseAdminLooseClient()
      .from("ai_provider_keys")
      .select("id, label, base_url, model, key_hint, priority, is_active, last_status, last_checked_at")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) missingTable = error.code === "42P01" || error.code === "PGRST205";
    rows = (data as Row[] | null) ?? [];
  }
  const builtIn = configuredProviders();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">AI tools</p>
      <h1 className="mt-1 text-3xl text-ink">AI providers &amp; API keys</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
        Add keys from OpenRouter, AgentRouter, Groq or any OpenAI-compatible provider. Every AI tool tries
        active providers in priority order (lowest number first) and automatically switches to the next one
        when a key fails, hits a limit or is slow — customers only see the working answer.
      </p>

      {params.ok && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {params.ok}
        </p>
      )}
      {(params.error || missingTable) && (
        <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          {params.error ?? "Run migration 0023_ai_provider_keys.sql in the Supabase SQL editor to enable this page."}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <form action={addAiProviderAction} className={`${card} flex flex-col gap-4`}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <KeyRound className="h-5 w-5 text-brand-600" aria-hidden="true" /> Add a provider
          </h2>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Name
            <input name="label" required maxLength={80} list="ai-preset-names" placeholder="e.g. OpenRouter free" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Base URL
            <input name="base_url" type="url" required list="ai-preset-urls" placeholder="https://openrouter.ai/api/v1" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Model
            <input name="model" required maxLength={200} list="ai-preset-models" placeholder="openai/gpt-4o-mini" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            API key
            <input name="api_key" type="password" required autoComplete="off" placeholder="sk-…" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Priority <span className="text-xs font-normal text-ink-muted">Lower runs first</span>
            <input name="priority" type="number" defaultValue={100} min={0} max={9999} className={input} />
          </label>
          <datalist id="ai-preset-names">{PRESETS.map((p) => <option key={p.name} value={p.name} />)}</datalist>
          <datalist id="ai-preset-urls">{PRESETS.map((p) => <option key={p.url} value={p.url}>{p.name}</option>)}</datalist>
          <datalist id="ai-preset-models">{PRESETS.map((p) => <option key={p.model} value={p.model}>{p.name}</option>)}</datalist>
          <button type="submit" className="action-control inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white focus-ring">
            <PlugZap className="h-4 w-4" aria-hidden="true" /> Save provider
          </button>
          <p className="text-xs leading-5 text-ink-muted">Keys are encrypted before saving and never shown again.</p>
        </form>

        <div className="flex flex-col gap-4">
          <div className={card}>
            <h2 className="text-lg font-semibold text-ink">Your providers ({rows.length})</h2>
            {rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">No custom providers yet — add one on the left.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {rows.map((row) => (
                  <li key={row.id} className="rounded-xl border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold text-ink">
                          <span className={`h-2 w-2 rounded-full ${row.is_active ? (row.last_status && row.last_status !== "ok" ? "bg-warning" : "bg-success") : "bg-line-strong"}`} aria-hidden="true" />
                          {row.label}
                          {!row.is_active && <span className="text-xs font-normal text-ink-muted">(paused)</span>}
                        </p>
                        <p className="mt-1 truncate text-xs text-ink-muted" title={row.base_url}>{row.base_url}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">Model <span className="text-ink">{row.model}</span> · Key {row.key_hint}</p>
                        {row.last_checked_at && (
                          <p className={`mt-1 text-xs ${row.last_status === "ok" ? "text-success" : "text-warning"}`}>
                            Last test: {row.last_status === "ok" ? "working" : row.last_status}
                          </p>
                        )}
                      </div>
                      <form action={updateAiProviderPriorityAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={row.id} />
                        <label className="sr-only" htmlFor={`p-${row.id}`}>Priority</label>
                        <input id={`p-${row.id}`} name="priority" type="number" defaultValue={row.priority} className="w-20 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink" />
                        <button type="submit" className={iconBtn}>Set</button>
                      </form>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={testAiProviderAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className={iconBtn}><Zap className="h-3.5 w-3.5" aria-hidden="true" /> Test</button>
                      </form>
                      <form action={toggleAiProviderAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="active" value={String(row.is_active)} />
                        <button type="submit" className={iconBtn}>
                          {row.is_active ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                          {row.is_active ? "Pause" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteAiProviderAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className={`${iconBtn} text-danger`}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className="text-lg font-semibold text-ink">Built-in fallback keys</h2>
            <p className="mt-1 text-sm text-ink-muted">Used automatically after your providers above.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(["openai", "anthropic", "google"] as const).map((p) => (
                <li key={p} className={`rounded-full px-3 py-1 text-xs font-medium ${builtIn.includes(p) ? "bg-success-soft text-success" : "bg-canvas text-ink-muted"}`}>
                  {PROVIDER_LABELS[p]} · {builtIn.includes(p) ? "set" : "not set"}
                </li>
              ))}
            </ul>
          </div>

          <div className={card}>
            <h2 className="text-lg font-semibold text-ink">Where to get keys</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {PRESETS.map((p) => (
                <li key={p.name} className="rounded-xl border border-line bg-canvas p-3 text-xs">
                  <a href={p.site} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">{p.name} ↗</a>
                  <p className="mt-1 break-all text-ink-muted">{p.url}</p>
                  <p className="text-ink-muted">e.g. {p.model}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
