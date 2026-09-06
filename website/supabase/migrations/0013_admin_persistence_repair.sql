-- ============================================================================
-- 0013 — Admin persistence repair
--
-- 1) site_settings has no created_by/updated_by columns, so the shared actor
--    trigger cannot be used on it. Keep its updated_at column current with a
--    table-compatible trigger instead.
-- 2) audit_logs.entity_id is UUID, while the site_settings singleton uses a
--    boolean primary key. Store NULL for non-UUID entity identifiers rather
--    than aborting the business write from an AFTER trigger.
--
-- This migration is idempotent and does not delete or rewrite existing data.
-- ============================================================================

begin;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists site_settings_audit_columns on public.site_settings;
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create or replace function public.audit_row_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
  v_row jsonb;
  v_entity_text text;
  v_entity_id uuid;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  if v_actor is null and tg_op <> 'DELETE' then
    v_actor := nullif(v_row ->> 'updated_by', '')::uuid;
  end if;
  if v_actor is null and tg_op = 'DELETE' then
    v_actor := coalesce(
      nullif(v_row ->> 'updated_by', '')::uuid,
      nullif(v_row ->> 'created_by', '')::uuid
    );
  end if;

  if v_actor is not null then
    select p.email into v_actor_email from public.profiles p where p.id = v_actor;
  end if;

  v_entity_text := v_row ->> 'id';
  if v_entity_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    v_entity_id := v_entity_text::uuid;
  else
    v_entity_id := null;
  end if;

  insert into public.audit_logs (actor_id, actor_email, action, entity, entity_id, summary, metadata)
  values (
    v_actor,
    v_actor_email,
    tg_op,
    tg_table_name,
    v_entity_id,
    tg_table_name || ' ' || lower(tg_op),
    v_row
  );

  return coalesce(new, old);
end $$;

commit;
