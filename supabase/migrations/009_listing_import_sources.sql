-- Feed import support: track where a listing came from so re-importing an
-- agency feed updates existing rows instead of creating duplicates.

alter table public.listings
  add column if not exists source text,
  add column if not exists external_ref text,
  add column if not exists imported_at timestamptz;

-- A given agency cannot have two listings with the same external reference.
-- Partial index so manually-created listings (null external_ref) are unaffected.
create unique index if not exists listings_agency_external_ref_idx
  on public.listings (agency_id, external_ref)
  where external_ref is not null;

comment on column public.listings.source is 'Origin of the listing, e.g. agency feed name or "manual".';
comment on column public.listings.external_ref is 'Agency/CRM reference used to deduplicate feed re-imports.';
comment on column public.listings.imported_at is 'Timestamp of the most recent feed import for this listing.';
