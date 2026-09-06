-- ============================================================================
-- 0009 — Lead attachments storage
-- Private bucket for optional quote-request attachments. Uploads happen
-- server-side through the service-role client; anonymous visitors get NO
-- storage access at all. Staff read via policy; admin views use signed URLs.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-attachments',
  'lead-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lead_attachments_staff_read" on storage.objects;
create policy "lead_attachments_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'lead-attachments' and public.has_role('admin'));

-- No anon policies: the public cannot list, read, upload or delete here.
-- No update/delete policies for staff either: attachments are immutable
-- once stored; cleanup is a service-role / dashboard operation.
