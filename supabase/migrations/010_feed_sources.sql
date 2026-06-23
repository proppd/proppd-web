-- Scheduled agency feed pulls: register a remote feed URL per agency so a cron
-- can fetch and import it on a cadence. Idempotent: safe to re-apply.

create table if not exists public.feed_sources (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  url text not null,
  format text,                                              -- csv | xml | json (null = auto-detect)
  record_tag text,                                          -- xml record element override
  default_status public.listing_status not null default 'pending_review',
  frequency_minutes integer not null default 1440 check (frequency_minutes >= 15),
  is_active boolean not null default true,
  last_run_at timestamptz,
  last_status text,                                         -- ok | error
  last_message text,
  last_summary jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feed_sources_active_idx on public.feed_sources (is_active, last_run_at);
create index if not exists feed_sources_agency_idx on public.feed_sources (agency_id);

-- Server-side access is via the pooled service connection; deny direct anon/auth
-- access by enabling RLS with no public policies.
alter table public.feed_sources enable row level security;

comment on table public.feed_sources is 'Remote agency feed URLs pulled on a schedule by the feed-sync cron.';
comment on column public.feed_sources.frequency_minutes is 'Minimum minutes between scheduled pulls (>= 15).';
comment on column public.feed_sources.last_summary is 'JSON summary of the most recent import run.';
