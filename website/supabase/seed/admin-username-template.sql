-- ADMIN USERNAME BOOTSTRAP TEMPLATE
-- Run only after migrations 0011 and 0012.
-- Replace both placeholders. Passwords stay exclusively in Supabase Auth.

insert into public.admin_usernames (user_id, username, is_active)
select
  p.id,
  lower('REPLACE_WITH_STAFF_USERNAME'),
  true
from public.profiles p
where p.id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid
  and p.role in ('super_admin', 'admin', 'editor')
on conflict (user_id) do update
set
  username = excluded.username,
  is_active = true,
  updated_at = now();

-- Safe verification: this returns no password or Auth secret.
select user_id, username, is_active, updated_at
from public.admin_usernames
where user_id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid;

