-- ============================================================================
-- 0011 — Client Portal & Verified Reviews Schema Hardening
-- Safe, idempotent migration for AJ System Soft Technology
-- ============================================================================

-- 1. Add 'client' to app_role enum if not already present
do $$ begin
  alter type public.app_role add value if not exists 'client';
exception when duplicate_object then null; end $$;

-- 2. Update role ranking function to support 'client' safely
create or replace function public.has_role(required public.app_role) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (case p.role::text
        when 'super_admin' then 4
        when 'admin' then 3
        when 'editor' then 2
        when 'client' then 1
        else 0
      end)
      >= (case required::text
        when 'super_admin' then 4
        when 'admin' then 3
        when 'editor' then 2
        when 'client' then 1
        else 0
      end)
  )
$$;

-- 3. Enhance testimonials table for verified reviews
alter table public.testimonials
  add column if not exists rating integer default 5 check (rating >= 1 and rating <= 5),
  add column if not exists title text,
  add column if not exists review_text text,
  add column if not exists project_name text,
  add column if not exists admin_response text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists submitted_by uuid references auth.users(id) on delete set null;

-- Preserve already-published, admin-curated testimonials during the upgrade.
-- New client submissions remain unverified unless a real client link exists.
update public.testimonials
set is_verified = true
where status = 'published'
  and is_public = true
  and submitted_by is null;

-- Synchronize quote with review_text if review_text is populated
create or replace function public.sync_testimonial_quote() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.review_text is not null and new.quote is null then
    new.quote := new.review_text;
  elsif new.quote is not null and new.review_text is null then
    new.review_text := new.quote;
  end if;
  return new;
end $$;

drop trigger if exists trg_sync_testimonial_quote on public.testimonials;
create trigger trg_sync_testimonial_quote
  before insert or update on public.testimonials
  for each row execute function public.sync_testimonial_quote();

-- 4. Allow authenticated clients to view their own submitted reviews and insert new reviews
drop policy if exists "testimonials_client_own_read" on public.testimonials;
create policy "testimonials_client_own_read" on public.testimonials
  for select to authenticated
  using (submitted_by = auth.uid());

-- 0012 installs the verified-client insert policy after the clients/auth link
-- exists. Keep this migration fail-closed instead of allowing random users.
drop policy if exists "testimonials_client_insert" on public.testimonials;

-- 5. Enhance clients table for portal authentication mapping
alter table public.clients
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists portal_enabled boolean not null default true,
  add column if not exists portal_last_login timestamptz;

create index if not exists clients_auth_user_idx on public.clients (auth_user_id);

drop policy if exists "clients_portal_read" on public.clients;
create policy "clients_portal_read" on public.clients
  for select to authenticated
  using (auth_user_id = auth.uid());

-- 6. Client Portal Documents table
create table if not exists public.client_portal_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  file_size_bytes bigint,
  file_type text,
  category text not null default 'deliverable',
  is_visible_to_client boolean not null default true,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_portal_documents_client_idx on public.client_portal_documents (client_id, created_at);

alter table public.client_portal_documents enable row level security;

drop policy if exists "client_portal_documents_staff_all" on public.client_portal_documents;
create policy "client_portal_documents_staff_all" on public.client_portal_documents
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop policy if exists "client_portal_documents_client_read" on public.client_portal_documents;
create policy "client_portal_documents_client_read" on public.client_portal_documents
  for select to authenticated
  using (
    is_visible_to_client = true and
    exists (
      select 1 from public.clients c
      where c.id = client_portal_documents.client_id
        and c.auth_user_id = auth.uid()
    )
  );

drop trigger if exists client_portal_documents_audit_columns on public.client_portal_documents;
create trigger client_portal_documents_audit_columns
  before insert or update on public.client_portal_documents
  for each row execute function public.set_audit_columns();

-- 7. Client Portal Messages table
create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  is_from_client boolean not null default true,
  subject text not null default 'Message',
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_messages_client_idx on public.client_messages (client_id, created_at);

alter table public.client_messages enable row level security;

drop policy if exists "client_messages_staff_all" on public.client_messages;
create policy "client_messages_staff_all" on public.client_messages
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop policy if exists "client_messages_client_select" on public.client_messages;
create policy "client_messages_client_select" on public.client_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_messages.client_id
        and c.auth_user_id = auth.uid()
    )
  );

drop policy if exists "client_messages_client_insert" on public.client_messages;
create policy "client_messages_client_insert" on public.client_messages
  for insert to authenticated
  with check (
    is_from_client = true and
    exists (
      select 1 from public.clients c
      where c.id = client_messages.client_id
        and c.auth_user_id = auth.uid()
    )
  );

drop trigger if exists client_messages_audit_columns on public.client_messages;
create trigger client_messages_audit_columns
  before insert or update on public.client_messages
  for each row execute function public.set_audit_columns();

-- 8. Connect audit logging to new tables
drop trigger if exists audit_client_portal_documents on public.client_portal_documents;
create trigger audit_client_portal_documents after insert or update or delete on public.client_portal_documents
  for each row execute function public.audit_row_change();

drop trigger if exists audit_client_messages on public.client_messages;
create trigger audit_client_messages after insert or update or delete on public.client_messages
  for each row execute function public.audit_row_change();
