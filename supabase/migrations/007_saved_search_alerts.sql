-- Proppd saved-search alerts: capture the owner's email at save time and track
-- when each search was last alerted, so a scheduled matcher can email new
-- matching listings without duplicates. Idempotent: safe to re-apply.

alter table public.saved_searches add column if not exists email text;
alter table public.saved_searches add column if not exists last_alerted_at timestamptz;
