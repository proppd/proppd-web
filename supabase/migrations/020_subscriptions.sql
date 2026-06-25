-- Proppd subscription billing (Paystack).
-- Fully idempotent: safe to run more than once.

do $$ begin
  create type public.subscription_plan as enum ('agent', 'agency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'incomplete');
exception when duplicate_object then null; end $$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  agency_id uuid references public.agencies(id) on delete set null,
  plan public.subscription_plan not null,
  status public.subscription_status not null default 'incomplete',
  amount integer not null,                              -- ZAR cents charged per interval
  currency text not null default 'ZAR',
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_email_token text,                            -- token needed to manage/cancel on Paystack
  paystack_authorization_code text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id)
);

create index if not exists subscriptions_agency_idx on public.subscriptions (agency_id);
create index if not exists subscriptions_customer_idx on public.subscriptions (paystack_customer_code);
create index if not exists subscriptions_sub_code_idx on public.subscriptions (paystack_subscription_code);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  event_type text not null,
  amount integer,
  reference text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists subscription_events_sub_idx on public.subscription_events (subscription_id, created_at desc);

alter table public.subscriptions enable row level security;
alter table public.subscription_events enable row level security;

-- Subscribers can read their own subscription; super admins read all.
drop policy if exists "subscribers read own subscription" on public.subscriptions;
create policy "subscribers read own subscription"
  on public.subscriptions for select
  using (
    profile_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin')
  );

drop policy if exists "subscribers read own subscription events" on public.subscription_events;
create policy "subscribers read own subscription events"
  on public.subscription_events for select
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_events.subscription_id
        and (
          s.profile_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin')
        )
    )
  );

-- Writes happen server-side through the connection pool (service path), which
-- bypasses RLS, so no public insert/update policies are required.
