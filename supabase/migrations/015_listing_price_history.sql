-- Listing price history: records the asking price over time so buyers see
-- a real price timeline and price-drop badges can be shown.
-- Populated by a trigger on insert (initial price) and on any price change.

create table if not exists public.listing_price_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  price numeric(14, 2) not null check (price >= 0),
  recorded_at timestamptz not null default now()
);

create index if not exists listing_price_history_listing_idx
  on public.listing_price_history(listing_id, recorded_at);

alter table public.listing_price_history enable row level security;

-- Price is public for published listings, so anyone may read the history.
drop policy if exists "public can read price history" on public.listing_price_history;
create policy "public can read price history" on public.listing_price_history
for select using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.status in ('available', 'under_offer', 'sold', 'rented')
  )
);

-- Trigger: record a history row whenever a listing is created or its price changes.
create or replace function public.record_listing_price_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.listing_price_history (listing_id, price)
    values (new.id, new.price);
  elsif (tg_op = 'UPDATE' and new.price is distinct from old.price) then
    insert into public.listing_price_history (listing_id, price)
    values (new.id, new.price);
  end if;
  return new;
end;
$$;

drop trigger if exists listings_record_price_change on public.listings;
create trigger listings_record_price_change
after insert or update of price
on public.listings
for each row execute function public.record_listing_price_change();

-- Backfill an initial history row for existing listings that have none.
insert into public.listing_price_history (listing_id, price, recorded_at)
select l.id, l.price, coalesce(l.published_at, l.created_at)
from public.listings l
where not exists (
  select 1 from public.listing_price_history h where h.listing_id = l.id
);
