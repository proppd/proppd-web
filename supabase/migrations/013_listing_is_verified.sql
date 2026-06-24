-- Listing verification flag: admin/agent marks a listing as Proppd-verified.
-- A verified badge is displayed on public listing cards and the detail page.
alter table public.listings
  add column if not exists is_verified boolean not null default false;
