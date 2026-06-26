-- Stores the confirmed date and time of a booked viewing so agents
-- can see "Viewing: Thu 26 Jun at 2:00 PM" instead of just a status chip.
alter table public.leads
  add column if not exists viewing_at timestamptz;
