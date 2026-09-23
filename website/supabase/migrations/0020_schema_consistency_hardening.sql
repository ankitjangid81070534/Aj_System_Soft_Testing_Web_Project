-- ============================================================================
-- 0020 — Schema consistency hardening (admin persistence + public reads)
--
-- WHY THIS MIGRATION EXISTS
--   A full re-read of 0001 → 0019 confirmed every admin resource declared in
--   `src/lib/admin/resources.ts` has a table, and every form field has a
--   matching column (services, clients, projects, team_members, testimonials,
--   blog_*, navigation_items, payment_links, seo_metadata, redirects, offers,
--   announcements, launch_benefits, ai_methods, social_links, case_studies,
--   trusted_clients, packages, site_settings, site_copy).
--
--   What was NOT guaranteed is that a database which applied those files at
--   different points in time has the *latest* helper functions and the *right*
--   trigger attached to every table. The known admin save failures come from
--   exactly that drift:
--     * `set_audit_columns` blindly assigned NEW.created_by / NEW.updated_by,
--       so attaching it to a table without those columns aborted the save with
--       `42703 record "new" has no field "created_by"`.
--     * a payload sending an explicit NULL for a NOT NULL column (an empty
--       admin input is normalised to NULL app-side) aborted with `23502`,
--       even though the column has a sensible default.
--     * older `audit_row_change` versions could roll back a valid content
--       write when the audit insert itself failed.
--
--   This migration re-asserts the newest helper functions, makes them
--   column-aware, and then walks every CMS table to attach exactly the
--   triggers, grants, RLS flag and indexes that table can support.
--
-- SAFETY CONTRACT (same as 0016 → 0019)
--   * Purely ADDITIVE and IDEMPOTENT — safe to run the whole folder,
--     0001 → 0020, in numeric order, as many times as needed.
--   * Nothing is dropped, truncated, renamed, re-typed or rewritten. No
--     existing row is touched: every piece of admin data already saved in
--     Supabase survives untouched.
--   * No RLS policy is removed — the policies from 0001 → 0019 stay exactly as
--     they are; this file only re-attaches triggers, grants and indexes.
--   * No seed / demo rows. The admin owns all content.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. updated_at helper (tables without actor columns)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Column-aware audit-column stamping.
--    Works on ANY table: it only writes columns that actually exist, so
--    attaching it can never abort a save with "record new has no field ...".
-- ---------------------------------------------------------------------------
create or replace function public.set_audit_columns() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_row   jsonb := to_jsonb(new);
  v_patch jsonb := '{}'::jsonb;
begin
  if v_row ? 'updated_at' then
    v_patch := v_patch || jsonb_build_object('updated_at', now());
  end if;

  if v_row ? 'updated_by' then
    v_patch := v_patch || jsonb_build_object('updated_by', auth.uid());
  end if;

  if tg_op = 'INSERT' then
    if v_row ? 'created_by' and v_row ->> 'created_by' is null then
      v_patch := v_patch || jsonb_build_object('created_by', auth.uid());
    end if;
    if v_row ? 'created_at' and v_row ->> 'created_at' is null then
      v_patch := v_patch || jsonb_build_object('created_at', now());
    end if;
  end if;

  if v_patch <> '{}'::jsonb then
    new := jsonb_populate_record(new, v_row || v_patch);
  end if;

  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 3. NOT NULL guard — an empty admin input arrives as NULL; fill a
--    type-appropriate empty value instead of failing the whole save with
--    23502. Columns the admin actually filled are never touched.
-- ---------------------------------------------------------------------------
create or replace function public.fill_not_null_defaults() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_row     jsonb := to_jsonb(new);
  v_patch   jsonb := '{}'::jsonb;
  v_default jsonb;
  c         record;
begin
  for c in
    select
      a.attname,
      pg_catalog.format_type(a.atttypid, a.atttypmod) as coltype,
      pg_catalog.pg_get_expr(d.adbin, d.adrelid) as coldefault
    from pg_catalog.pg_attribute a
    left join pg_catalog.pg_attrdef d
      on d.adrelid = a.attrelid and d.adnum = a.attnum
    where a.attrelid = tg_relid
      and a.attnum > 0
      and not a.attisdropped
      and a.attnotnull
  loop
    if v_row ? c.attname and v_row ->> c.attname is null then
      -- Prefer the column's own default (enums, statuses, generated values).
      v_default := null;
      if c.coldefault is not null then
        begin
          execute 'select to_jsonb(' || c.coldefault || ')' into v_default;
        exception when others then
          v_default := null;
        end;
      end if;

      if v_default is not null and v_default <> 'null'::jsonb then
        v_patch := v_patch || jsonb_build_object(c.attname, v_default);
        continue;
      end if;

      v_patch := v_patch || case
        when c.coltype in ('text', 'character varying', 'citext')
          then jsonb_build_object(c.attname, '')
        when c.coltype = 'boolean'
          then jsonb_build_object(c.attname, false)
        when c.coltype in ('smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision')
          then jsonb_build_object(c.attname, 0)
        when c.coltype in ('timestamp with time zone', 'timestamp without time zone')
          then jsonb_build_object(c.attname, now())
        when c.coltype = 'date'
          then jsonb_build_object(c.attname, current_date)
        when c.coltype in ('jsonb', 'json') or c.coltype like '%[]'
          then jsonb_build_object(c.attname, '[]'::jsonb)
        else '{}'::jsonb
      end;
    end if;
  end loop;

  if v_patch <> '{}'::jsonb then
    new := jsonb_populate_record(new, v_row || v_patch);
  end if;

  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Best-effort audit logging (latest 0015 behaviour, re-asserted).
--    A failing audit insert must never roll back a valid content write.
-- ---------------------------------------------------------------------------
create or replace function public.audit_row_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
  v_row jsonb;
  v_entity_id uuid;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  if v_actor is null then
    begin
      v_actor := nullif(
        coalesce(v_row ->> 'updated_by', v_row ->> 'created_by', v_row ->> 'uploaded_by'),
        ''
      )::uuid;
    exception when others then
      v_actor := null;
    end;
  end if;

  begin
    v_entity_id := nullif(v_row ->> 'id', '')::uuid;
  exception when others then
    v_entity_id := null;
  end;

  if v_actor is not null then
    begin
      select p.email into v_actor_email from public.profiles p where p.id = v_actor;
    exception when others then
      v_actor_email := null;
    end;
  end if;

  v_row := v_row
    - 'password'
    - 'password_hash'
    - 'access_token'
    - 'refresh_token'
    - 'service_role_key'
    - 'oauth_code';

  begin
    insert into public.audit_logs
      (actor_id, actor_email, action, entity, entity_id, summary, metadata)
    values (
      v_actor, v_actor_email, tg_op, tg_table_name, v_entity_id,
      tg_table_name || ' ' || lower(tg_op), v_row
    );
  exception when others then
    raise warning '[audit] % % was not recorded (SQLSTATE %)', tg_table_name, tg_op, sqlstate;
  end;

  return coalesce(new, old);
end $$;

-- ---------------------------------------------------------------------------
-- 5. Walk every CMS / admin-writable table and attach exactly what it supports:
--      * row level security enabled
--      * NOT NULL guard   (all tables)
--      * audit columns    (tables with updated_by)
--        or updated_at    (tables with updated_at only)
--      * change audit     (all tables, best-effort)
--      * grants: select → anon, authenticated · all → service_role
--      * read-path indexes for sort_order / status / deleted_at / is_active
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  v_tables text[] := array[
    'site_settings', 'navigation_items', 'page_sections', 'seo_metadata', 'redirects',
    'services', 'service_faqs', 'clients', 'projects', 'project_media',
    'team_members', 'testimonials',
    'blog_categories', 'blog_tags', 'blog_posts', 'blog_post_tags',
    'contact_submissions', 'quote_requests', 'appointment_requests', 'payment_links',
    'media_assets', 'trusted_clients', 'case_studies', 'packages',
    'offers', 'announcements', 'launch_benefits', 'social_links',
    'agreements', 'agreement_versions', 'ai_methods', 'site_copy'
  ];
  has_updated_by boolean;
  has_updated_at boolean;
begin
  foreach t in array v_tables loop
    if to_regclass('public.' || t) is null then
      raise notice '[0020] skipped %, table not present', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    -- NOT NULL guard
    execute format('drop trigger if exists %I on public.%I', t || '_fill_not_null', t);
    execute format(
      'create trigger %I before insert or update on public.%I
         for each row execute function public.fill_not_null_defaults()',
      t || '_fill_not_null', t
    );

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'updated_by'
    ) into has_updated_by;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'updated_at'
    ) into has_updated_at;

    -- One stamping trigger per table, matched to the columns it really has.
    execute format('drop trigger if exists %I on public.%I', t || '_audit_columns', t);
    execute format('drop trigger if exists %I on public.%I', t || '_updated_at', t);
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);

    if has_updated_by then
      execute format(
        'create trigger %I before insert or update on public.%I
           for each row execute function public.set_audit_columns()',
        t || '_audit_columns', t
      );
    elsif has_updated_at then
      execute format(
        'create trigger %I before update on public.%I
           for each row execute function public.set_updated_at()',
        t || '_updated_at', t
      );
    end if;

    -- Change audit (best-effort; never blocks the write).
    if to_regclass('public.audit_logs') is not null then
      execute format('drop trigger if exists %I on public.%I', 'audit_' || t, t);
      execute format(
        'create trigger %I after insert or update or delete on public.%I
           for each row execute function public.audit_row_change()',
        'audit_' || t, t
      );
    end if;

    -- Privileges (RLS still decides row visibility for anon/authenticated).
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);

    -- Read-path indexes, only where the column exists.
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = t and column_name = 'sort_order') then
      execute format('create index if not exists %I on public.%I (sort_order)', t || '_sort_order_idx', t);
    end if;

    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = t and column_name = 'status') then
      execute format('create index if not exists %I on public.%I (status)', t || '_status_idx', t);
    end if;

    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = t and column_name = 'deleted_at') then
      execute format('create index if not exists %I on public.%I (deleted_at)', t || '_deleted_at_idx', t);
    end if;

    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = t and column_name = 'is_active') then
      execute format('create index if not exists %I on public.%I (is_active)', t || '_is_active_idx', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. The singleton settings row must exist, otherwise the admin "Settings"
--    form has nothing to update and the public site falls back to defaults.
-- ---------------------------------------------------------------------------
insert into public.site_settings (id) values (true) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 7. Post-migration self-check — fail loudly instead of silently leaving an
--    admin module broken. Extend the list when a new admin resource is added.
-- ---------------------------------------------------------------------------
do $$
declare
  v_missing text;
begin
  select string_agg(x.name, ', ')
    into v_missing
  from (values
    ('site_settings'), ('navigation_items'), ('page_sections'), ('seo_metadata'),
    ('redirects'), ('services'), ('service_faqs'), ('clients'), ('projects'),
    ('project_media'), ('team_members'), ('testimonials'), ('blog_categories'),
    ('blog_tags'), ('blog_posts'), ('blog_post_tags'), ('contact_submissions'),
    ('quote_requests'), ('appointment_requests'), ('payment_links'),
    ('media_assets'), ('audit_logs'), ('trusted_clients'), ('case_studies'),
    ('packages'), ('offers'), ('announcements'), ('launch_benefits'),
    ('social_links'), ('ai_methods'), ('site_copy')
  ) as x(name)
  where to_regclass('public.' || x.name) is null;

  if v_missing is not null then
    raise exception '[0020] missing tables: % — run migrations 0001 → 0020 in order', v_missing;
  end if;

  raise notice '[0020] schema consistency hardening applied — all admin tables present';
end $$;

commit;
