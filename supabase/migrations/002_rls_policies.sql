-- Proppd Phase 1 Row Level Security policies
-- These policies keep public browsing open while restricting dashboards and lead data.

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'super_admin';
$$;

create or replace function public.is_agency_admin(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agents a
    join public.profiles p on p.id = a.profile_id
    where p.id = auth.uid()
      and p.role = 'agency_admin'
      and a.agency_id = target_agency_id
  );
$$;

create or replace function public.is_agent_profile(target_agent_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agents a
    where a.id = target_agent_id
      and a.profile_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.agents enable row level security;
alter table public.property_types enable row level security;
alter table public.locations enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_features enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.saved_properties enable row level security;
alter table public.admin_activity_logs enable row level security;

-- Profiles
create policy "profiles read self or admins" on public.profiles
for select using (id = auth.uid() or public.is_super_admin());

create policy "profiles update self or admins" on public.profiles
for update using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

-- Public reference data
create policy "property types are public" on public.property_types
for select using (is_active = true);

create policy "locations are public" on public.locations
for select using (true);

create policy "admins manage property types" on public.property_types
for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "admins manage locations" on public.locations
for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Agencies and agents
create policy "public can read active agencies" on public.agencies
for select using (is_active = true);

create policy "super admins manage agencies" on public.agencies
for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "agency admins update own agency" on public.agencies
for update using (public.is_agency_admin(id)) with check (public.is_agency_admin(id));

create policy "public can read active agents" on public.agents
for select using (is_active = true);

create policy "agents update own profile" on public.agents
for update using (public.is_agent_profile(id)) with check (public.is_agent_profile(id));

create policy "agency admins manage agency agents" on public.agents
for all using (agency_id is not null and public.is_agency_admin(agency_id))
with check (agency_id is not null and public.is_agency_admin(agency_id));

create policy "super admins manage agents" on public.agents
for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Listings and listing child rows
create policy "public can read published listings" on public.listings
for select using (status in ('available', 'under_offer', 'sold', 'rented'));

create policy "agents manage own listings" on public.listings
for all using (agent_id is not null and public.is_agent_profile(agent_id))
with check (agent_id is not null and public.is_agent_profile(agent_id));

create policy "agency admins manage agency listings" on public.listings
for all using (agency_id is not null and public.is_agency_admin(agency_id))
with check (agency_id is not null and public.is_agency_admin(agency_id));

create policy "super admins manage listings" on public.listings
for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "public can read published listing images" on public.listing_images
for select using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.status in ('available', 'under_offer', 'sold', 'rented')
  )
);

create policy "listing owners manage images" on public.listing_images
for all using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (
        public.is_super_admin()
        or (l.agent_id is not null and public.is_agent_profile(l.agent_id))
        or (l.agency_id is not null and public.is_agency_admin(l.agency_id))
      )
  )
)
with check (
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

create policy "public can read published listing features" on public.listing_features
for select using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.status in ('available', 'under_offer', 'sold', 'rented')
  )
);

create policy "listing owners manage features" on public.listing_features
for all using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (
        public.is_super_admin()
        or (l.agent_id is not null and public.is_agent_profile(l.agent_id))
        or (l.agency_id is not null and public.is_agency_admin(l.agency_id))
      )
  )
)
with check (
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

-- Leads
create policy "public can create leads" on public.leads
for insert with check (popia_consent = true);

create policy "assigned agents read leads" on public.leads
for select using (
  public.is_super_admin()
  or (agent_id is not null and public.is_agent_profile(agent_id))
  or (agency_id is not null and public.is_agency_admin(agency_id))
);

create policy "assigned agents update lead workflow" on public.leads
for update using (
  public.is_super_admin()
  or (agent_id is not null and public.is_agent_profile(agent_id))
  or (agency_id is not null and public.is_agency_admin(agency_id))
)
with check (
  public.is_super_admin()
  or (agent_id is not null and public.is_agent_profile(agent_id))
  or (agency_id is not null and public.is_agency_admin(agency_id))
);

create policy "lead events visible to assigned users" on public.lead_events
for select using (
  exists (
    select 1 from public.leads l
    where l.id = lead_id
      and (
        public.is_super_admin()
        or (l.agent_id is not null and public.is_agent_profile(l.agent_id))
        or (l.agency_id is not null and public.is_agency_admin(l.agency_id))
      )
  )
);

create policy "assigned users create lead events" on public.lead_events
for insert with check (
  exists (
    select 1 from public.leads l
    where l.id = lead_id
      and (
        public.is_super_admin()
        or (l.agent_id is not null and public.is_agent_profile(l.agent_id))
        or (l.agency_id is not null and public.is_agency_admin(l.agency_id))
      )
  )
);

-- Saved properties
create policy "users manage own saved properties" on public.saved_properties
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admin logs
create policy "super admins read admin logs" on public.admin_activity_logs
for select using (public.is_super_admin());

create policy "authenticated platform users create admin logs" on public.admin_activity_logs
for insert with check (auth.uid() is not null);
