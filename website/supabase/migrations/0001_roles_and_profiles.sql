-- ============================================================================
-- 0001 — Identity, roles, shared triggers and helper functions
-- AJ System Soft Technology website schema
--
-- Applied on hosted Supabase (SQL editor or CLI). Idempotent: safe to re-run.
-- Roles (rank): super_admin(3) > admin(2) > editor(1)
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('super_admin', 'admin', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum (
    'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Role helpers — SECURITY DEFINER so RLS policies can call them without
-- recursing into the profiles policies.
-- ---------------------------------------------------------------------------
create or replace function public.my_role() returns public.app_role
language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.has_role(required public.app_role) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (case p.role when 'super_admin' then 3 when 'admin' then 2 else 1 end)
        >= (case required when 'super_admin' then 3 when 'admin' then 2 else 1 end)
  )
$$;

grant execute on function public.my_role() to anon, authenticated, service_role;
grant execute on function public.has_role(public.app_role) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Auto-create a profile for every new auth user (default role: editor).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@users.invalid'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role changes: only a super admin (or a JWT-less maintenance session such as
-- the SQL editor / service role — used by the documented bootstrap flow).
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    if not public.has_role('super_admin') then
      raise exception 'Only a super admin can change roles';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_profile_role_change on public.profiles;
create trigger guard_profile_role_change
  before update on public.profiles
  for each row execute function public.guard_profile_role_change();

-- ---------------------------------------------------------------------------
-- Shared trigger: maintain created_by / updated_by / updated_at on tables that
-- carry those columns. Apply per table in the owning migration.
-- ---------------------------------------------------------------------------
create or replace function public.set_audit_columns() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;
  new.updated_by := auth.uid();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles RLS: staff see each other (author display); self-service profile
-- edits; role changes are additionally guarded by the trigger above.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_staff_or_self_select" on public.profiles;
create policy "profiles_staff_or_self_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role('admin'));

drop policy if exists "profiles_self_or_super_admin_update" on public.profiles;
create policy "profiles_self_or_super_admin_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.has_role('super_admin'))
  with check (id = auth.uid() or public.has_role('super_admin'));
