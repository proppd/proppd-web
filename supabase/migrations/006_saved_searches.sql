-- Proppd saved searches: consumers (buyers/renters) save a filter set to their
-- account and re-run it. RLS keeps each user scoped to their own rows.

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  path text not null default '/properties',
  query_string text not null default '',
  created_at timestamptz not null default now()
);

create index saved_searches_user_id_idx on public.saved_searches (user_id);

alter table public.saved_searches enable row level security;

create policy "Users read their own saved searches"
  on public.saved_searches for select
  using (auth.uid() = user_id);

create policy "Users insert their own saved searches"
  on public.saved_searches for insert
  with check (auth.uid() = user_id);

create policy "Users delete their own saved searches"
  on public.saved_searches for delete
  using (auth.uid() = user_id);
