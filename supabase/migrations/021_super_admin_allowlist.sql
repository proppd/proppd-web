-- Restrict the super_admin role to allowlisted Proppd staff emails.
--
-- A super admin bypasses agency scoping and can read every lead, listing, and
-- profile. A mis-seeded account (e.g. an agency agent set to super_admin)
-- therefore gets god-mode over everyone's data. This migration:
--   1. demotes any existing non-allowlisted super_admin, and
--   2. installs a trigger that blocks the role from ever being set on a
--      non-allowlisted email again.
--
-- Keep the allowlist in sync with lib/auth/super-admin.ts.
-- Idempotent: safe to re-run.

-- 1. Demote existing offenders. Keep them as an agent when a linked agent
--    record exists, otherwise drop to a normal user.
update public.profiles p
set role = case
    when exists (select 1 from public.agents a where a.profile_id = p.id)
      then 'agent'::public.app_role
    else 'user'::public.app_role
  end
where p.role = 'super_admin'
  and lower(coalesce(p.email, '')) not in ('info@proppd.com');

-- 2. Guard trigger: reject any insert/update that would grant super_admin to a
--    non-allowlisted email.
create or replace function public.enforce_super_admin_allowlist()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role = 'super_admin'
     and lower(coalesce(new.email, '')) not in ('info@proppd.com') then
    raise exception
      'super_admin is restricted to Proppd staff emails (attempted on %)', new.email
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_super_admin_allowlist on public.profiles;
create trigger enforce_super_admin_allowlist
  before insert or update on public.profiles
  for each row execute function public.enforce_super_admin_allowlist();
