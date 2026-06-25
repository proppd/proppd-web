-- Agent FFC verification date.
--
-- We already store ffc_number and is_verified, but not WHEN the agent was
-- validated against the PPRA register. PPRA Fidelity Fund Certificates are
-- renewed annually, so buyers benefit from seeing how recent the check was —
-- and we can flag when a re-verification is due.
--
-- ffc_verified_at is maintained automatically by a BEFORE trigger so it stays
-- accurate no matter which path sets is_verified / ffc_number (admin import,
-- onboarding, manual SQL).

alter table public.agents
  add column if not exists ffc_verified_at timestamptz;

-- Stamp the verification time whenever an agent becomes verified with an FFC,
-- or their FFC number changes. Clearing is_verified clears the timestamp.
create or replace function public.stamp_agent_ffc_verification()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_verified and new.ffc_number is not null then
    if (tg_op = 'INSERT')
       or old.is_verified is distinct from new.is_verified
       or old.ffc_number is distinct from new.ffc_number
       or new.ffc_verified_at is null then
      new.ffc_verified_at := now();
    end if;
  elsif not new.is_verified then
    new.ffc_verified_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists agents_stamp_ffc_verification on public.agents;
create trigger agents_stamp_ffc_verification
before insert or update of is_verified, ffc_number
on public.agents
for each row execute function public.stamp_agent_ffc_verification();

-- Backfill existing verified agents using the best timestamp we have.
update public.agents
set ffc_verified_at = coalesce(updated_at, created_at)
where is_verified
  and ffc_number is not null
  and ffc_verified_at is null;
