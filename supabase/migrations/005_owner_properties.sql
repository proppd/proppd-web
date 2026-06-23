-- Proppd owner workspace: sellers & landlords manage their own properties.
-- Open self-serve accounts; RLS keeps each owner scoped to their own rows.
-- Idempotent: safe to re-apply.

create table if not exists public.owner_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default '',
  suburb text not null,
  city text not null,
  property_type text not null,
  bedrooms integer not null default 1,
  bathrooms integer,
  floor_size integer,
  intent text not null default 'sell' check (intent in ('sell', 'rent')),
  asking_price numeric,
  stage text not null default 'researching'
    check (stage in ('researching', 'preparing', 'valuing', 'listed', 'under_offer', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists owner_properties_user_id_idx on public.owner_properties (user_id);

drop trigger if exists owner_properties_set_updated_at on public.owner_properties;
create trigger owner_properties_set_updated_at
  before update on public.owner_properties
  for each row execute function public.set_updated_at();

alter table public.owner_properties enable row level security;

drop policy if exists "Owners read their own properties" on public.owner_properties;
create policy "Owners read their own properties"
  on public.owner_properties for select
  using (auth.uid() = user_id);

drop policy if exists "Owners insert their own properties" on public.owner_properties;
create policy "Owners insert their own properties"
  on public.owner_properties for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owners update their own properties" on public.owner_properties;
create policy "Owners update their own properties"
  on public.owner_properties for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Owners delete their own properties" on public.owner_properties;
create policy "Owners delete their own properties"
  on public.owner_properties for delete
  using (auth.uid() = user_id);
