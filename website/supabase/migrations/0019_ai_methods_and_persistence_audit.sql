-- ============================================================================
-- 0019 — AI Methods table + admin persistence audit
--
-- WHY THIS MIGRATION EXISTS
--   A full re-read of 0001 → 0018 found exactly one schema gap: the admin
--   module "AI Methods" (`/ajadmin` → resource `ai-methods`,
--   `src/lib/admin/resources.ts` → table `ai_methods`), the public page
--   `/ai-methods` and the reader `src/lib/data/ai-methods.ts` all use
--   `public.ai_methods`, but NO migration ever created that table (a known gap
--   recorded in AGENTS.md). Saving an AI Method from the admin therefore failed
--   with `42P01 relation "public.ai_methods" does not exist`, and the public
--   page always showed its empty state. This migration creates the table with
--   exactly the shape the generated types declare (`src/types/database.ts`).
--
--   It also re-asserts the helper triggers / grants used by the newest CMS
--   tables, so re-running the whole folder (0001 → 0019, in order) leaves the
--   database in the latest consistent state.
--
-- SAFETY CONTRACT (same as 0016 / 0017 / 0018)
--   * Purely ADDITIVE and IDEMPOTENT: `create table if not exists`,
--     `create index if not exists`, `drop policy if exists` + `create policy`,
--     `drop trigger if exists` + `create trigger`.
--   * Nothing is dropped, truncated, renamed or rewritten. No existing row is
--     touched, so every piece of admin data already saved in Supabase survives.
--   * RLS on: anon/authenticated may READ active rows only; admin writes flow
--     through the role-checked server action (service role).
--   * No seed rows — the admin owns this content, nothing is invented.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. ai_methods — the AI resource cards the admin manages.
--    Columns mirror `Database["public"]["Tables"]["ai_methods"]` exactly:
--    id, title, url, description, image_url, is_active, sort_order,
--    created_by, updated_by, created_at, updated_at.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_methods (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A database that hand-created this table keeps its rows; only missing columns
-- are added (never dropped, never re-typed).
alter table public.ai_methods add column if not exists description text;
alter table public.ai_methods add column if not exists image_url text;
alter table public.ai_methods add column if not exists is_active boolean not null default true;
alter table public.ai_methods add column if not exists sort_order integer not null default 0;
alter table public.ai_methods add column if not exists created_by uuid references public.profiles (id) on delete set null;
alter table public.ai_methods add column if not exists updated_by uuid references public.profiles (id) on delete set null;
alter table public.ai_methods add column if not exists created_at timestamptz not null default now();
alter table public.ai_methods add column if not exists updated_at timestamptz not null default now();

create index if not exists ai_methods_public_idx
  on public.ai_methods (is_active, sort_order);

alter table public.ai_methods enable row level security;

drop policy if exists "ai_methods_public_read" on public.ai_methods;
create policy "ai_methods_public_read" on public.ai_methods
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists "ai_methods_admin_read" on public.ai_methods;
create policy "ai_methods_admin_read" on public.ai_methods
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "ai_methods_admin_write" on public.ai_methods;
create policy "ai_methods_admin_write" on public.ai_methods
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- `actorColumns: true` in the admin resource relies on this trigger to stamp
-- created_by / updated_by / updated_at.
drop trigger if exists ai_methods_audit_columns on public.ai_methods;
create trigger ai_methods_audit_columns
  before insert or update on public.ai_methods
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_ai_methods on public.ai_methods;
create trigger audit_ai_methods after insert or update or delete on public.ai_methods
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- 2. site_copy safety net (0018).
--    Re-asserted so a database that skipped 0018 still gets the table the
--    /ajadmin/copy module writes to. Identical definition — re-running is safe
--    and saved copy is never overwritten.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 3. Grants — admin server actions use the service role (RLS bypass) but still
--    need table privileges; the public site reads as `anon`. Supabase grants
--    these by default; re-asserting keeps a restored database working.
-- ---------------------------------------------------------------------------
grant select on public.ai_methods to anon, authenticated;
grant select on public.site_copy to anon, authenticated;
grant all on public.ai_methods to service_role;
grant all on public.site_copy to service_role;

-- ---------------------------------------------------------------------------
-- 4. Post-migration self-check: fail loudly (instead of silently leaving an
--    admin module broken) if a table an admin module writes to is missing.
--    Extend this list whenever a new admin resource is added.
-- ---------------------------------------------------------------------------
do $$
declare
  v_missing text;
begin
  select string_agg(t.name, ', ')
    into v_missing
  from (values
    ('site_settings'), ('navigation_items'), ('page_sections'), ('seo_metadata'),
    ('redirects'), ('services'), ('service_faqs'), ('clients'), ('projects'),
    ('project_media'), ('team_members'), ('testimonials'), ('blog_categories'),
    ('blog_tags'), ('blog_posts'), ('blog_post_tags'), ('contact_submissions'),
    ('quote_requests'), ('appointment_requests'), ('payment_links'),
    ('media_assets'), ('audit_logs'), ('trusted_clients'), ('case_studies'),
    ('packages'), ('ai_methods'), ('site_copy')
  ) as t(name)
  where to_regclass('public.' || t.name) is null;

  if v_missing is not null then
    raise exception 'Admin tables still missing: % — run every migration 0001 → 0019 in order.', v_missing;
  end if;
end $$;

commit;
