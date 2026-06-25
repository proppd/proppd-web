import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { canAccessAgentWorkspace, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPaystackSecretKey, verifyTransaction } from '@/lib/billing/paystack';
import { activatePaidSubscriptionByProfile } from '@/lib/proppd/billing-store';

export const runtime = 'nodejs';

// Paystack redirects the buyer's browser here after the hosted checkout, with
// ?reference=. We verify server-side, activate the subscription, then bounce
// the user back to the billing page with a status flag.
export async function GET(request: NextRequest) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com').replace(/\/$/, '');
  const billingUrl = (status: string) => `${appUrl}/dashboard/billing?status=${status}`;

  const reference = request.nextUrl.searchParams.get('reference') ?? request.nextUrl.searchParams.get('trxref');
  if (!reference) return NextResponse.redirect(billingUrl('failed'));

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(billingUrl('failed'));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login?next=%2Fdashboard%2Fbilling`);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return NextResponse.redirect(billingUrl('failed'));

  const secretKey = getPaystackSecretKey();
  if (!secretKey) return NextResponse.redirect(billingUrl('failed'));

  const txn = await verifyTransaction(reference, secretKey);
  if (!txn || txn.status !== 'success') return NextResponse.redirect(billingUrl('failed'));

  await activatePaidSubscriptionByProfile({
    profileId: access.profileId,
    customerCode: txn.customerCode,
    authorizationCode: txn.authorizationCode,
    reference: txn.reference,
    amount: txn.amount,
  });

  return NextResponse.redirect(billingUrl('success'));
}
