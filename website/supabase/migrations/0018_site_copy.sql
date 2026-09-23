-- ============================================================================
-- 0018 — Editable website copy (site_copy)
--
-- Run this in the Supabase SQL editor (or `supabase db push`). Afterwards the
-- admin gains one new module:
--   * /ajadmin/copy  → public.site_copy
-- where every homepage heading, eyebrow, lead paragraph, button label and list
-- can be edited and saved. The public site reads the saved value and falls back
-- to the built-in default text for any key the admin has never touched, so the
-- website keeps working exactly as today until something is edited.
--
-- SAFETY CONTRACT (same as 0016 / 0017)
--   * Purely additive and idempotent: CREATE IF NOT EXISTS + DROP POLICY IF
--     EXISTS / CREATE POLICY. Nothing is dropped, truncated or rewritten.
--     Re-running is safe.
--   * RLS enabled. Public (anon) may only READ. Writes flow through the
--     role-checked admin server action using the service role.
--   * No seed rows: defaults live in the application code
--     (`src/lib/data/site-copy.ts`), so the site never shows stale text and
--     admin edits are never overwritten by a re-run.
-- ============================================================================

create table if not exists public.site_copy (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_copy enable row level security;

drop policy if exists "site_copy_public_read" on public.site_copy;
create policy "site_copy_public_read" on public.site_copy
  for select to anon, authenticated using (true);

drop policy if exists "site_copy_admin_write" on public.site_copy;
create policy "site_copy_admin_write" on public.site_copy
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

drop trigger if exists site_copy_set_updated_at on public.site_copy;
create trigger site_copy_set_updated_at
  before update on public.site_copy
  for each row execute function public.set_updated_at();

drop trigger if exists audit_site_copy on public.site_copy;
create trigger audit_site_copy after insert or update or delete on public.site_copy
  for each row execute function public.audit_row_change();
