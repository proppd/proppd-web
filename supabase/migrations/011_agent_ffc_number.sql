-- Add fidelity fund certificate number to agents.
--
-- Stores the normalised FFC number that was validated against the PPRA
-- register during onboarding. Surfaced publicly so buyers can cross-check
-- the agent against the PPRA register themselves.

alter table public.agents
  add column if not exists ffc_number text;
