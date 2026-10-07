-- db/adapters/supabase/0002_storage.sql
-- Supabase-only: the bucket and access policies for uploaded wedding photos.
-- Run after 0001_auth.sql. Moving off Supabase Storage: skip this file and set
-- STORAGE_PROVIDER to another provider (see lib/storage/index.ts).
--
-- Layout: <user id>/<wedding id>/<uuid>.<ext>. A signed-in user may only write
-- inside their own <user id> folder. The bucket is public-read so published
-- sites can show photos with plain <img> URLs (filenames are unguessable UUIDs).
-- The bucket name must match SUPABASE_STORAGE_BUCKET (default: wedding-photos).
-- Limits mirror lib/storage/limits.ts.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-photos',
  'wedding-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists wedding_photos_insert_own on storage.objects;
create policy wedding_photos_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Needed so owners can delete (Supabase checks select before delete).
drop policy if exists wedding_photos_select_own on storage.objects;
create policy wedding_photos_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists wedding_photos_delete_own on storage.objects;
create policy wedding_photos_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
