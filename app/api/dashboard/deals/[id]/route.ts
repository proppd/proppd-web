import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { canAccessAgentWorkspace, AGENT_WORKSPACE_FORBIDDEN_MESSAGE, loadPortalUserAccess } from '@/lib/proppd/backend';
import { deleteDeal, updateDeal, DEAL_STAGES, type UpdateDealInput, type DealStage } from '@/lib/proppd/deals';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return err(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return err('Invalid request body.');

  // Accept a flexible patch object — only include fields that are present
  const patch: UpdateDealInput = {};

  const str = (v: unknown): string | null | undefined =>
    v === null ? null : typeof v === 'string' ? v.trim() || null : undefined;
  const num = (v: unknown): number | null | undefined =>
    v === null ? null : typeof v === 'number' && !isNaN(v) ? v : undefined;
  const ts = (v: unknown): string | null | undefined =>
    v === null ? null : typeof v === 'string' ? v : undefined;

  const VALID_STAGES = new Set<string>([...DEAL_STAGES, 'fallen_through']);
  if ('stage' in body) {
    if (typeof body.stage !== 'string' || !VALID_STAGES.has(body.stage)) {
      return err('Invalid stage value.');
    }
    patch.stage = body.stage as DealStage;
  }
  if ('propertyAddress' in body) patch.propertyAddress = str(body.propertyAddress) ?? undefined;
  if ('buyerName' in body) patch.buyerName = str(body.buyerName) ?? undefined;
  if ('buyerEmail' in body) patch.buyerEmail = str(body.buyerEmail);
  if ('buyerPhone' in body) patch.buyerPhone = str(body.buyerPhone);
  if ('buyerAttorneyFirm' in body) patch.buyerAttorneyFirm = str(body.buyerAttorneyFirm);
  if ('buyerAttorneyContact' in body) patch.buyerAttorneyContact = str(body.buyerAttorneyContact);
  if ('sellerAttorneyFirm' in body) patch.sellerAttorneyFirm = str(body.sellerAttorneyFirm);
  if ('sellerAttorneyContact' in body) patch.sellerAttorneyContact = str(body.sellerAttorneyContact);
  if ('purchasePriceCents' in body) {
    const v = num(body.purchasePriceCents);
    if (v !== undefined && v !== null && v <= 0) return err('Purchase price must be positive.');
    patch.purchasePriceCents = v;
  }
  if ('bondAmountCents' in body) {
    const v = num(body.bondAmountCents);
    if (v !== undefined && v !== null && v < 0) return err('Bond amount cannot be negative.');
    patch.bondAmountCents = v;
  }
  if ('commissionPct' in body) {
    const v = num(body.commissionPct);
    if (v !== undefined && v !== null && (v <= 0 || v > 25)) return err('Commission must be between 0 and 25%.');
    patch.commissionPct = v;
  }
  if ('otpSignedAt' in body) patch.otpSignedAt = ts(body.otpSignedAt);
  if ('bondSubmittedAt' in body) patch.bondSubmittedAt = ts(body.bondSubmittedAt);
  if ('bondApprovedAt' in body) patch.bondApprovedAt = ts(body.bondApprovedAt);
  if ('attorneyInstructedAt' in body) patch.attorneyInstructedAt = ts(body.attorneyInstructedAt);
  if ('deedsLodgedAt' in body) patch.deedsLodgedAt = ts(body.deedsLodgedAt);
  if ('registeredAt' in body) patch.registeredAt = ts(body.registeredAt);
  if ('fallenThroughAt' in body) patch.fallenThroughAt = ts(body.fallenThroughAt);
  if ('fallenThroughReason' in body) patch.fallenThroughReason = str(body.fallenThroughReason);
  if ('notes' in body) patch.notes = str(body.notes);

  try {
    const deal = await updateDeal(id, patch, access);
    if (!deal) return err('Deal not found or access denied.', 404);
    return NextResponse.json({ deal });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to update deal.', 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return err(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);

  try {
    const deleted = await deleteDeal(id, access);
    if (!deleted) return err('Deal not found or access denied.', 404);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to delete deal.', 500);
  }
}
