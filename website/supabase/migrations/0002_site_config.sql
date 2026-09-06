-- ============================================================================
-- 0002 — Site configuration: settings, navigation, home page sections, SEO
-- metadata, redirects
-- ============================================================================

-- ---------------------------------------------------------------------------
-- site_settings — singleton row (id is always true)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  brand_name text not null default 'AJ System Soft Technology',
  brand_short_name text not null default 'AJS Technology',
  alternate_name_1 text not null default 'Ankit Jangid System Technology',
  alternate_name_2 text not null default 'Ankit System Technology',
  tagline text not null default 'Software built around your requirements.',
  company_description text,
  logo_url text,
  favicon_url text,
  phone text,
  whatsapp text,
  contact_email text,
  support_email text,
  address_line text,
  map_url text,
  -- jsonb array of { label, url } — validated app-side with Zod
  social_links jsonb not null default '[]'::jsonb,
  business_hours text,
  footer_text text,
  copyright_text text,
  default_og_image_url text,
  accent_preset text not null default 'blue',
  global_cta_label text not null default 'Start Your Project',
  global_cta_href text not null default '/request-quote',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "site_settings_admin_insert" on public.site_settings;
create policy "site_settings_admin_insert" on public.site_settings
  for insert to authenticated with check (public.has_role('admin'));

drop policy if exists "site_settings_admin_update" on public.site_settings;
create policy "site_settings_admin_update" on public.site_settings
  for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

drop trigger if exists site_settings_audit_columns on public.site_settings;
create trigger site_settings_audit_columns
  before insert or update on public.site_settings
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- navigation_items
-- ---------------------------------------------------------------------------
create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null default 'header' check (location in ('header', 'footer')),
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists navigation_items_location_order_idx
  on public.navigation_items (location, sort_order);

alter table public.navigation_items enable row level security;

drop policy if exists "navigation_items_public_read" on public.navigation_items;
create policy "navigation_items_public_read" on public.navigation_items
  for select to anon, authenticated using (is_active = true);

drop policy if exists "navigation_items_staff_all" on public.navigation_items;
create policy "navigation_items_staff_all" on public.navigation_items
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

-- ---------------------------------------------------------------------------
-- page_sections — home page builder. section_type is a fixed allow-list;
-- content JSONB is validated app-side with Zod (no admin HTML/JS injection).
-- ---------------------------------------------------------------------------
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page text not null default 'home',
  section_type text not null check (section_type in (
    'hero', 'trust_strip', 'services_overview', 'platforms', 'featured_projects',
    'process', 'industries', 'tech_capabilities', 'why_us', 'testimonials',
    'team', 'gallery', 'faq', 'cta'
  )),
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_sections_page_order_idx
  on public.page_sections (page, sort_order);

alter table public.page_sections enable row level security;

drop policy if exists "page_sections_public_read" on public.page_sections;
create policy "page_sections_public_read" on public.page_sections
  for select to anon, authenticated
  using (is_visible = true and status = 'published');

drop policy if exists "page_sections_staff_all" on public.page_sections;
create policy "page_sections_staff_all" on public.page_sections
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists page_sections_audit_columns on public.page_sections;
create trigger page_sections_audit_columns
  before insert or update on public.page_sections
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- seo_metadata — overrides for static routes. Dynamic entities carry their own
-- seo_title/seo_description columns instead.
-- ---------------------------------------------------------------------------
create table if not exists public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  title text,
  description text,
  og_image_url text,
  no_index boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_metadata enable row level security;

drop policy if exists "seo_metadata_public_read" on public.seo_metadata;
create policy "seo_metadata_public_read" on public.seo_metadata
  for select to anon, authenticated using (true);

drop policy if exists "seo_metadata_admin_all" on public.seo_metadata;
create policy "seo_metadata_admin_all" on public.seo_metadata
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

drop trigger if exists seo_metadata_audit_columns on public.seo_metadata;
create trigger seo_metadata_audit_columns
  before insert or update on public.seo_metadata
  for each row execute function public.set_audit_columns();

-- ---------------------------------------------------------------------------
-- redirects — public-read so the server can resolve them with the anon client
-- ---------------------------------------------------------------------------
create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.redirects enable row level security;

drop policy if exists "redirects_public_read" on public.redirects;
create policy "redirects_public_read" on public.redirects
  for select to anon, authenticated using (is_active = true);

drop policy if exists "redirects_admin_all" on public.redirects;
create policy "redirects_admin_all" on public.redirects
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
