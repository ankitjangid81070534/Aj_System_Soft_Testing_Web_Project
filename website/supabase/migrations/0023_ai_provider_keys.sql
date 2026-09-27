-- 0023 — Admin-managed AI provider keys (OpenRouter, AgentRouter, Groq, any
-- OpenAI-compatible endpoint). Additive + idempotent. Keys are stored
-- AES-256-GCM encrypted by the server (DATA_ENCRYPTION_KEY); only the service
-- role can read or write this table.

create table if not exists public.ai_provider_keys (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 80),
  base_url text not null check (char_length(base_url) between 8 and 300),
  model text not null check (char_length(model) between 1 and 200),
  api_key_encrypted text not null,
  key_hint text not null default '',
  priority integer not null default 100,
  is_active boolean not null default true,
  last_status text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ai_provider_keys_priority_idx on public.ai_provider_keys (is_active, priority);

alter table public.ai_provider_keys enable row level security;
revoke all on public.ai_provider_keys from anon, authenticated;
grant all on public.ai_provider_keys to service_role;
