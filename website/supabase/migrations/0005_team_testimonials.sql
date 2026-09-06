-- ============================================================================
-- 0005 — Team members + testimonials
-- No fabricated people/qualifications: rows are created from real data only.
-- ============================================================================

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null default '',
  short_bio text,
  long_bio text,
  profile_photo_url text,
  skills jsonb not null default '[]'::jsonb,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  email text,
  -- show the email on the public team page only when true
  public_email boolean not null default false,
  is_public boolean not null default true,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_members_public_idx on public.team_members (status, is_active, sort_order);

alter table public.team_members enable row level security;

drop policy if exists "team_members_public_read" on public.team_members;
create policy "team_members_public_read" on public.team_members
  for select to anon, authenticated
  using (is_public = true and is_active = true and status = 'published');

drop policy if exists "team_members_staff_all" on public.team_members;
create policy "team_members_staff_all" on public.team_members
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists team_members_audit_columns on public.team_members;
create trigger team_members_audit_columns
  before insert or update on public.team_members
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- testimonials — only ever real ones; public visibility flag required
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_company text,
  quote text not null,
  avatar_url text,
  client_id uuid references public.clients (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  is_public boolean not null default false,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_public_idx on public.testimonials (status, is_active, sort_order);

alter table public.testimonials enable row level security;

drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials
  for select to anon, authenticated
  using (is_public = true and is_active = true and status = 'published');

drop policy if exists "testimonials_staff_all" on public.testimonials;
create policy "testimonials_staff_all" on public.testimonials
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists testimonials_audit_columns on public.testimonials;
create trigger testimonials_audit_columns
  before insert or update on public.testimonials
  for each row execute function public.set_audit_columns();
