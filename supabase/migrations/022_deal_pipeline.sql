-- 022_deal_pipeline.sql
-- Sale pipeline tracker: follows a deal from OTP signing through to
-- deeds office registration, capturing buyer details, attorney contacts,
-- financial terms, and the key milestone dates for each stage.
-- Fully idempotent: safe to run more than once.

do $$ begin
  create type public.deal_stage as enum (
    'otp_signed',
    'bond_submitted',
    'bond_approved',
    'attorney_instructed',
    'deeds_lodged',
    'registered',
    'fallen_through'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.deals (
  id              uuid        primary key default gen_random_uuid(),

  -- Scope: who owns this deal
  agent_id        uuid        not null references public.profiles(id) on delete cascade,
  agency_id       uuid        references public.agencies(id) on delete set null,
  listing_id      uuid        references public.listings(id) on delete set null,

  -- Property address (denormalised so the deal survives listing edits/archiving)
  property_address text       not null,

  -- Buyer
  buyer_name              text    not null,
  buyer_email             citext,
  buyer_phone             text,
  buyer_attorney_firm     text,
  buyer_attorney_contact  text,

  -- Seller / transfer attorney
  seller_attorney_firm    text,
  seller_attorney_contact text,

  -- Financial (all amounts in ZAR cents)
  purchase_price_cents    bigint          check (purchase_price_cents > 0),
  bond_amount_cents       bigint          check (bond_amount_cents >= 0),
  commission_pct          numeric(5,2)    check (commission_pct > 0 and commission_pct <= 25),

  -- Pipeline stage
  stage                   public.deal_stage not null default 'otp_signed',

  -- Milestone dates (populated when each stage is reached)
  otp_signed_at           timestamptz,
  bond_submitted_at       timestamptz,
  bond_approved_at        timestamptz,
  attorney_instructed_at  timestamptz,
  deeds_lodged_at         timestamptz,
  registered_at           timestamptz,
  fallen_through_at       timestamptz,
  fallen_through_reason   text,

  notes                   text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists deals_agent_id_idx   on public.deals(agent_id);
create index if not exists deals_agency_id_idx  on public.deals(agency_id);
create index if not exists deals_stage_idx      on public.deals(stage);

drop trigger if exists deals_set_updated_at on public.deals;
create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

alter table public.deals enable row level security;

-- Super admins have unrestricted access.
drop policy if exists "Super admins full access on deals" on public.deals;
create policy "Super admins full access on deals"
  on public.deals for all
  using  (public.is_super_admin())
  with check (public.is_super_admin());

-- Agents can manage deals they own.
drop policy if exists "Agents manage their own deals" on public.deals;
create policy "Agents manage their own deals"
  on public.deals for all
  using  (public.is_agent_profile(agent_id))
  with check (public.is_agent_profile(agent_id));

-- Agency admins can manage all deals belonging to their agency.
drop policy if exists "Agency admins manage agency deals" on public.deals;
create policy "Agency admins manage agency deals"
  on public.deals for all
  using  (agency_id is not null and public.is_agency_admin(agency_id))
  with check (agency_id is not null and public.is_agency_admin(agency_id));
