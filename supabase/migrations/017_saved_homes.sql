-- Proppd saved homes: consumers (buyers/renters) shortlist listings to their
-- account so the shortlist syncs across devices instead of living only in
-- localStorage. RLS keeps each user scoped to their own rows.
-- Idempotent: safe to re-apply.

create table if not exists public.saved_homes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists saved_homes_user_id_idx on public.saved_homes (user_id);

alter table public.saved_homes enable row level security;

drop policy if exists "Users read their own saved homes" on public.saved_homes;
create policy "Users read their own saved homes"
  on public.saved_homes for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert their own saved homes" on public.saved_homes;
create policy "Users insert their own saved homes"
  on public.saved_homes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete their own saved homes" on public.saved_homes;
create policy "Users delete their own saved homes"
  on public.saved_homes for delete
  using (auth.uid() = user_id);
