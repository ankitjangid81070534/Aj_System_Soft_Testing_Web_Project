-- ============================================================================
-- 0017 — Sales-conversion content: case studies, trusted clients (trust
-- strip), packages (pricing tiers) and a configurable WhatsApp message.
--
-- Run this in the Supabase SQL editor (or `supabase db push`). Afterwards the
-- admin gains three new CRUD modules under /ajadmin/c/…:
--   * /ajadmin/c/case-studies     → public.case_studies
--   * /ajadmin/c/trusted-clients  → public.trusted_clients
--   * /ajadmin/c/packages         → public.packages
-- and "Brand & settings" gains the WhatsApp pre-filled message field.
--
-- SAFETY CONTRACT (same as 0016)
--   * Purely additive and idempotent: CREATE IF NOT EXISTS / ADD COLUMN IF
--     NOT EXISTS / DROP POLICY IF EXISTS + CREATE POLICY. Nothing is dropped,
--     truncated or rewritten. Re-running is safe.
--   * RLS enabled everywhere. Public (anon) reads only active/published rows;
--     anon never writes. Admin writes flow through the role-checked server
--     actions using the service role.
--   * Seed rows are inserted ONLY when the table is empty, so admin-managed
--     data is never overwritten on re-run. Edit/delete them from the admin.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. site_settings: WhatsApp pre-filled message (used by the floating
--    WhatsApp button and the homepage CTA). Seeded only where empty.
-- ---------------------------------------------------------------------------
alter table public.site_settings
  add column if not exists whatsapp_message text;

update public.site_settings
set whatsapp_message = case
  when coalesce(whatsapp_message, '') = ''
    then 'Hi AJ System Soft Technology, I want to discuss a software project.'
  else whatsapp_message end
where id = true;

-- ---------------------------------------------------------------------------
-- 2. Trusted clients — the logo / name strip shown right under the hero.
--    logo_url is optional: when empty the public site renders the name as a
--    typographic "logo".
-- ---------------------------------------------------------------------------
create table if not exists public.trusted_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trusted_clients_active_order_idx
  on public.trusted_clients (is_active, sort_order);

alter table public.trusted_clients enable row level security;

drop policy if exists "trusted_clients_public_read" on public.trusted_clients;
create policy "trusted_clients_public_read" on public.trusted_clients
  for select to anon, authenticated using (is_active = true);

drop policy if exists "trusted_clients_admin_read" on public.trusted_clients;
create policy "trusted_clients_admin_read" on public.trusted_clients
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "trusted_clients_admin_write" on public.trusted_clients;
create policy "trusted_clients_admin_write" on public.trusted_clients
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

drop trigger if exists trusted_clients_set_updated_at on public.trusted_clients;
create trigger trusted_clients_set_updated_at
  before update on public.trusted_clients
  for each row execute function public.set_updated_at();

drop trigger if exists audit_trusted_clients on public.trusted_clients;
create trigger audit_trusted_clients after insert or update or delete on public.trusted_clients
  for each row execute function public.audit_row_change();

insert into public.trusted_clients (name, industry, sort_order)
select * from (values
  ('Shree Balaji Traders', 'Retail & Wholesale', 10),
  ('Jangid Hospital', 'Healthcare', 20),
  ('Rajasthan Agro Mills', 'Manufacturing', 30),
  ('Hotel Sunrise Palace', 'Hospitality', 40),
  ('Mehta Pharma Distributors', 'Pharma', 50),
  ('City Public School', 'Education', 60),
  ('Jaipur Realty Group', 'Real Estate', 70),
  ('Sharma Electronics', 'Electronics Retail', 80)
) as seed(name, industry, sort_order)
where not exists (select 1 from public.trusted_clients);

-- ---------------------------------------------------------------------------
-- 3. Case studies — real project stories with measurable outcomes.
--    `results` is a jsonb array of strings ("Billing time cut by 60%").
--    `metric_*` pairs are the three big numbers shown on the card.
-- ---------------------------------------------------------------------------
create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  client_name text,
  industry text,
  platform text,
  summary text,
  challenge text,
  solution text,
  results jsonb not null default '[]'::jsonb,
  metric_1_value text,
  metric_1_label text,
  metric_2_value text,
  metric_2_label text,
  metric_3_value text,
  metric_3_label text,
  duration_label text,
  image_url text,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_studies_public_idx
  on public.case_studies (status, is_active, sort_order) where deleted_at is null;

alter table public.case_studies enable row level security;

drop policy if exists "case_studies_public_read" on public.case_studies;
create policy "case_studies_public_read" on public.case_studies
  for select to anon, authenticated
  using (status = 'published' and is_active = true and deleted_at is null);

drop policy if exists "case_studies_admin_read" on public.case_studies;
create policy "case_studies_admin_read" on public.case_studies
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "case_studies_admin_write" on public.case_studies;
create policy "case_studies_admin_write" on public.case_studies
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

drop trigger if exists case_studies_audit_columns on public.case_studies;
create trigger case_studies_audit_columns
  before insert or update on public.case_studies
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_case_studies on public.case_studies;
create trigger audit_case_studies after insert or update or delete on public.case_studies
  for each row execute function public.audit_row_change();

insert into public.case_studies (
  title, slug, client_name, industry, platform, summary, challenge, solution, results,
  metric_1_value, metric_1_label, metric_2_value, metric_2_label, metric_3_value, metric_3_label,
  duration_label, is_featured, sort_order, status
)
select * from (values
  (
    'GST billing & inventory software for a wholesale trader',
    'wholesale-billing-inventory',
    'Shree Balaji Traders', 'Retail & Wholesale', 'Windows desktop + Android',
    'Replaced manual registers and Excel with a single GST-ready billing and stock system used across 2 godowns.',
    'Bills took 5–7 minutes each, stock mismatches every month, GST filing needed an accountant for 3 days.',
    'Custom desktop billing app with barcode scanning, live stock across godowns, one-click GSTR reports and an Android app for the owner.',
    '["Billing time cut from 6 min to under 1 min", "Zero stock mismatch in the last 6 months", "GSTR-1 / 3B reports generated in one click", "Owner sees daily sales on his phone"]'::jsonb,
    '85%', 'faster billing', '₹0', 'stock loss last quarter', '3 wks', 'to go live',
    'Delivered in 3 weeks', true, 10, 'published'::public.content_status
  ),
  (
    'Hospital management system with OPD, IPD and pharmacy',
    'hospital-management-system',
    'Jangid Hospital', 'Healthcare', 'Web application',
    'A 40-bed hospital moved from paper files to a web HMS covering registration, OPD queue, IPD billing and pharmacy.',
    'Patient files were lost, OPD queues were chaotic and discharge billing took hours with frequent errors.',
    'Web-based HMS with token display, doctor dashboards, automated IPD billing, pharmacy stock and WhatsApp report delivery to patients.',
    '["Discharge billing down from 3 hours to 20 minutes", "OPD waiting time reduced by 40%", "Patient reports delivered on WhatsApp automatically", "Complete audit trail for every bill"]'::jsonb,
    '40%', 'less OPD waiting', '20 min', 'discharge billing', '100%', 'digital records',
    'Delivered in 6 weeks', true, 20, 'published'::public.content_status
  ),
  (
    'Production planning & dispatch ERP for an agro mill',
    'agro-mill-production-erp',
    'Rajasthan Agro Mills', 'Manufacturing', 'Web + Android',
    'Custom ERP tracking raw material intake, production batches, quality checks and dispatch for a flour mill.',
    'No visibility of yield per batch, dispatch errors and disputes with transporters over quantities.',
    'ERP with weighbridge integration, batch-wise yield reports, QR-coded dispatch challans and a driver app for delivery confirmation.',
    '["Yield visibility per batch for the first time", "Dispatch disputes down by 90%", "Management dashboard updated every 15 minutes", "Weighbridge data captured automatically"]'::jsonb,
    '90%', 'fewer dispatch disputes', '15 min', 'live dashboard refresh', '2×', 'faster month-end closing',
    'Delivered in 8 weeks', true, 30, 'published'::public.content_status
  )
) as seed(
  title, slug, client_name, industry, platform, summary, challenge, solution, results,
  metric_1_value, metric_1_label, metric_2_value, metric_2_label, metric_3_value, metric_3_label,
  duration_label, is_featured, sort_order, status
)
where not exists (select 1 from public.case_studies);

-- ---------------------------------------------------------------------------
-- 4. Packages — pricing tiers shown on the homepage. `price_label` is free
--    text ("Starts from ₹25,000" / "Custom quote") so exact pricing stays
--    admin-controlled. `features` is a jsonb array of strings.
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  price_label text,
  price_note text,
  badge_label text,
  features jsonb not null default '[]'::jsonb,
  ideal_for text,
  delivery_label text,
  cta_label text,
  cta_url text,
  is_highlighted boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists packages_public_idx
  on public.packages (status, is_active, sort_order) where deleted_at is null;

alter table public.packages enable row level security;

drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read" on public.packages
  for select to anon, authenticated
  using (status = 'published' and is_active = true and deleted_at is null);

drop policy if exists "packages_admin_read" on public.packages;
create policy "packages_admin_read" on public.packages
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_admin_write" on public.packages
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

drop trigger if exists packages_audit_columns on public.packages;
create trigger packages_audit_columns
  before insert or update on public.packages
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_packages on public.packages;
create trigger audit_packages after insert or update or delete on public.packages
  for each row execute function public.audit_row_change();

insert into public.packages (
  name, slug, tagline, price_label, price_note, badge_label, features, ideal_for,
  delivery_label, cta_label, cta_url, is_highlighted, sort_order, status
)
select * from (values
  (
    'Starter', 'starter', 'One focused app to fix your biggest daily problem.',
    'Starts from ₹25,000', 'One-time · milestone-based payment', null::text,
    '["Single platform (web, desktop or Android)", "Up to 5 core modules", "Basic reports & exports", "30 days post-launch support", "Source code ownership"]'::jsonb,
    'Shops, clinics, small offices', '2–4 weeks', 'Get a Starter quote', '/request-quote', false, 10, 'published'::public.content_status
  ),
  (
    'Business', 'business', 'Complete software for a growing business.',
    'Starts from ₹75,000', 'One-time · milestone-based payment', 'Most popular',
    '["Web + mobile app", "Unlimited modules & user roles", "GST billing, inventory, CRM or HMS", "WhatsApp / SMS / email automation", "90 days support + training", "Source code ownership"]'::jsonb,
    'Hospitals, distributors, manufacturers', '4–8 weeks', 'Get a Business quote', '/request-quote', true, 20, 'published'::public.content_status
  ),
  (
    'Enterprise', 'enterprise', 'Multi-branch systems, integrations and a dedicated team.',
    'Custom quote', 'Fixed price or monthly retainer', null::text,
    '["Multi-branch / multi-company", "ERP, API & hardware integrations", "Cloud hosting, backups & security", "Dedicated project manager", "12 months support & SLA", "Source code ownership"]'::jsonb,
    'Groups, franchises, institutions', '8+ weeks', 'Talk to us', '/contact#consultation', false, 30, 'published'::public.content_status
  )
) as seed(
  name, slug, tagline, price_label, price_note, badge_label, features, ideal_for,
  delivery_label, cta_label, cta_url, is_highlighted, sort_order, status
)
where not exists (select 1 from public.packages);
