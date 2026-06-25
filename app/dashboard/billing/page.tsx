import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { BillingManager } from '@/components/dashboard/billing-manager';
import { canAccessAgentWorkspace, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadBillingContext } from '@/lib/proppd/billing-store';
import { getPlan, formatZar } from '@/lib/billing/plans';
import { deriveEntitlement, isTrialEligible } from '@/lib/billing/subscription';

export const metadata: Metadata = {
  title: { absolute: 'Billing | Proppd' },
  description: 'Manage your Proppd subscription.',
  alternates: { canonical: '/dashboard/billing' },
};

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getPortalServerUser();
  if (!user) redirect('/login?next=%2Fdashboard%2Fbilling');

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) redirect('/my-properties');

  const context = await loadBillingContext(access);
  const { status: statusFlag } = await searchParams;

  const plan = getPlan(context?.plan ?? 'agent');
  const subscription = context?.subscription ?? null;
  const entitlement = deriveEntitlement(subscription);
  const trialEligible = context ? isTrialEligible(context.verification, Boolean(subscription)) : false;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Billing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Your Proppd subscription</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Unlimited leads and listings. PPRA-verified agents and agencies get the first 4 months free.</p>
      </div>

      {statusFlag === 'success' && (
        <div className="flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-bold text-[#166534]">
          <CheckCircle2 size={16} /> Payment received — your subscription is active.
        </div>
      )}
      {statusFlag === 'failed' && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          <AlertCircle size={16} /> We could not confirm that payment. Please try again or contact Proppd.
        </div>
      )}

      {/* Current status */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${entitlement.active ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
              {entitlement.state === 'trialing' ? <Clock size={20} /> : entitlement.active ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Current status</p>
              <p className="text-lg font-bold text-[#1A1A2E]">{entitlement.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">{plan.name} plan</p>
            <p className="text-lg font-bold text-[#1A1A2E]">{formatZar(plan.priceCents)}<span className="text-sm font-bold text-[#9CA3AF]">/mo</span></p>
          </div>
        </div>
        {subscription?.currentPeriodEnd && entitlement.active && (
          <p className="mt-4 text-xs font-bold text-[#9CA3AF]">
            {entitlement.state === 'trialing' ? 'Free trial' : subscription.cancelAtPeriodEnd ? 'Access' : 'Renews'} until {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        )}
      </div>

      {/* Plan card with action */}
      <BillingManager
        planId={plan.id}
        planName={plan.name}
        priceCents={plan.priceCents}
        tagline={plan.tagline}
        features={plan.features}
        trialEligible={trialEligible}
        hasAccess={entitlement.active}
      />
    </section>
  );
}
