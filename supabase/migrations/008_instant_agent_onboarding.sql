-- Instant agent onboarding.
--
-- When a verified (PPRA / Fidelity Fund) agent signs in for the first time,
-- Supabase creates their auth.users row, which fires on_auth_user_created ->
-- handle_new_user(). Previously that only created a profile (role 'user'), so
-- the agent landed on the demo/fallback dashboard until someone ran SQL to
-- link their profile to their agent record.
--
-- This replaces handle_new_user() so it also:
--   1. links any existing agent with a matching email to the new profile, and
--   2. promotes that profile to the 'agent' role IF the agent passed PPRA/FFC
--      validation (agents.is_verified).
--
-- Idempotent: `create or replace` swaps the function body; the existing
-- on_auth_user_created trigger keeps pointing at it. Safe to re-run.

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

  -- 1. Link an existing agent record to this profile by email.
  update public.agents a
  set profile_id = new.id
  where a.profile_id is null
    and lower(a.email) = lower(new.email);

  -- 2. If the linked agent passed PPRA/Fidelity Fund validation, grant agent role.
  update public.profiles
  set role = 'agent'
  where id = new.id
    and role = 'user'
    and exists (
      select 1 from public.agents a
      where a.profile_id = new.id and a.is_verified
    );

  return new;
end;
$$;
