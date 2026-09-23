-- ============================================================================
-- 0021 — In-app AI tools, WhatsApp-style client chat, admin 2FA
--
-- Additive and idempotent, exactly like 0001 → 0020: every `create policy` /
-- `create trigger` is preceded by `drop … if exists`, tables use
-- `create table if not exists`, indexes `if not exists`. Safe to re-run.
--
-- Three areas:
--   1. ai_tool_runs        — per-user usage log for the in-app AI tools.
--   2. conversations +
--      chat_messages       — realtime client↔staff chat (text/image/file/voice)
--                            plus the `chat-media` private storage bucket.
--   3. admin_totp          — encrypted TOTP secrets for the admin 2FA gate.
--
-- Client data isolation is enforced by RLS on every table below: a client only
-- ever sees rows owned by their own auth.uid(). Staff access goes through
-- public.has_role('editor').
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. AI tool usage
-- ---------------------------------------------------------------------------
create table if not exists public.ai_tool_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  tool_id text not null,
  tool_name text not null default '',
  provider text not null default '',
  model text not null default '',
  input_chars integer not null default 0,
  output_chars integer not null default 0,
  duration_ms integer not null default 0,
  status text not null default 'success',
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists ai_tool_runs_user_idx on public.ai_tool_runs (user_id, created_at desc);
create index if not exists ai_tool_runs_tool_idx on public.ai_tool_runs (tool_id, created_at desc);

alter table public.ai_tool_runs enable row level security;

-- Each client sees ONLY their own runs.
drop policy if exists "ai_tool_runs_own_select" on public.ai_tool_runs;
create policy "ai_tool_runs_own_select" on public.ai_tool_runs
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "ai_tool_runs_staff_select" on public.ai_tool_runs;
create policy "ai_tool_runs_staff_select" on public.ai_tool_runs
  for select to authenticated
  using (public.has_role('editor'));

-- Writes happen server-side with the service role only.
grant select on public.ai_tool_runs to authenticated;
grant all on public.ai_tool_runs to service_role;

-- ---------------------------------------------------------------------------
-- 2. Chat — conversations
--
-- One conversation per client account (`owner_id` = the client's auth user).
-- Staff reply into the same row, so no join table is needed for the 1:1
-- client↔team thread the portal exposes.
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null default 'Support',
  last_message_at timestamptz not null default now(),
  last_message_preview text not null default '',
  unread_for_client integer not null default 0,
  unread_for_staff integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversations_owner_key on public.conversations (owner_id);
create index if not exists conversations_recent_idx on public.conversations (last_message_at desc);

alter table public.conversations enable row level security;

drop policy if exists "conversations_owner_select" on public.conversations;
create policy "conversations_owner_select" on public.conversations
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "conversations_owner_insert" on public.conversations;
create policy "conversations_owner_insert" on public.conversations
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "conversations_owner_update" on public.conversations;
create policy "conversations_owner_update" on public.conversations
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "conversations_staff_all" on public.conversations;
create policy "conversations_staff_all" on public.conversations
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2b. Chat — messages (text / image / file / voice)
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  sender_role text not null default 'client',
  kind text not null default 'text',
  body text not null default '',
  attachment_path text,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  duration_seconds integer,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.chat_messages
  add column if not exists duration_seconds integer;

create index if not exists chat_messages_thread_idx
  on public.chat_messages (conversation_id, created_at);

alter table public.chat_messages enable row level security;

-- A client reads and writes messages only inside their OWN conversation.
drop policy if exists "chat_messages_owner_select" on public.chat_messages;
create policy "chat_messages_owner_select" on public.chat_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
        and c.owner_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_owner_insert" on public.chat_messages;
create policy "chat_messages_owner_insert" on public.chat_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and sender_role = 'client'
    and exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
        and c.owner_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_staff_all" on public.chat_messages;
create policy "chat_messages_staff_all" on public.chat_messages
  for all to authenticated
  using (public.has_role('editor'))
  with check (public.has_role('editor'));

-- Keep the sidebar preview / unread counters correct without a round trip.
create or replace function public.chat_touch_conversation() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations c
     set last_message_at = new.created_at,
         last_message_preview = left(
           case
             when new.kind = 'image' then 'Photo'
             when new.kind = 'voice' then 'Voice message'
             when new.kind = 'file' then coalesce(new.attachment_name, 'File')
             else new.body
           end, 140),
         unread_for_client = case when new.sender_role = 'client'
           then c.unread_for_client else c.unread_for_client + 1 end,
         unread_for_staff = case when new.sender_role = 'client'
           then c.unread_for_staff + 1 else c.unread_for_staff end
   where c.id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_touch_conversation on public.chat_messages;
create trigger chat_messages_touch_conversation
  after insert on public.chat_messages
  for each row execute function public.chat_touch_conversation();

-- Realtime: stream inserts of both tables to subscribed clients. RLS above
-- still decides who receives which row.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.chat_messages;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.conversations;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2c. Chat attachments bucket — private, one folder per auth user.
-- Path convention: <auth.uid()>/<conversation-id>/<filename>
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media', 'chat-media', false, 26214400,
  array[
    'image/jpeg','image/png','image/webp','image/avif','image/gif',
    'audio/webm','audio/ogg','audio/mpeg','audio/mp4','audio/wav',
    'application/pdf','application/zip','text/plain','text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat_media_owner_read" on storage.objects;
create policy "chat_media_owner_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-media'
    and (public.has_role('editor') or (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists "chat_media_owner_insert" on storage.objects;
create policy "chat_media_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-media'
    and (public.has_role('editor') or (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists "chat_media_owner_delete" on storage.objects;
create policy "chat_media_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'chat-media'
    and (public.has_role('editor') or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ---------------------------------------------------------------------------
-- 3. Admin 2FA — TOTP secrets, encrypted application-side (AES-256-GCM).
-- The database never sees the plaintext secret; only the server holds the key.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_totp (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  secret_encrypted text not null,
  confirmed_at timestamptz,
  last_used_step bigint,
  recovery_codes_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_totp enable row level security;

-- Enrolment and verification run server-side with the service role. This
-- policy only lets a staff user learn whether their OWN 2FA is enrolled.
drop policy if exists "admin_totp_self_select" on public.admin_totp;
create policy "admin_totp_self_select" on public.admin_totp
  for select to authenticated
  using (user_id = auth.uid());

revoke all on public.admin_totp from anon;
grant select on public.admin_totp to authenticated;
grant all on public.admin_totp to service_role;

drop trigger if exists admin_totp_set_updated_at on public.admin_totp;
create trigger admin_totp_set_updated_at
  before update on public.admin_totp
  for each row execute function public.set_updated_at();

drop trigger if exists audit_admin_totp on public.admin_totp;
create trigger audit_admin_totp after insert or update or delete on public.admin_totp
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- Self-check — fail loudly if anything above did not land.
-- ---------------------------------------------------------------------------
do $$
declare
  missing text[] := array[]::text[];
  t text;
begin
  foreach t in array array['ai_tool_runs','conversations','chat_messages','admin_totp'] loop
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      missing := missing || t;
    end if;
  end loop;
  if array_length(missing, 1) > 0 then
    raise exception '0021 incomplete — missing tables: %', array_to_string(missing, ', ');
  end if;
end $$;
