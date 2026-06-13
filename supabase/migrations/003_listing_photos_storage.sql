-- Storage bucket for agent-uploaded listing photos.
-- Public-read so listing pages can render images directly; writes are limited to
-- authenticated users, scoped to their own folder (first path segment = user id).

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

-- Anyone can view listing photos (listings are a public portal).
drop policy if exists "listing photos are publicly readable" on storage.objects;
create policy "listing photos are publicly readable" on storage.objects
for select using (bucket_id = 'listing-photos');

-- Authenticated users can upload into their own folder: listing-photos/{auth.uid}/...
drop policy if exists "agents upload own listing photos" on storage.objects;
create policy "agents upload own listing photos" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can update/replace their own photos.
drop policy if exists "agents update own listing photos" on storage.objects;
create policy "agents update own listing photos" on storage.objects
for update to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can delete their own photos.
drop policy if exists "agents delete own listing photos" on storage.objects;
create policy "agents delete own listing photos" on storage.objects
for delete to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
