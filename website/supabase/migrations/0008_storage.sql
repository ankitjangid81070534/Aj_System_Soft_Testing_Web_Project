-- ============================================================================
-- 0008 — Storage buckets + access policies
-- Public buckets serve media via public URLs; private-media is restricted to
-- staff and delivered through signed URLs created server-side.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-site',   'public-site',   true,  10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('project-media', 'project-media', true,  52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4']),
  ('team-media',    'team-media',    true,  10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('client-media',  'client-media',  true,  10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('blog-media',    'blog-media',    true,  10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('private-media', 'private-media', false, 52428800, array['image/jpeg','image/png','image/webp','image/avif','application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Public read: anon/authenticated may SELECT (list/download) only from the
-- public buckets. private-media is deliberately absent.
-- ---------------------------------------------------------------------------
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id in ('public-site', 'project-media', 'team-media', 'client-media', 'blog-media')
  );

-- Staff read: editors and above may also read private-media.
drop policy if exists "media_staff_read_private" on storage.objects;
create policy "media_staff_read_private" on storage.objects
  for select to authenticated
  using (bucket_id = 'private-media' and public.has_role('editor'));

-- Staff writes: editors and above, in any of the six buckets. Mime/size rules
-- are enforced by the bucket settings above.
drop policy if exists "media_staff_insert" on storage.objects;
create policy "media_staff_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('public-site', 'project-media', 'team-media', 'client-media', 'blog-media', 'private-media')
    and public.has_role('editor')
  );

drop policy if exists "media_staff_update" on storage.objects;
create policy "media_staff_update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('public-site', 'project-media', 'team-media', 'client-media', 'blog-media', 'private-media')
    and public.has_role('editor')
  )
  with check (
    bucket_id in ('public-site', 'project-media', 'team-media', 'client-media', 'blog-media', 'private-media')
    and public.has_role('editor')
  );

drop policy if exists "media_staff_delete" on storage.objects;
create policy "media_staff_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('public-site', 'project-media', 'team-media', 'client-media', 'blog-media', 'private-media')
    and public.has_role('editor')
  );
