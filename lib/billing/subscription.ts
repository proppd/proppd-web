import type { PlanId } from './plans';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'incomplete';

export type SubscriptionRecord = {
  id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type VerificationFacts = {
  /** PPRA-verified in Proppd (agents/agencies.is_verified). */
  isVerified: boolean;
  /** A Fidelity Fund Certificate number is on file. */
  hasFfc: boolean;
};

/**
 * PPRA-registered accounts (verified + FFC on file) qualify for the free trial,
 * but only once — a prior subscription of any kind consumes the offer.
 */
export function isTrialEligible(facts: VerificationFacts, hasExistingSubscription: boolean): boolean {
  if (hasExistingSubscription) return false;
  return facts.isVerified && facts.hasFfc;
}

export type EntitlementState = 'trialing' | 'active' | 'expired' | 'none';

export type Entitlement = {
  /** Whether the workspace currently has paid/trial access. */
  active: boolean;
  state: EntitlementState;
  /** Whole days remaining in the current trial or paid period (0 when expired/none). */
  daysLeft: number;
  /** Short human label for the dashboard, e.g. "Trial — 118 days left". */
  label: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(iso: string | null, now: Date): number {
  if (!iso) return 0;
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - now.getTime()) / DAY_MS));
}

export function deriveEntitlement(subscription: SubscriptionRecord | null, now: Date = new Date()): Entitlement {
  if (!subscription) {
    return { active: false, state: 'none', daysLeft: 0, label: 'No active plan' };
  }

  const nowMs = now.getTime();

  if (subscription.status === 'trialing') {
    const trialLive = subscription.trialEndsAt ? new Date(subscription.trialEndsAt).getTime() > nowMs : false;
    if (trialLive) {
      const daysLeft = daysUntil(subscription.trialEndsAt, now);
      return { active: true, state: 'trialing', daysLeft, label: `Trial — ${daysLeft} day${daysLeft === 1 ? '' : 's'} left` };
    }
    return { active: false, state: 'expired', daysLeft: 0, label: 'Trial ended' };
  }

  if (subscription.status === 'active') {
    const periodLive = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).getTime() > nowMs : true;
    if (periodLive) {
      const daysLeft = daysUntil(subscription.currentPeriodEnd, now);
      return { active: true, state: 'active', daysLeft, label: subscription.cancelAtPeriodEnd ? `Active — ends in ${daysLeft} days` : 'Active' };
    }
    return { active: false, state: 'expired', daysLeft: 0, label: 'Payment due' };
  }

  if (subscription.status === 'past_due') {
    return { active: false, state: 'expired', daysLeft: 0, label: 'Payment failed' };
  }

  if (subscription.status === 'cancelled') {
    return { active: false, state: 'expired', daysLeft: 0, label: 'Cancelled' };
  }

  // incomplete — checkout started but not yet confirmed.
  return { active: false, state: 'none', daysLeft: 0, label: 'Not subscribed' };
}
