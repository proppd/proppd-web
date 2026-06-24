-- Digital mandate capture: agents record mandate type, seller name,
-- agreed commission, and expiry date directly on the listing.
alter table public.listings
  add column if not exists mandate_type        text check (mandate_type in ('sole','joint','open')),
  add column if not exists mandate_seller_name text,
  add column if not exists mandate_commission_pct numeric(5,2),
  add column if not exists mandate_expires_at  date;
