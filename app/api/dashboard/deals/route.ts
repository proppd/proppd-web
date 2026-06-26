import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { canAccessAgentWorkspace, AGENT_WORKSPACE_FORBIDDEN_MESSAGE, loadPortalUserAccess } from '@/lib/proppd/backend';
import { createDeal, loadDeals } from '@/lib/proppd/deals';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET() {
  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return err(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);

  try {
    const deals = await loadDeals(access);
    return NextResponse.json({ deals });
  } catch {
    return err('Failed to load deals.', 500);
  }
}

export async function POST(request: Request) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return err(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return err('Invalid request body.');

  const propertyAddress = typeof body.propertyAddress === 'string' ? body.propertyAddress.trim() : '';
  const buyerName = typeof body.buyerName === 'string' ? body.buyerName.trim() : '';
  if (!propertyAddress) return err('Property address is required.');
  if (!buyerName) return err('Buyer name is required.');

  const priceCents =
    typeof body.purchasePriceCents === 'number' && body.purchasePriceCents > 0
      ? Math.round(body.purchasePriceCents)
      : undefined;

  const bondCents =
    typeof body.bondAmountCents === 'number' && body.bondAmountCents >= 0
      ? Math.round(body.bondAmountCents)
      : undefined;

  const commissionPct =
    typeof body.commissionPct === 'number' && body.commissionPct > 0 && body.commissionPct <= 25
      ? body.commissionPct
      : undefined;

  try {
    const deal = await createDeal(
      {
        listingId: typeof body.listingId === 'string' ? body.listingId : undefined,
        propertyAddress,
        buyerName,
        buyerEmail: typeof body.buyerEmail === 'string' ? body.buyerEmail : undefined,
        buyerPhone: typeof body.buyerPhone === 'string' ? body.buyerPhone : undefined,
        purchasePriceCents: priceCents,
        bondAmountCents: bondCents,
        commissionPct,
        otpSignedAt: typeof body.otpSignedAt === 'string' ? body.otpSignedAt : undefined,
        notes: typeof body.notes === 'string' ? body.notes : undefined,
      },
      access,
    );
    return NextResponse.json({ deal }, { status: 201 });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to create deal.', 500);
  }
}
