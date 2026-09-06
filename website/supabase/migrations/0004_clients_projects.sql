-- ============================================================================
-- 0004 — Clients, projects, project media
-- Public visibility rules:
--   clients  → public_permission AND is_active AND published
--   projects → is_public AND is_active AND published
-- Confidential client work must stay is_public = false / draft status.
-- ============================================================================

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  industry text,
  location text,
  -- master field: public_client_permission — client must consent before their
  -- name/logo appears on the public site
  public_permission boolean not null default false,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  internal_notes text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_public_idx on public.clients (status, is_active, sort_order);

alter table public.clients enable row level security;

drop policy if exists "clients_public_read" on public.clients;
create policy "clients_public_read" on public.clients
  for select to anon, authenticated
  using (public_permission = true and is_active = true and status = 'published');

drop policy if exists "clients_staff_all" on public.clients;
create policy "clients_staff_all" on public.clients
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists clients_audit_columns on public.clients;
create trigger clients_audit_columns
  before insert or update on public.clients
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- projects — full case-study model from the master requirements
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete set null,
  slug text not null unique,
  name text not null,
  short_summary text not null default '',
  overview text,
  problem text,
  solution text,
  key_features jsonb not null default '[]'::jsonb,
  platform_type text,
  -- own industry tag so confidential projects (client hidden) remain filterable
  industry text,
  technology_stack jsonb not null default '[]'::jsonb,
  database_note text,
  integrations jsonb not null default '[]'::jsonb,
  duration text,
  project_year integer,
  project_status text,
  cover_image_url text,
  video_url text,
  -- impact/results only when real — never fabricated
  impact_results jsonb,
  testimonial_quote text,
  testimonial_person text,
  testimonial_role text,
  public_url text,
  is_public boolean not null default false,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_public_idx on public.projects (status, is_active, sort_order);
create index if not exists projects_featured_idx on public.projects (is_featured, sort_order)
  where is_featured = true;
create index if not exists projects_client_idx on public.projects (client_id);

alter table public.projects enable row level security;

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select to anon, authenticated
  using (is_public = true and is_active = true and status = 'published');

drop policy if exists "projects_staff_all" on public.projects;
create policy "projects_staff_all" on public.projects
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists projects_audit_columns on public.projects;
create trigger projects_audit_columns
  before insert or update on public.projects
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- project_media — screenshots/gallery; public visibility follows the project
-- ---------------------------------------------------------------------------
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text,
  url text not null,
  alt_text text not null default '',
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_media_project_idx on public.project_media (project_id, sort_order);

alter table public.project_media enable row level security;

drop policy if exists "project_media_public_read" on public.project_media;
create policy "project_media_public_read" on public.project_media
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.is_public = true and p.is_active = true and p.status = 'published'
    )
  );

drop policy if exists "project_media_staff_all" on public.project_media;
create policy "project_media_staff_all" on public.project_media
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));
