-- Agency-level PPRA Fidelity Fund Certificate.
--
-- Agents already carry their personal FFC (011) and a verification date (016).
-- But PPRA also issues a firm-level Fidelity Fund Certificate to the agency
-- itself, and buyers benefit from seeing that the agency — not just the
-- individual practitioner — is registered and recently validated.
--
-- agencies.is_verified already exists. Here we add the FFC number and a
-- verification timestamp maintained automatically by a BEFORE trigger, mirroring
-- the agents pattern so it stays accurate no matter which path sets the fields.

alter table public.agencies
  add column if not exists ffc_number text;

alter table public.agencies
  add column if not exists ffc_verified_at timestamptz;

-- Stamp the verification time whenever an agency becomes verified with an FFC,
-- or their FFC number changes. Clearing is_verified clears the timestamp.
create or replace function public.stamp_agency_ffc_verification()
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

drop trigger if exists agencies_stamp_ffc_verification on public.agencies;
create trigger agencies_stamp_ffc_verification
before insert or update of is_verified, ffc_number
on public.agencies
for each row execute function public.stamp_agency_ffc_verification();

-- Backfill existing verified agencies using the best timestamp we have.
update public.agencies
set ffc_verified_at = coalesce(updated_at, created_at)
where is_verified
  and ffc_number is not null
  and ffc_verified_at is null;
