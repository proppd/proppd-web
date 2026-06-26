import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { AGENT_WORKSPACE_FORBIDDEN_MESSAGE, canAccessAgentWorkspace, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPlan, planForRole } from '@/lib/billing/plans';
import { isTrialEligible } from '@/lib/billing/subscription';
import { ensureIncompleteSubscription, loadBillingContext, startTrialSubscription } from '@/lib/proppd/billing-store';
import { getPaystackPlanCode, getPaystackSecretKey, initializeTransaction } from '@/lib/billing/paystack';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) {
    return NextResponse.json({ error: AGENT_WORKSPACE_FORBIDDEN_MESSAGE }, { status: 403 });
  }

  const plan = planForRole(access.role);
  const context = await loadBillingContext(access);
  if (!context) return NextResponse.json({ error: 'Billing is not available yet.' }, { status: 503 });

  // Already on a live trial or paid plan — nothing to do.
  if (context.subscription && (context.subscription.status === 'trialing' || context.subscription.status === 'active')) {
    return NextResponse.json({ mode: 'existing', status: context.subscription.status });
  }

  // PPRA-verified accounts get the free trial on their first subscription.
  if (isTrialEligible(context.verification, Boolean(context.subscription))) {
    const trial = await startTrialSubscription(access, plan);
    if (!trial) return NextResponse.json({ error: 'Could not start your trial. Please try again.' }, { status: 502 });
    return NextResponse.json({ mode: 'trial', status: trial.status, trialEndsAt: trial.trialEndsAt });
  }

  // Otherwise route to Paystack hosted checkout for recurring billing.
  const secretKey = getPaystackSecretKey();
  const planCode = getPaystackPlanCode(getPlan(plan).planCodeEnv);
  if (!secretKey || !planCode) {
    return NextResponse.json({ error: 'Card payments are not configured yet. Please contact Proppd.' }, { status: 503 });
  }

  await ensureIncompleteSubscription(access, plan);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com').replace(/\/$/, '');
  const result = await initializeTransaction(
    {
      email: user.email ?? '',
      amount: getPlan(plan).priceCents,
      planCode,
      callbackUrl: `${appUrl}/api/billing/callback`,
      metadata: { profileId: access.profileId, plan },
    },
    secretKey,
  );

  if (!result) return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 });

  return NextResponse.json({ mode: 'paystack', authorizationUrl: result.authorizationUrl });
}
