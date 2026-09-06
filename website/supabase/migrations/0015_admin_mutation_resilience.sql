-- ============================================================================
-- 0015 — Admin mutation resilience
--
-- The audit trigger is intentionally best-effort. A malformed legacy row or
-- an audit-table outage must be visible in Postgres logs, but must not roll
-- back a content change that already passed auth, validation and constraints.
-- This also accepts every PostgreSQL UUID version and safely stores NULL for
-- singleton/non-UUID primary keys such as site_settings.id (boolean).
--
-- Idempotent. No production rows are deleted or rewritten.
-- ============================================================================

begin;

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
    exception when invalid_text_representation then
      v_actor := null;
    end;
  end if;

  begin
    v_entity_id := nullif(v_row ->> 'id', '')::uuid;
  exception when invalid_text_representation then
    v_entity_id := null;
  end;

  if v_actor is not null then
    select p.email into v_actor_email from public.profiles p where p.id = v_actor;
  end if;

  -- Never persist credential-shaped fields if a future audited table happens
  -- to contain them. Current CMS tables do not store plaintext credentials.
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
      v_actor,
      v_actor_email,
      tg_op,
      tg_table_name,
      v_entity_id,
      tg_table_name || ' ' || lower(tg_op),
      v_row
    );
  exception when others then
    raise warning '[audit] % % was not recorded (SQLSTATE %)', tg_table_name, tg_op, sqlstate;
  end;

  return coalesce(new, old);
end $$;

-- Fail migration application early if the known singleton trigger regression
-- was reintroduced by schema drift.
do $$
begin
  if exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'site_settings'
      and t.tgname = 'site_settings_audit_columns'
      and not t.tgisinternal
  ) then
    raise exception 'site_settings_audit_columns is incompatible with the singleton table';
  end if;
end $$;

commit;

