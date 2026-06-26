-- 024_agent_review_requests.sql
-- Persists PPRA manual-review applications so super admins can approve or
-- reject them from the admin console without touching the Supabase dashboard.
-- Idempotent: safe to run more than once.

create table if not exists public.agent_review_requests (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text,
  agency        text,
  area          text,
  ffc_number    text not null,
  -- PPRA verification result captured at submission time.
  verification_status text not null,
  verification_reason text,
  -- Admin review state: pending → approved | rejected
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists agent_review_requests_email_idx
  on public.agent_review_requests (lower(email));

create index if not exists agent_review_requests_status_idx
  on public.agent_review_requests (review_status, created_at desc);
