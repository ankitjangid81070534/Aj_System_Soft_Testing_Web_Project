-- ============================================================================
-- 0012 — Client authentication, verified-review enforcement & admin usernames
-- AJ System Soft Technology
--
-- Additive production migration. It does not delete or rewrite existing
-- content. Apply only after 0011_client_portal_and_reviews.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. New public sign-ups must never inherit a staff role.
-- Existing roles are intentionally preserved; only future profiles default to
-- client. Staff promotion remains a deliberate Super Admin action.
-- ---------------------------------------------------------------------------
alter table public.profiles
  alter column role set default 'client',
  add column if not exists phone text,
  add column if not exists company text;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, company, role)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@users.invalid'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'company',
    'client'
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Private username -> Auth user mapping for staff login.
-- No anon/authenticated policy is created: only the trusted server-side
-- service-role client can resolve this table.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_usernames (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_usernames_normalized check (username = lower(btrim(username))),
  constraint admin_usernames_format check (username ~ '^[a-z0-9][a-z0-9._-]{2,31}$')
);

create unique index if not exists admin_usernames_username_key
  on public.admin_usernames (lower(username));

alter table public.admin_usernames enable row level security;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists admin_usernames_updated_at on public.admin_usernames;
create trigger admin_usernames_updated_at
  before update on public.admin_usernames
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Link signed-in users to their own enquiries for the client dashboard.
-- Anonymous submissions remain supported; authenticated submissions carry the
-- auth user id from the server action.
-- ---------------------------------------------------------------------------
alter table public.contact_submissions
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

alter table public.quote_requests
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

create index if not exists contact_submissions_auth_user_idx
  on public.contact_submissions (auth_user_id, created_at desc);

create index if not exists quote_requests_auth_user_idx
  on public.quote_requests (auth_user_id, created_at desc);

drop policy if exists "contact_client_own_read" on public.contact_submissions;
create policy "contact_client_own_read" on public.contact_submissions
  for select to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists "quote_client_own_read" on public.quote_requests;
create policy "quote_client_own_read" on public.quote_requests
  for select to authenticated
  using (auth_user_id = auth.uid());

-- Verified clients may see their own project records even when the project is
-- intentionally excluded from the public portfolio.
drop policy if exists "projects_client_own_read" on public.projects;
create policy "projects_client_own_read" on public.projects
  for select to authenticated
  using (
    exists (
      select 1
      from public.clients c
      where c.id = projects.client_id
        and c.auth_user_id = auth.uid()
        and c.portal_enabled = true
        and c.deleted_at is null
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Verified reviews: random sign-up is not sufficient. A reviewer must be
-- linked by staff to an active client row. Client submissions are forced to
-- remain non-public drafts until staff moderation.
-- ---------------------------------------------------------------------------
alter table public.testimonials
  alter column is_verified set default false;

drop policy if exists "testimonials_client_insert" on public.testimonials;
create policy "testimonials_verified_client_insert" on public.testimonials
  for insert to authenticated
  with check (
    submitted_by = auth.uid()
    and status = 'draft'
    and is_public = false
    and is_active = true
    and is_verified = true
    and admin_response is null
    and exists (
      select 1
      from public.clients c
      where c.id = testimonials.client_id
        and c.auth_user_id = auth.uid()
        and c.portal_enabled = true
        and c.is_active = true
        and c.deleted_at is null
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Self-service profile avatars. Files are public, but clients may write
-- only inside their own UUID folder. Bucket MIME/size constraints provide the
-- second validation layer after the server action.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  3145728,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_avatars_public_read" on storage.objects;
create policy "profile_avatars_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'profile-avatars');

drop policy if exists "profile_avatars_owner_insert" on storage.objects;
create policy "profile_avatars_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile_avatars_owner_update" on storage.objects;
create policy "profile_avatars_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile_avatars_owner_delete" on storage.objects;
create policy "profile_avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
