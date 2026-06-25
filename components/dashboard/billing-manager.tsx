'use client';

import { useState } from 'react';
import { Check, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { formatZar, type PlanId } from '@/lib/billing/plans';

type Props = {
  planId: PlanId;
  planName: string;
  priceCents: number;
  tagline: string;
  features: string[];
  trialEligible: boolean;
  hasAccess: boolean;
};

export function BillingManager({ planId, planName, priceCents, tagline, features, trialEligible, hasAccess }: Props) {
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const ctaLabel = trialEligible ? 'Start 4 months free' : `Subscribe — ${formatZar(priceCents)}/mo`;

  async function handleSubscribe() {
    setStatus('working');
    setMessage('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const json = (await res.json()) as { mode?: string; authorizationUrl?: string; error?: string };

      if (!res.ok) {
        setMessage(json.error ?? 'Could not start checkout. Please try again.');
        setStatus('error');
        return;
      }

      if (json.mode === 'paystack' && json.authorizationUrl) {
        window.location.href = json.authorizationUrl;
        return;
      }

      // Trial started or already subscribed — refresh to show the live state.
      window.location.reload();
    } catch {
      setMessage('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">{planName} plan</p>
          <p className="mt-1 text-sm font-semibold text-[#6B7280]">{tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-[#1A1A2E]">{formatZar(priceCents)}</p>
          <p className="text-xs font-bold text-[#9CA3AF]">per month</p>
        </div>
      </div>

      <ul className="mt-5 grid gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
            <Check size={15} className="shrink-0 text-[#16A34A]" /> {feature}
          </li>
        ))}
      </ul>

      {trialEligible && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
          <Sparkles size={15} className="mt-0.5 shrink-0" />
          You are PPRA-verified, so your first 4 months are free. We will only ask for a card when the trial ends.
        </div>
      )}

      {message && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700">{message}</p>
      )}

      {hasAccess ? (
        <p className="mt-5 rounded-xl bg-[#EFF6FF] px-4 py-3 text-center text-sm font-bold text-[#2563EB]">
          Your plan is active — you have full access.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={status === 'working'}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
        >
          {status === 'working' ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
          {status === 'working' ? 'Starting…' : ctaLabel}
        </button>
      )}
    </div>
  );
}
