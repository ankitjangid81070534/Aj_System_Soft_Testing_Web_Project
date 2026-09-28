-- ============================================================================
-- 0024 — Admin-managed extra links for the site-wide "Let's talk" ContactHub.
--   * /ajadmin/c/hub-links → public.contact_hub_links
-- SAFETY: purely additive and idempotent (IF NOT EXISTS / DROP ... IF EXISTS).
-- Nothing existing is dropped or rewritten; re-running is safe. No seed rows.
-- Public (anon) reads only active rows; writes go through role-checked admin
-- server actions using the service role.
-- ============================================================================

create table if not exists public.contact_hub_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text not null default 'link',
  open_new_tab boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_hub_links_active_order_idx
  on public.contact_hub_links (is_active, sort_order);

alter table public.contact_hub_links enable row level security;

drop policy if exists "contact_hub_links_public_read" on public.contact_hub_links;
create policy "contact_hub_links_public_read" on public.contact_hub_links
  for select to anon, authenticated using (is_active = true);

drop policy if exists "contact_hub_links_admin_read" on public.contact_hub_links;
create policy "contact_hub_links_admin_read" on public.contact_hub_links
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "contact_hub_links_admin_write" on public.contact_hub_links;
create policy "contact_hub_links_admin_write" on public.contact_hub_links
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

grant select on public.contact_hub_links to anon, authenticated;
grant all on public.contact_hub_links to service_role;

drop trigger if exists contact_hub_links_set_updated_at on public.contact_hub_links;
create trigger contact_hub_links_set_updated_at
  before update on public.contact_hub_links
  for each row execute function public.set_updated_at();

drop trigger if exists audit_contact_hub_links on public.contact_hub_links;
create trigger audit_contact_hub_links after insert or update or delete on public.contact_hub_links
  for each row execute function public.audit_row_change();
