-- ============================================================================
-- 0007 — Leads, appointments, payment links, media assets, audit logs
-- Public visitors may only INSERT lead rows (never read). Leads/payments are
-- admin-domain; media library is staff-domain; audit logs are admin-read-only.
-- ============================================================================

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null default '',
  source_page text,
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_status_idx on public.contact_submissions (status, created_at);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_public_insert" on public.contact_submissions;
create policy "contact_submissions_public_insert" on public.contact_submissions
  for insert to anon, authenticated with check (true);

drop policy if exists "contact_submissions_admin_read" on public.contact_submissions;
create policy "contact_submissions_admin_read" on public.contact_submissions
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "contact_submissions_admin_update" on public.contact_submissions;
create policy "contact_submissions_admin_update" on public.contact_submissions
  for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- quote_requests
-- ---------------------------------------------------------------------------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text,
  email text not null,
  phone text,
  whatsapp text,
  location text,
  project_type text,
  platform text,
  industry text,
  budget_range text,
  timeline text,
  requirements text not null default '',
  attachment_url text,
  preferred_contact text not null default 'email' check (preferred_contact in ('email', 'phone', 'whatsapp')),
  consent boolean not null default false,
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_requests_status_idx on public.quote_requests (status, created_at);

alter table public.quote_requests enable row level security;

drop policy if exists "quote_requests_public_insert" on public.quote_requests;
create policy "quote_requests_public_insert" on public.quote_requests
  for insert to anon, authenticated with check (true);

drop policy if exists "quote_requests_admin_read" on public.quote_requests;
create policy "quote_requests_admin_read" on public.quote_requests
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "quote_requests_admin_update" on public.quote_requests;
create policy "quote_requests_admin_update" on public.quote_requests
  for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- appointment_requests (optional consultation booking)
-- ---------------------------------------------------------------------------
create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_date date,
  preferred_time text,
  topic text,
  message text not null default '',
  status public.lead_status not null default 'new',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointment_requests_status_idx on public.appointment_requests (status, created_at);

alter table public.appointment_requests enable row level security;

drop policy if exists "appointment_requests_public_insert" on public.appointment_requests;
create policy "appointment_requests_public_insert" on public.appointment_requests
  for insert to anon, authenticated with check (true);

drop policy if exists "appointment_requests_admin_read" on public.appointment_requests;
create policy "appointment_requests_admin_read" on public.appointment_requests
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "appointment_requests_admin_update" on public.appointment_requests;
create policy "appointment_requests_admin_update" on public.appointment_requests
  for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- payment_links — admin-managed SECURE EXTERNAL links only.
-- No card data is ever stored in this system.
-- ---------------------------------------------------------------------------
create table if not exists public.payment_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  amount_label text,
  url text not null,
  client_id uuid references public.clients (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_links enable row level security;

drop policy if exists "payment_links_admin_all" on public.payment_links;
create policy "payment_links_admin_all" on public.payment_links
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

drop trigger if exists payment_links_audit_columns on public.payment_links;
create trigger payment_links_audit_columns
  before insert or update on public.payment_links
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- media_assets — internal media library index. Public delivery happens via
-- the storage buckets' public URLs, not via this table.
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  storage_path text not null,
  url text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  alt_text text not null default '',
  is_public boolean not null default true,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_bucket_idx on public.media_assets (bucket, created_at);

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_staff_all" on public.media_assets;
create policy "media_assets_staff_all" on public.media_assets
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

-- ---------------------------------------------------------------------------
-- audit_logs — written by triggers only; admins read; nobody updates/deletes.
-- SECURITY DEFINER triggers insert as the table owner, bypassing RLS by design.
-- Never stores passwords or secrets.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id uuid,
  summary text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_admin_read" on public.audit_logs;
create policy "audit_logs_admin_read" on public.audit_logs
  for select to authenticated using (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- Generic audit trigger — attach to sensitive tables
-- ---------------------------------------------------------------------------
create or replace function public.audit_row_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
begin
  if v_actor is not null then
    select p.email into v_actor_email from public.profiles p where p.id = v_actor;
  end if;

  insert into public.audit_logs (actor_id, actor_email, action, entity, entity_id, summary, metadata)
  values (
    v_actor,
    v_actor_email,
    tg_op,
    tg_table_name,
    (case when tg_op = 'DELETE' then to_jsonb(old) ->> 'id' else to_jsonb(new) ->> 'id' end)::uuid,
    tg_table_name || ' ' || lower(tg_op),
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end
  );

  return coalesce(new, old);
end $$;

drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles after insert or update or delete on public.profiles
  for each row execute function public.audit_row_change();

drop trigger if exists audit_site_settings on public.site_settings;
create trigger audit_site_settings after insert or update or delete on public.site_settings
  for each row execute function public.audit_row_change();

drop trigger if exists audit_page_sections on public.page_sections;
create trigger audit_page_sections after insert or update or delete on public.page_sections
  for each row execute function public.audit_row_change();

drop trigger if exists audit_services on public.services;
create trigger audit_services after insert or update or delete on public.services
  for each row execute function public.audit_row_change();

drop trigger if exists audit_clients on public.clients;
create trigger audit_clients after insert or update or delete on public.clients
  for each row execute function public.audit_row_change();

drop trigger if exists audit_projects on public.projects;
create trigger audit_projects after insert or update or delete on public.projects
  for each row execute function public.audit_row_change();

drop trigger if exists audit_team_members on public.team_members;
create trigger audit_team_members after insert or update or delete on public.team_members
  for each row execute function public.audit_row_change();

drop trigger if exists audit_testimonials on public.testimonials;
create trigger audit_testimonials after insert or update or delete on public.testimonials
  for each row execute function public.audit_row_change();

drop trigger if exists audit_blog_posts on public.blog_posts;
create trigger audit_blog_posts after insert or update or delete on public.blog_posts
  for each row execute function public.audit_row_change();

drop trigger if exists audit_payment_links on public.payment_links;
create trigger audit_payment_links after insert or update or delete on public.payment_links
  for each row execute function public.audit_row_change();

drop trigger if exists audit_media_assets on public.media_assets;
create trigger audit_media_assets after insert or update or delete on public.media_assets
  for each row execute function public.audit_row_change();
