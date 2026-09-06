-- ============================================================================
-- 0016 — Supabase-first business platform: offers, updates/announcements,
-- launch benefits, versioned agreements + acceptances, user addresses,
-- structured social links, richer company settings, CRM status "reviewing".
--
-- SAFETY CONTRACT
--   * Purely additive and idempotent: only CREATE IF NOT EXISTS / ADD COLUMN
--     IF NOT EXISTS / DROP POLICY IF EXISTS + CREATE POLICY. Nothing is
--     dropped, truncated or rewritten. Re-running is safe.
--   * RLS stays enabled everywhere. Public (anon) reads only active/published
--     rows; anon never writes. All admin writes still flow through the
--     role-checked server actions using the service role.
--   * site_settings keeps its set_updated_at trigger (0013) — no
--     set_audit_columns trigger is added there (0015 guard).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Lead pipeline gains the "reviewing" stage (between new and contacted).
--    ADD VALUE is transactional on PG12+ as long as the value is not used in
--    the same transaction — nothing below uses it.
-- ---------------------------------------------------------------------------
alter type public.lead_status add value if not exists 'reviewing';

-- ---------------------------------------------------------------------------
-- 1. Company settings: legal name, about, structured address. Seed the
--    real business contact details only where the column is still empty so
--    admin-managed values are never overwritten.
-- ---------------------------------------------------------------------------
alter table public.site_settings
  add column if not exists company_legal_name text,
  add column if not exists about_text text,
  add column if not exists address_city text,
  add column if not exists address_state text,
  add column if not exists address_postal_code text,
  add column if not exists address_country text not null default 'India',
  add column if not exists value_proposition text;

update public.site_settings
set
  phone = case when coalesce(phone, '') = '' then '8107053411' else phone end,
  whatsapp = case when coalesce(whatsapp, '') = '' then '8107053411' else whatsapp end,
  contact_email = case when coalesce(contact_email, '') = '' then 'ankitjangid81070@gmail.com' else contact_email end,
  address_line = case when coalesce(address_line, '') = '' then 'TR Market, Luniyawas, Meena Padli, Agra Road' else address_line end,
  address_city = case when coalesce(address_city, '') = '' then 'Jaipur' else address_city end,
  address_state = case when coalesce(address_state, '') = '' then 'Rajasthan' else address_state end,
  company_legal_name = case when coalesce(company_legal_name, '') = '' then 'AJ System Soft Technology' else company_legal_name end,
  value_proposition = case when coalesce(value_proposition, '') = '' then 'Built around your requirements.' else value_proposition end
where id = true;

-- ---------------------------------------------------------------------------
-- 2. Structured social links (platform + URL + active + sort). The legacy
--    site_settings.social_links jsonb keeps working as a fallback.
-- ---------------------------------------------------------------------------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in (
    'whatsapp', 'instagram', 'youtube', 'linkedin', 'facebook', 'x', 'github', 'telegram', 'website'
  )),
  label text,
  url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_links_active_order_idx on public.social_links (is_active, sort_order);

alter table public.social_links enable row level security;

drop policy if exists "social_links_public_read" on public.social_links;
create policy "social_links_public_read" on public.social_links
  for select to anon, authenticated using (is_active = true);

drop policy if exists "social_links_admin_read" on public.social_links;
create policy "social_links_admin_read" on public.social_links
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "social_links_admin_write" on public.social_links;
create policy "social_links_admin_write" on public.social_links
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

drop trigger if exists social_links_audit_columns on public.social_links;
create trigger social_links_audit_columns
  before insert or update on public.social_links
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_social_links on public.social_links;
create trigger audit_social_links after insert or update or delete on public.social_links
  for each row execute function public.audit_row_change();

-- Seed the WhatsApp link once from the configured number (only if empty).
insert into public.social_links (platform, label, url, is_active, sort_order)
select 'whatsapp', 'WhatsApp', 'https://wa.me/918107053411', true, 10
where not exists (select 1 from public.social_links);

-- ---------------------------------------------------------------------------
-- 3. Offers (admin-managed, popup capable)
-- ---------------------------------------------------------------------------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  image_url text,
  original_price numeric(12,2),
  offer_price numeric(12,2),
  discount_label text,
  offer_code text,
  offer_type text not null default 'discount' check (offer_type in (
    'discount', 'free', 'bundle', 'limited_time', 'launch', 'seasonal', 'custom'
  )),
  free_or_paid text not null default 'paid' check (free_or_paid in ('free', 'paid')),
  tags jsonb not null default '[]'::jsonb,
  cta_label text,
  cta_url text,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  popup_enabled boolean not null default false,
  popup_priority integer not null default 0,
  popup_frequency text not null default 'once_per_day' check (popup_frequency in (
    'every_visit', 'once_per_session', 'once_per_day', 'custom'
  )),
  popup_custom_hours integer check (popup_custom_hours is null or popup_custom_hours between 1 and 8760),
  show_on_home boolean not null default true,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_public_idx
  on public.offers (status, is_active, sort_order) where deleted_at is null;
create index if not exists offers_popup_idx
  on public.offers (popup_enabled, popup_priority desc) where deleted_at is null;

alter table public.offers enable row level security;

drop policy if exists "offers_public_read" on public.offers;
create policy "offers_public_read" on public.offers
  for select to anon, authenticated
  using (
    status = 'published' and is_active = true and deleted_at is null
    and (start_at is null or start_at <= now())
    and (end_at is null or end_at >= now())
  );

drop policy if exists "offers_staff_read" on public.offers;
create policy "offers_staff_read" on public.offers
  for select to authenticated using (public.has_role('editor'));

drop policy if exists "offers_staff_write" on public.offers;
create policy "offers_staff_write" on public.offers
  for all to authenticated
  using (public.has_role('editor')) with check (public.has_role('editor'));

drop trigger if exists offers_audit_columns on public.offers;
create trigger offers_audit_columns
  before insert or update on public.offers
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_offers on public.offers;
create trigger audit_offers after insert or update or delete on public.offers
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- 4. Updates / announcements
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  body text,
  update_type text not null default 'product_update' check (update_type in (
    'product_update', 'new_feature', 'free_update', 'paid_update', 'service_update',
    'maintenance', 'company_news', 'promotion'
  )),
  free_or_paid text not null default 'free' check (free_or_paid in ('free', 'paid')),
  price_label text,
  image_url text,
  icon text,
  badge_label text,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  priority integer not null default 0,
  display_position text not null default 'update_center' check (display_position in (
    'top_bar', 'homepage', 'side_floating', 'update_center', 'footer'
  )),
  is_dismissible boolean not null default true,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_public_idx
  on public.announcements (status, is_active, display_position, priority desc) where deleted_at is null;

alter table public.announcements enable row level security;

drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
  for select to anon, authenticated
  using (
    status = 'published' and is_active = true and deleted_at is null
    and (start_at is null or start_at <= now())
    and (end_at is null or end_at >= now())
  );

drop policy if exists "announcements_staff_read" on public.announcements;
create policy "announcements_staff_read" on public.announcements
  for select to authenticated using (public.has_role('editor'));

drop policy if exists "announcements_staff_write" on public.announcements;
create policy "announcements_staff_write" on public.announcements
  for all to authenticated
  using (public.has_role('editor')) with check (public.has_role('editor'));

drop trigger if exists announcements_audit_columns on public.announcements;
create trigger announcements_audit_columns
  before insert or update on public.announcements
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_announcements on public.announcements;
create trigger audit_announcements after insert or update or delete on public.announcements
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- 5. Launch / included benefits (home section under the hero)
-- ---------------------------------------------------------------------------
create table if not exists public.launch_benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.launch_benefits enable row level security;

drop policy if exists "launch_benefits_public_read" on public.launch_benefits;
create policy "launch_benefits_public_read" on public.launch_benefits
  for select to anon, authenticated using (is_active = true);

drop policy if exists "launch_benefits_staff_read" on public.launch_benefits;
create policy "launch_benefits_staff_read" on public.launch_benefits
  for select to authenticated using (public.has_role('editor'));

drop policy if exists "launch_benefits_staff_write" on public.launch_benefits;
create policy "launch_benefits_staff_write" on public.launch_benefits
  for all to authenticated
  using (public.has_role('editor')) with check (public.has_role('editor'));

drop trigger if exists launch_benefits_audit_columns on public.launch_benefits;
create trigger launch_benefits_audit_columns
  before insert or update on public.launch_benefits
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_launch_benefits on public.launch_benefits;
create trigger audit_launch_benefits after insert or update or delete on public.launch_benefits
  for each row execute function public.audit_row_change();

insert into public.launch_benefits (title, description, icon, sort_order)
select * from (values
  ('6 Months Support', 'Bug fixes and technical support for six months after delivery, as described in the Service Agreement.', 'life-buoy', 10),
  ('6 Months Eligible Customization', 'Reasonable, in-scope adjustments for six months so the product keeps matching how you work.', 'sliders', 20),
  ('1 Year Android App Offer', 'Eligible website and software projects can add a companion Android app under the current offer terms.', 'smartphone', 30),
  ('SEO / Search Setup Assistance', 'Technical SEO foundations, indexing setup and structured data — no ranking guarantees, just correct groundwork.', 'search', 40),
  ('Client / Admin Portal', 'Where applicable, a secure portal to manage content, leads and documents without depending on us for every change.', 'layout-dashboard', 50),
  ('Custom Requirement-Based Development', 'Every project is scoped around your actual requirements — no forced templates.', 'code', 60)
) as seed(title, description, icon, sort_order)
where not exists (select 1 from public.launch_benefits);

-- Home builder learns the new section types (constraint is recreated with the
-- extended allow-list; existing rows all satisfy it).
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.page_sections'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%section_type%';
  if constraint_name is not null then
    execute format('alter table public.page_sections drop constraint %I', constraint_name);
  end if;
  alter table public.page_sections add constraint page_sections_section_type_check
    check (section_type in (
      'hero', 'trust_strip', 'services_overview', 'platforms', 'featured_projects',
      'process', 'industries', 'tech_capabilities', 'why_us', 'testimonials',
      'team', 'gallery', 'faq', 'cta', 'benefits', 'offers', 'updates'
    ));
end $$;

-- ---------------------------------------------------------------------------
-- 6. Versioned agreements
-- ---------------------------------------------------------------------------
create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  agreement_type text not null default 'service' check (agreement_type in (
    'service', 'privacy', 'terms', 'custom'
  )),
  is_active boolean not null default false,
  effective_from timestamptz,
  current_version_id uuid,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreement_versions (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements (id) on delete cascade,
  version_number integer not null,
  title text not null,
  body text not null,
  plain_text text,
  pdf_path text,
  checksum text,
  effective_from timestamptz,
  is_draft boolean not null default true,
  change_note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agreement_id, version_number)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'agreements_current_version_fk'
  ) then
    alter table public.agreements
      add constraint agreements_current_version_fk
      foreign key (current_version_id) references public.agreement_versions (id) on delete set null;
  end if;
end $$;

create table if not exists public.agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements (id) on delete restrict,
  version_id uuid not null references public.agreement_versions (id) on delete restrict,
  user_id uuid references auth.users (id) on delete set null,
  guest_identifier text,
  accepted_at timestamptz not null default now(),
  context text not null check (context in ('signup', 'contact', 'quote', 'account', 'admin', 'other')),
  full_name text,
  email text,
  phone text,
  related_table text check (related_table is null or related_table in (
    'contact_submissions', 'quote_requests', 'appointment_requests'
  )),
  related_id uuid,
  ip_hash text,
  user_agent text,
  evidence_pdf_path text,
  evidence_hash text,
  consent_text text,
  created_at timestamptz not null default now()
);

create index if not exists agreement_versions_agreement_idx
  on public.agreement_versions (agreement_id, version_number desc);
create index if not exists agreement_acceptances_user_idx
  on public.agreement_acceptances (user_id, accepted_at desc);
create index if not exists agreement_acceptances_related_idx
  on public.agreement_acceptances (related_table, related_id);
create index if not exists agreement_acceptances_email_idx
  on public.agreement_acceptances (lower(email));

alter table public.agreements enable row level security;
alter table public.agreement_versions enable row level security;
alter table public.agreement_acceptances enable row level security;

-- Public: only active agreements and their non-draft versions.
drop policy if exists "agreements_public_read" on public.agreements;
create policy "agreements_public_read" on public.agreements
  for select to anon, authenticated using (is_active = true);

drop policy if exists "agreements_admin_all" on public.agreements;
create policy "agreements_admin_all" on public.agreements
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

drop policy if exists "agreement_versions_public_read" on public.agreement_versions;
create policy "agreement_versions_public_read" on public.agreement_versions
  for select to anon, authenticated
  using (
    is_draft = false
    and exists (select 1 from public.agreements a where a.id = agreement_id and a.is_active = true)
  );

-- A signed-in user may always read the exact version they accepted.
drop policy if exists "agreement_versions_accepted_read" on public.agreement_versions;
create policy "agreement_versions_accepted_read" on public.agreement_versions
  for select to authenticated
  using (
    exists (
      select 1 from public.agreement_acceptances acc
      where acc.version_id = agreement_versions.id and acc.user_id = auth.uid()
    )
  );

drop policy if exists "agreement_versions_admin_all" on public.agreement_versions;
create policy "agreement_versions_admin_all" on public.agreement_versions
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- Acceptances: users read their own; admins read all; writes only via the
-- server (service role) so evidence rows can never be forged from a browser.
drop policy if exists "agreement_acceptances_own_read" on public.agreement_acceptances;
create policy "agreement_acceptances_own_read" on public.agreement_acceptances
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "agreement_acceptances_admin_read" on public.agreement_acceptances;
create policy "agreement_acceptances_admin_read" on public.agreement_acceptances
  for select to authenticated using (public.has_role('admin'));

-- Accepted versions are immutable: the legal text somebody agreed to can never
-- change underneath them. Drafts (never accepted) stay editable.
create or replace function public.guard_agreement_version_immutable() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.agreement_acceptances acc where acc.version_id = old.id) then
    if tg_op = 'DELETE' then
      raise exception 'Agreement version % has recorded acceptances and cannot be deleted', old.version_number;
    end if;
    if new.body is distinct from old.body
       or new.plain_text is distinct from old.plain_text
       or new.checksum is distinct from old.checksum
       or new.version_number is distinct from old.version_number
       or new.title is distinct from old.title
       or new.agreement_id is distinct from old.agreement_id
       or (old.is_draft = false and new.is_draft = true) then
      raise exception 'Agreement version % has recorded acceptances and is immutable', old.version_number;
    end if;
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    return new;
  end if;
  return old;
end $$;

drop trigger if exists guard_agreement_version_immutable on public.agreement_versions;
create trigger guard_agreement_version_immutable
  before update or delete on public.agreement_versions
  for each row execute function public.guard_agreement_version_immutable();

drop trigger if exists agreements_audit_columns on public.agreements;
create trigger agreements_audit_columns
  before insert or update on public.agreements
  for each row execute function public.set_audit_columns();

drop trigger if exists audit_agreements on public.agreements;
create trigger audit_agreements after insert or update or delete on public.agreements
  for each row execute function public.audit_row_change();

drop trigger if exists audit_agreement_versions on public.agreement_versions;
create trigger audit_agreement_versions after insert or update or delete on public.agreement_versions
  for each row execute function public.audit_row_change();

drop trigger if exists audit_agreement_acceptances on public.agreement_acceptances;
create trigger audit_agreement_acceptances after insert or delete on public.agreement_acceptances
  for each row execute function public.audit_row_change();

-- Leads remember which agreement version was accepted with the submission.
alter table public.contact_submissions
  add column if not exists agreement_version_id uuid references public.agreement_versions (id) on delete set null,
  add column if not exists agreement_accepted_at timestamptz,
  add column if not exists follow_up_at timestamptz;

alter table public.quote_requests
  add column if not exists agreement_version_id uuid references public.agreement_versions (id) on delete set null,
  add column if not exists agreement_accepted_at timestamptz,
  add column if not exists follow_up_at timestamptz;

alter table public.appointment_requests
  add column if not exists follow_up_at timestamptz;

-- ---------------------------------------------------------------------------
-- 7. Seed the Service Agreement (v1, active) only when no agreement exists.
--    Business template — the admin note in the UI reminds the owner to have it
--    reviewed by a qualified local lawyer before relying on it.
-- ---------------------------------------------------------------------------
do $$
declare
  agreement_uuid uuid;
  version_uuid uuid;
  body_md text;
begin
  if exists (select 1 from public.agreements where slug = 'service-agreement') then
    return;
  end if;

  body_md := $md$
## 1. Parties
This Service Agreement ("Agreement") is between AJ System Soft Technology ("AJS", "we", "us"), TR Market, Luniyawas, Meena Padli, Agra Road, Jaipur, Rajasthan, India, and the client identified in the acceptance record ("Client", "you"). By ticking the acceptance checkbox or signing a proposal that references this Agreement, you agree to be bound by it.

## 2. Scope of Services
AJS designs, develops and delivers custom software, websites, web applications, SaaS platforms, Android applications, desktop software and related technical services. The specific deliverables, features and milestones for a project are defined in the written proposal, quote or statement of work that references this Agreement.

## 3. Custom Requirement-Based Development
Every project is built around the requirements shared by the Client in writing. Requirements agreed before development begins form the project scope. Changes requested after approval may affect timeline and cost and will be confirmed in writing before work continues.

## 4. Domain, Hosting and Account Ownership
Domains, hosting accounts, cloud projects and third-party service accounts purchased in the Client's name remain the Client's property. Where AJS registers or configures such services on the Client's behalf, credentials and ownership are transferred to the Client on request after settlement of outstanding invoices.

## 5. Support Period (6 Months)
Unless a proposal states otherwise, AJS provides six (6) months of technical support after delivery. Support covers defects in delivered functionality, security patches for code written by AJS and reasonable guidance on using the delivered system. Support does not cover new features, third-party outages, or issues caused by changes made by parties other than AJS.

## 6. Customization Period (6 Months)
For six (6) months after delivery, eligible in-scope customizations (small adjustments to existing, agreed functionality) are included. Requests that materially extend scope, add integrations or require new modules are quoted separately.

## 7. Android App Offer (1 Year)
Eligible website or software projects may add a companion Android application under the offer terms published on the AJS website at the time of acceptance. Offer availability, eligibility and any fees are described in the relevant offer and may change for future projects; accepted offers remain valid for the accepted project.

## 8. SEO and Search Assistance
AJS assists with technical SEO foundations such as indexable structure, metadata, sitemaps and structured data. Search engine rankings are controlled by third parties; AJS does not guarantee any specific ranking, traffic or revenue outcome.

## 9. Client and Admin Portal
Where applicable, AJS provides a portal or admin panel for managing content, leads or documents. The Client is responsible for keeping login credentials confidential and for content published through the portal.

## 10. Client Content and Lawful Use
The Client warrants that all text, images, logos, data and other material provided to AJS are owned or licensed by the Client and do not infringe third-party rights. The Client agrees to use the delivered software only for lawful purposes and in compliance with applicable Indian laws.

## 11. Client Information and Cooperation
Timely delivery depends on the Client supplying requirements, content, approvals, access and feedback within reasonable timeframes. Delays caused by missing inputs may extend the schedule without liability to AJS.

## 12. Third-Party Services
Projects may rely on third-party services such as hosting, databases, payment gateways, email providers, maps or app stores. Those services are governed by their own terms and pricing. AJS is not responsible for third-party outages, policy changes or fees.

## 13. Fees, Invoices and Payment
Fees, payment milestones and taxes are stated in the proposal or quote. Invoices are payable by the due date shown. AJS may pause work or withhold delivery of source code, credentials or deployments while payments are overdue. Payments are made only through the official channels published by AJS.

## 14. Delivery and Acceptance
Deliverables are presented for review at agreed milestones. The Client should report defects within the review period stated in the proposal (default seven days). Deliverables not disputed within that period are considered accepted.

## 15. Backups and Data
AJS keeps development backups during the project. After delivery, the Client is responsible for production backups unless a maintenance plan says otherwise. AJS handles personal data in line with its Privacy Policy.

## 16. Security
AJS applies reasonable, industry-standard security practices to the code it delivers. No software is guaranteed to be free of all vulnerabilities; the Client agrees to apply recommended updates and to secure its own devices, accounts and passwords.

## 17. Intellectual Property
Upon full payment, the Client owns the custom code, designs and content created specifically for the project. AJS retains ownership of its pre-existing tools, libraries, templates and know-how, which are licensed to the Client for use within the delivered project. Open-source components remain under their respective licences.

## 18. Termination
Either party may terminate a project in writing if the other party materially breaches this Agreement and fails to remedy it within fifteen (15) days of notice. On termination, the Client pays for work completed to date and AJS hands over paid-for deliverables.

## 19. Changes to this Agreement
AJS may publish updated versions of this Agreement. Each version is numbered and dated. Existing projects continue under the version accepted for that project unless both parties agree otherwise in writing.

## 20. Contact
AJ System Soft Technology — Phone / WhatsApp: 8107053411 — Email: ankitjangid81070@gmail.com — Address: TR Market, Luniyawas, Meena Padli, Agra Road, Jaipur, Rajasthan, India.

## 21. Acceptance Record
Acceptance is recorded with the agreement version number, date and time, the name, email and phone provided, and the context (sign-up, contact or quote request). A copy of the accepted version is stored as evidence and can be shared with the Client on request.
$md$;

  insert into public.agreements (title, slug, agreement_type, is_active, effective_from)
  values ('AJ System Soft Technology Service Agreement', 'service-agreement', 'service', true, now())
  returning id into agreement_uuid;

  insert into public.agreement_versions (
    agreement_id, version_number, title, body, plain_text, checksum, effective_from, is_draft, change_note
  ) values (
    agreement_uuid, 1, 'AJ System Soft Technology Service Agreement', body_md,
    regexp_replace(body_md, '[#*_`>]+', '', 'g'),
    encode(sha256(convert_to(body_md, 'UTF8')), 'hex'),
    now(), false, 'Initial published version.'
  ) returning id into version_uuid;

  update public.agreements set current_version_id = version_uuid where id = agreement_uuid;
end $$;

-- ---------------------------------------------------------------------------
-- 8. Profiles: username, activity flags, address book. handle_new_user copies
--    sign-up metadata (username / phone / address) into profiles and
--    user_addresses without ever blocking the auth insert.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists username text,
  add column if not exists is_active boolean not null default true,
  add column if not exists client_status text not null default 'prospect'
    check (client_status in ('prospect', 'active', 'inactive', 'blocked')),
  add column if not exists profile_completed boolean not null default false,
  add column if not exists auth_provider text;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username)) where username is not null;

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Primary',
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_addresses_user_idx on public.user_addresses (user_id, is_primary desc);

alter table public.user_addresses enable row level security;

drop policy if exists "user_addresses_own_select" on public.user_addresses;
create policy "user_addresses_own_select" on public.user_addresses
  for select to authenticated using (user_id = auth.uid() or public.has_role('admin'));

drop policy if exists "user_addresses_own_insert" on public.user_addresses;
create policy "user_addresses_own_insert" on public.user_addresses
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "user_addresses_own_update" on public.user_addresses;
create policy "user_addresses_own_update" on public.user_addresses
  for update to authenticated
  using (user_id = auth.uid() or public.has_role('admin'))
  with check (user_id = auth.uid() or public.has_role('admin'));

drop policy if exists "user_addresses_own_delete" on public.user_addresses;
create policy "user_addresses_own_delete" on public.user_addresses
  for delete to authenticated using (user_id = auth.uid() or public.has_role('admin'));

drop trigger if exists user_addresses_touch_updated_at on public.user_addresses;
create trigger user_addresses_touch_updated_at
  before update on public.user_addresses
  for each row execute function public.touch_updated_at();

drop trigger if exists audit_user_addresses on public.user_addresses;
create trigger audit_user_addresses after insert or update or delete on public.user_addresses
  for each row execute function public.audit_row_change();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  wanted_username text := nullif(lower(trim(meta ->> 'username')), '');
  provider text := coalesce(new.raw_app_meta_data ->> 'provider', 'email');
begin
  -- A username collision or malformed metadata must never block sign-up.
  if wanted_username is not null and exists (
    select 1 from public.profiles p where lower(p.username) = wanted_username
  ) then
    wanted_username := null;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, company, phone, username, auth_provider)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@users.invalid'),
    coalesce(meta ->> 'full_name', meta ->> 'name'),
    coalesce(meta ->> 'avatar_url', meta ->> 'picture'),
    meta ->> 'company',
    nullif(trim(meta ->> 'phone'), ''),
    wanted_username,
    provider
  )
  on conflict (id) do nothing;

  begin
    if nullif(trim(meta ->> 'address_line_1'), '') is not null
       and nullif(trim(meta ->> 'city'), '') is not null
       and nullif(trim(meta ->> 'state'), '') is not null
       and nullif(trim(meta ->> 'postal_code'), '') is not null then
      insert into public.user_addresses (
        user_id, address_line_1, address_line_2, city, state, postal_code, country, is_primary
      ) values (
        new.id,
        trim(meta ->> 'address_line_1'),
        nullif(trim(meta ->> 'address_line_2'), ''),
        trim(meta ->> 'city'),
        trim(meta ->> 'state'),
        trim(meta ->> 'postal_code'),
        coalesce(nullif(trim(meta ->> 'country'), ''), 'India'),
        true
      );
      update public.profiles set profile_completed = true where id = new.id;
    end if;
  exception when others then
    -- Address is optional at the auth layer; the account still gets created.
    null;
  end;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 9. Storage: private bucket for agreement PDFs + acceptance evidence.
--    Reads happen through short-lived signed URLs created server-side.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agreements', 'agreements', false, 20971520, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "agreements_admin_read" on storage.objects;
create policy "agreements_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'agreements' and public.has_role('admin'));

drop policy if exists "agreements_admin_write" on storage.objects;
create policy "agreements_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'agreements' and public.has_role('admin'));

drop policy if exists "agreements_admin_update" on storage.objects;
create policy "agreements_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'agreements' and public.has_role('admin'))
  with check (bucket_id = 'agreements' and public.has_role('admin'));

drop policy if exists "agreements_admin_delete" on storage.objects;
create policy "agreements_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'agreements' and public.has_role('admin'));

-- Public-site bucket also hosts offer / update images uploaded from admin
-- (bucket + policies already exist from 0008; nothing to change).
