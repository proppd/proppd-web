-- Listing view tracking for agent performance stats.
-- Views are recorded server-side (service connection), so writes bypass RLS;
-- reads are restricted to the listing's agent, agency admins, and super admins.

create table if not exists public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  visitor_hash text,
  source text
);

create index if not exists listing_views_listing_idx on public.listing_views(listing_id, viewed_at);
create index if not exists listing_views_dedupe_idx on public.listing_views(listing_id, visitor_hash, viewed_at);

alter table public.listing_views enable row level security;

drop policy if exists "listing owners read views" on public.listing_views;
create policy "listing owners read views" on public.listing_views
for select using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (
        public.is_super_admin()
        or (l.agent_id is not null and public.is_agent_profile(l.agent_id))
        or (l.agency_id is not null and public.is_agency_admin(l.agency_id))
      )
  )
);
