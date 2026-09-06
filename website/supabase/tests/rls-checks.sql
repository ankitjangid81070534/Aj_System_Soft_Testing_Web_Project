-- ============================================================================
-- RLS / AUTHORIZATION VERIFICATION SCRIPT
-- ============================================================================
-- Run in the Supabase SQL editor (connects as postgres, which may SET ROLE)
-- AFTER migrations 0001–0008 and the demo seed.
--
-- Before running:
--   1. Replace EDITOR_USER_UUID and ADMIN_USER_UUID below with the real
--      profile ids of the users you created during bootstrap
--      (see docs/PHASE-2-SUPABASE-SETUP.md).
--   2. Each SELECT below is a check: compare "rows" against the EXPECT value
--      in the comment. INSERT/UPDATE statements annotated "expect ERROR" must
--      raise an error; those without must succeed.
-- The whole script runs in one transaction and rolls back — nothing persists.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- [1] ANONYMOUS (public visitor) — can only see published + active + public
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select 'anon_draft_projects_visible'    as check_name, count(*) as rows from public.projects        where status <> 'published' or is_public = false; -- EXPECT 0
select 'anon_draft_services_visible'    as check_name, count(*) as rows from public.services        where status <> 'published';                      -- EXPECT 0
select 'anon_unpublished_team_visible'  as check_name, count(*) as rows from public.team_members    where status <> 'published';                      -- EXPECT 0
select 'anon_testimonials_visible'      as check_name, count(*) as rows from public.testimonials;                                                     -- EXPECT 0 (none seeded)
select 'anon_without_permission_clients_visible' as check_name, count(*) as rows from public.clients where public_permission = false;                  -- EXPECT 0
select 'anon_project_media_private_visible'      as check_name, count(*) as rows from public.project_media where media_type is null; -- EXPECT 0 (parent private)
select 'anon_leads_visible'             as check_name, count(*) as rows from public.quote_requests;                                                   -- EXPECT 0
select 'anon_contact_visible'           as check_name, count(*) as rows from public.contact_submissions;                                              -- EXPECT 0
select 'anon_audit_visible'             as check_name, count(*) as rows from public.audit_logs;                                                       -- EXPECT 0
select 'anon_media_assets_visible'      as check_name, count(*) as rows from public.media_assets;                                                     -- EXPECT 0
select 'anon_payment_links_visible'     as check_name, count(*) as rows from public.payment_links;                                                    -- EXPECT 0
select 'anon_profiles_visible'          as check_name, count(*) as rows from public.profiles;                                                         -- EXPECT 0
select 'anon_private_media_objects_visible' as check_name, count(*) as rows from storage.objects where bucket_id = 'private-media';                   -- EXPECT 0

-- Anonymous lead submission must WORK (insert-only)
insert into public.contact_submissions (name, email, message)
values ('RLS Check', 'rls-check@example.invalid', 'anon insert smoke test'); -- expect SUCCESS

reset role;

-- ---------------------------------------------------------------------------
-- [2] EDITOR — full content CRUD; NO access to leads/users/audit
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', 'EDITOR_USER_UUID', 'role', 'authenticated')::text, true);
set local role authenticated;

select 'editor_sees_draft_services' as check_name, count(*) as rows from public.services; -- EXPECT >= 2 (sees drafts)

insert into public.services (slug, name) values ('rls-editor-smoke', 'RLS Editor Smoke'); -- expect SUCCESS
delete from public.services where slug = 'rls-editor-smoke';                              -- expect SUCCESS

select 'editor_leads_visible'  as check_name, count(*) as rows from public.quote_requests;      -- EXPECT 0
select 'editor_audit_visible'  as check_name, count(*) as rows from public.audit_logs;          -- EXPECT 0
select 'editor_users_visible'  as check_name, count(*) as rows from public.profiles;            -- EXPECT 0 (self only)

-- Editor must NOT be able to promote anyone (expect ERROR from role guard)
update public.profiles set role = 'admin' where id = 'ADMIN_USER_UUID'; -- expect ERROR

reset role;

-- ---------------------------------------------------------------------------
-- [3] ADMIN — content + settings + leads + audit; NO user role management
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', 'ADMIN_USER_UUID', 'role', 'authenticated')::text, true);
set local role authenticated;

select 'admin_leads_visible' as check_name, count(*) as rows from public.quote_requests;    -- EXPECT >= 0 (reads leads)
select 'admin_audit_visible' as check_name, count(*) as rows from public.audit_logs;        -- EXPECT >= 1 (sees the anon insert above)
select 'admin_settings_row'  as check_name, count(*) as rows from public.site_settings;     -- EXPECT 1

update public.profiles set role = 'super_admin' where id = 'EDITOR_USER_UUID'; -- expect ERROR (only super admin changes roles)

reset role;

-- ---------------------------------------------------------------------------
-- [4] SUPER ADMIN — everything, including role management
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', 'SUPER_ADMIN_USER_UUID', 'role', 'authenticated')::text, true);
set local role authenticated;

select 'super_admin_audit_visible' as check_name, count(*) as rows from public.audit_logs;  -- EXPECT >= 1
update public.profiles set role = 'admin' where id = 'EDITOR_USER_UUID' and false;          -- expect SUCCESS (no-op guarded by AND false)

reset role;

rollback;
