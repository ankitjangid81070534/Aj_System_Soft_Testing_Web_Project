-- ============================================================================
-- 0003 — Services + service FAQs
-- ============================================================================

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  long_description text,
  category text,
  icon text,
  cover_image_url text,
  -- jsonb text arrays — validated app-side with Zod
  problems jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  technology_examples jsonb not null default '[]'::jsonb,
  industries jsonb not null default '[]'::jsonb,
  process_steps jsonb not null default '[]'::jsonb,
  cta_label text,
  cta_href text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_public_idx on public.services (status, is_active, sort_order);

alter table public.services enable row level security;

drop policy if exists "services_public_read_published" on public.services;
create policy "services_public_read_published" on public.services
  for select to anon, authenticated
  using (status = 'published' and is_active = true);

drop policy if exists "services_staff_all" on public.services;
create policy "services_staff_all" on public.services
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists services_audit_columns on public.services;
create trigger services_audit_columns
  before insert or update on public.services
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- service_faqs — child of services; public visibility follows the parent
-- ---------------------------------------------------------------------------
create table if not exists public.service_faqs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_faqs_service_idx on public.service_faqs (service_id, sort_order);

alter table public.service_faqs enable row level security;

drop policy if exists "service_faqs_public_read" on public.service_faqs;
create policy "service_faqs_public_read" on public.service_faqs
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'published' and s.is_active = true
    )
  );

drop policy if exists "service_faqs_staff_all" on public.service_faqs;
create policy "service_faqs_staff_all" on public.service_faqs
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));
