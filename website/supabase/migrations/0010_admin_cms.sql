-- ============================================================================
-- 0010 — Admin CMS support
-- 1) Soft delete (deleted_at) on the six content tables
-- 2) Home Page Builder: layout variant + accent preset columns
-- 3) Audit attribution: when writes go through the service role (admin CRUD),
--    the app passes created_by/updated_by explicitly and the audit trigger
--    falls back to the row's updated_by for the actor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Soft delete columns
-- ---------------------------------------------------------------------------
alter table public.services      add column if not exists deleted_at timestamptz;
alter table public.clients       add column if not exists deleted_at timestamptz;
alter table public.projects      add column if not exists deleted_at timestamptz;
alter table public.team_members  add column if not exists deleted_at timestamptz;
alter table public.testimonials  add column if not exists deleted_at timestamptz;
alter table public.blog_posts    add column if not exists deleted_at timestamptz;

create index if not exists services_deleted_idx     on public.services     (deleted_at) where deleted_at is not null;
create index if not exists clients_deleted_idx      on public.clients      (deleted_at) where deleted_at is not null;
create index if not exists projects_deleted_idx     on public.projects     (deleted_at) where deleted_at is not null;
create index if not exists team_members_deleted_idx on public.team_members (deleted_at) where deleted_at is not null;
create index if not exists testimonials_deleted_idx on public.testimonials (deleted_at) where deleted_at is not null;
create index if not exists blog_posts_deleted_idx   on public.blog_posts   (deleted_at) where deleted_at is not null;

-- Public read policies must exclude soft-deleted rows.
drop policy if exists "services_public_read_published" on public.services;
create policy "services_public_read_published" on public.services
  for select to anon, authenticated
  using (deleted_at is null and status = 'published' and is_active = true);

drop policy if exists "clients_public_read" on public.clients;
create policy "clients_public_read" on public.clients
  for select to anon, authenticated
  using (deleted_at is null and public_permission = true and is_active = true and status = 'published');

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select to anon, authenticated
  using (deleted_at is null and is_public = true and is_active = true and status = 'published');

drop policy if exists "team_members_public_read" on public.team_members;
create policy "team_members_public_read" on public.team_members
  for select to anon, authenticated
  using (deleted_at is null and is_public = true and is_active = true and status = 'published');

drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials
  for select to anon, authenticated
  using (deleted_at is null and is_public = true and is_active = true and status = 'published');

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts
  for select to anon, authenticated
  using (
    deleted_at is null and status = 'published' and is_active = true
    and (published_at is null or published_at <= now())
  );

-- Child visibility follows the (now soft-delete-aware) parent.
drop policy if exists "service_faqs_public_read" on public.service_faqs;
create policy "service_faqs_public_read" on public.service_faqs
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.deleted_at is null
        and s.status = 'published' and s.is_active = true
    )
  );

drop policy if exists "project_media_public_read" on public.project_media;
create policy "project_media_public_read" on public.project_media
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.deleted_at is null
        and p.is_public = true and p.is_active = true and p.status = 'published'
    )
  );

drop policy if exists "blog_post_tags_public_read" on public.blog_post_tags;
create policy "blog_post_tags_public_read" on public.blog_post_tags
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.blog_posts bp
      where bp.id = post_id and bp.deleted_at is null
        and bp.status = 'published' and bp.is_active = true
    )
  );

-- ---------------------------------------------------------------------------
-- 2) Home Page Builder: approved layout variants + controlled accent presets
-- ---------------------------------------------------------------------------
alter table public.page_sections add column if not exists variant text not null default 'default';
alter table public.page_sections add column if not exists accent text not null default 'brand';

-- ---------------------------------------------------------------------------
-- 3) Audit attribution through the service role
-- ---------------------------------------------------------------------------
create or replace function public.set_audit_columns() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;
  -- Authenticated RLS paths set it from the JWT; service-role admin writes
  -- pass updated_by explicitly in the payload (kept when auth.uid() is null).
  if auth.uid() is not null then
    new.updated_by := auth.uid();
  end if;
  return new;
end $$;

create or replace function public.audit_row_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
begin
  if v_actor is null and tg_op <> 'DELETE' then
    v_actor := (to_jsonb(new) ->> 'updated_by')::uuid;
  end if;
  if v_actor is null then
    v_actor := (coalesce(to_jsonb(old) ->> 'updated_by', to_jsonb(old) ->> 'created_by'))::uuid;
  end if;

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
