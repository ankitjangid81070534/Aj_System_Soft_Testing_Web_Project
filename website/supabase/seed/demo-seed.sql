-- ============================================================================
-- DEMO SEED — NOT PRODUCTION CONTENT
-- ============================================================================
-- This file exists ONLY so developers can exercise the schema locally before
-- real content is added. Every row inserted here is clearly generic.
--
-- NEVER presented as real company facts. No fake testimonials, ratings,
-- awards, employee counts or project results exist in this file, and none may
-- ever be added. Replace all of this with real content via /ajadmin.
--
-- Run AFTER all migrations, in the Supabase SQL editor (as postgres).
-- Safe to re-run (idempotent upserts).
-- ============================================================================

-- Site settings singleton (real brand identity — safe defaults)
insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;

-- Navigation (header)
insert into public.navigation_items (location, label, url, sort_order)
values
  ('header', 'Home', '/', 10),
  ('header', 'Services', '/services', 20),
  ('header', 'Projects', '/projects', 30),
  ('header', 'About', '/about', 40),
  ('header', 'Team', '/team', 50),
  ('header', 'Contact', '/contact', 60)
on conflict do nothing;

-- Footer navigation
insert into public.navigation_items (location, label, url, sort_order)
values
  ('footer', 'Privacy Policy', '/privacy', 10),
  ('footer', 'Terms & Conditions', '/terms', 20)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- DEMO services (draft by default; flip status to 'published' locally to test
-- public rendering). Real service content arrives via /ajadmin.
-- ---------------------------------------------------------------------------
insert into public.services (slug, name, short_description, category, features, status, is_active)
values
  (
    'custom-software-development',
    'Custom Software Development',
    'Software designed and built around your exact business requirements.',
    'Custom Software',
    '["Requirements analysis","Architecture and development","Testing and deployment","Ongoing support"]'::jsonb,
    'draft',
    true
  ),
  (
    'web-application-development',
    'Web Application Development',
    'Fast, secure web applications and SaaS platforms for daily business operations.',
    'Web Applications',
    '["Web app architecture","Admin panels and dashboards","APIs and integrations","Cloud deployment"]'::jsonb,
    'draft',
    true
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- DEMO client + project marked PRIVATE (draft + is_public false) to prove that
-- confidential records stay hidden from anonymous readers under RLS.
-- ---------------------------------------------------------------------------
insert into public.clients (slug, name, public_permission, status, internal_notes)
values
  (
    'demo-client',
    'Demo Client (private example)',
    false,
    'draft',
    'DEMO ONLY — shows how a client without public permission stays invisible publicly.'
  )
on conflict (slug) do nothing;

insert into public.projects (slug, name, short_summary, status, is_public, client_id)
values
  (
    'demo-private-project',
    'Demo Project (private example)',
    'DEMO ONLY — confidential work stays hidden until explicitly published.',
    'draft',
    false,
    (select id from public.clients where slug = 'demo-client')
  )
on conflict (slug) do nothing;
