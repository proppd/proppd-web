-- Proppd Phase 1 initial portal schema
-- Apply to a dedicated Proppd Supabase project before exposing dashboards.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('super_admin', 'agency_admin', 'agent', 'user');
create type public.listing_purpose as enum ('sale', 'rent');
create type public.listing_status as enum ('draft', 'pending_review', 'available', 'under_offer', 'sold', 'rented', 'archived');
create type public.lead_status as enum ('new', 'contacted', 'viewing_booked', 'qualified', 'not_interested', 'fake_spam', 'converted');
create type public.lead_quality as enum ('unreviewed', 'valid', 'suspicious', 'duplicate', 'spam');
create type public.lead_intent as enum ('viewing', 'more_info', 'valuation', 'finance');
create type public.property_category as enum ('residential', 'commercial', 'industrial', 'land', 'agricultural', 'development');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text,
  phone text,
  role public.app_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when lower(new.email) = 'info@proppd.com' then 'super_admin'::public.app_role else 'user'::public.app_role end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  branch_name text,
  email citext,
  phone text,
  whatsapp text,
  website_url text,
  street_address text,
  suburb text,
  city text,
  province text,
  country text not null default 'South Africa',
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  agency_id uuid references public.agencies(id) on delete set null,
  name text not null,
  slug text not null unique,
  photo_url text,
  email citext,
  phone text,
  whatsapp text,
  bio text,
  areas_served text[] not null default '{}',
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category public.property_category not null,
  is_active boolean not null default true,
  sort_order integer not null default 100
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  suburb text not null,
  city text not null,
  province text not null,
  country text not null default 'South Africa',
  slug text not null unique,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  property_type_id uuid references public.property_types(id) on delete restrict,
  location_id uuid references public.locations(id) on delete set null,
  title text not null,
  slug text not null unique,
  purpose public.listing_purpose not null,
  status public.listing_status not null default 'draft',
  price numeric(14, 2) not null check (price >= 0),
  description text,
  street_address text,
  suburb text,
  city text,
  province text,
  bedrooms numeric(4, 1),
  bathrooms numeric(4, 1),
  parking integer,
  erf_size_sqm numeric(12, 2),
  floor_size_sqm numeric(12, 2),
  rates_and_taxes numeric(12, 2),
  levies numeric(12, 2),
  availability_date date,
  is_pet_friendly boolean,
  is_furnished boolean,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.listing_features (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  feature text not null,
  created_at timestamptz not null default now(),
  unique (listing_id, feature)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  agency_id uuid references public.agencies(id) on delete set null,
  name text not null,
  surname text not null,
  email citext not null,
  phone text not null,
  message text not null,
  intent public.lead_intent not null,
  status public.lead_status not null default 'new',
  quality public.lead_quality not null default 'unreviewed',
  flags text[] not null default '{}',
  source_page text,
  ip_address inet,
  user_agent text,
  popia_consent boolean not null default false,
  agent_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.saved_properties (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index agencies_slug_idx on public.agencies(slug);
create index agents_slug_idx on public.agents(slug);
create index agents_agency_idx on public.agents(agency_id);
create index locations_city_idx on public.locations(city, province);
create index listings_public_search_idx on public.listings(status, purpose, price, city, suburb);
create index listings_agent_idx on public.listings(agent_id);
create index listings_agency_idx on public.listings(agency_id);
create index listings_slug_idx on public.listings(slug);
create index listings_search_vector_idx on public.listings using gin(search_vector);
create index listing_images_listing_idx on public.listing_images(listing_id, sort_order);
create index leads_listing_idx on public.leads(listing_id);
create index leads_agent_idx on public.leads(agent_id, status);
create index leads_agency_idx on public.leads(agency_id, status);
create index leads_email_phone_idx on public.leads(email, phone, created_at desc);

create or replace function public.refresh_listing_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.suburb, '') || ' ' || coalesce(new.city, '') || ' ' || coalesce(new.province, '')), 'C');
  return new;
end;
$$;

create trigger listings_refresh_search_vector
before insert or update of title, description, suburb, city, province
on public.listings
for each row execute function public.refresh_listing_search_vector();

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger agencies_set_updated_at before update on public.agencies for each row execute function public.set_updated_at();
create trigger agents_set_updated_at before update on public.agents for each row execute function public.set_updated_at();
create trigger listings_set_updated_at before update on public.listings for each row execute function public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads for each row execute function public.set_updated_at();
