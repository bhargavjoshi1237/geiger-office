-- ─────────────────────────────────────────────────────────────────────────────
-- Geiger Office — storage bucket for embedded media (images in docs/slides)
-- Run this in your Supabase SQL editor after files.sql.
--
-- Files live under  office-assets/{user_id}/{filename}  and RLS restricts
-- writes/deletes to the owning user's folder. Reads are public so embedded
-- images render without signed URLs.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('office-assets', 'office-assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Office assets are publicly readable"   on storage.objects;
drop policy if exists "Office assets insert own folder"       on storage.objects;
drop policy if exists "Office assets update own folder"       on storage.objects;
drop policy if exists "Office assets delete own folder"       on storage.objects;

create policy "Office assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'office-assets');

create policy "Office assets insert own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'office-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Office assets update own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'office-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Office assets delete own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'office-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
