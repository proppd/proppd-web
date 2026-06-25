-- Add coming_soon to listing_status enum (idempotent)
alter type public.listing_status add value if not exists 'coming_soon' before 'archived';
