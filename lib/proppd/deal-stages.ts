// Client-safe deal pipeline types, stage constants, and pure helpers.
//
// This module MUST NOT import `pg` or any Node-only module — it is bundled
// into client components (the deal pipeline cards and forms). All database
// access lives in `./deals.ts`, which re-exports everything here so server
// callers can keep importing from a single module.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const DEAL_STAGES = [
  'otp_signed',
  'bond_submitted',
  'bond_approved',
  'attorney_instructed',
  'deeds_lodged',
  'registered',
] as const;

export type ActiveDealStage = (typeof DEAL_STAGES)[number];
export type DealStage = ActiveDealStage | 'fallen_through';

export type DealRecord = {
  id: string;
  agentId: string;
  agencyId: string | null;
  listingId: string | null;
  propertyAddress: string;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  buyerAttorneyFirm: string | null;
  buyerAttorneyContact: string | null;
  sellerAttorneyFirm: string | null;
  sellerAttorneyContact: string | null;
  purchasePriceCents: number | null;
  bondAmountCents: number | null;
  commissionPct: number | null;
  stage: DealStage;
  otpSignedAt: string | null;
  bondSubmittedAt: string | null;
  bondApprovedAt: string | null;
  attorneyInstructedAt: string | null;
  deedsLodgedAt: string | null;
  registeredAt: string | null;
  fallenThroughAt: string | null;
  fallenThroughReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDealInput = {
  listingId?: string;
  propertyAddress: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  purchasePriceCents?: number;
  bondAmountCents?: number;
  commissionPct?: number;
  otpSignedAt?: string;
  notes?: string;
};

export type UpdateDealInput = Partial<{
  stage: DealStage;
  propertyAddress: string;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  buyerAttorneyFirm: string | null;
  buyerAttorneyContact: string | null;
  sellerAttorneyFirm: string | null;
  sellerAttorneyContact: string | null;
  purchasePriceCents: number | null;
  bondAmountCents: number | null;
  commissionPct: number | null;
  otpSignedAt: string | null;
  bondSubmittedAt: string | null;
  bondApprovedAt: string | null;
  attorneyInstructedAt: string | null;
  deedsLodgedAt: string | null;
  registeredAt: string | null;
  fallenThroughAt: string | null;
  fallenThroughReason: string | null;
  notes: string | null;
}>;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function nextStage(current: DealStage): ActiveDealStage | null {
  const idx = DEAL_STAGES.indexOf(current as ActiveDealStage);
  if (idx < 0 || idx === DEAL_STAGES.length - 1) return null;
  return DEAL_STAGES[idx + 1];
}

export function stageLabel(stage: DealStage): string {
  const labels: Record<DealStage, string> = {
    otp_signed: 'OTP Signed',
    bond_submitted: 'Bond Submitted',
    bond_approved: 'Bond Approved',
    attorney_instructed: 'Attorneys Instructed',
    deeds_lodged: 'Deeds Lodged',
    registered: 'Registered',
    fallen_through: 'Fallen Through',
  };
  return labels[stage] ?? stage;
}

export function stageDateField(stage: ActiveDealStage): keyof UpdateDealInput {
  const map: Record<ActiveDealStage, keyof UpdateDealInput> = {
    otp_signed: 'otpSignedAt',
    bond_submitted: 'bondSubmittedAt',
    bond_approved: 'bondApprovedAt',
    attorney_instructed: 'attorneyInstructedAt',
    deeds_lodged: 'deedsLodgedAt',
    registered: 'registeredAt',
  };
  return map[stage];
}
