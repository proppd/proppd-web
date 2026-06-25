import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';
import { formatZar, getPlan, isPlanId, planForRole, PLANS, TRIAL_MONTHS } from '@/lib/billing/plans';
import { deriveEntitlement, isTrialEligible, type SubscriptionRecord } from '@/lib/billing/subscription';
import { verifyPaystackSignature } from '@/lib/billing/paystack';

describe('plans', () => {
  it('prices the agent and agency tiers in ZAR cents', () => {
    expect(PLANS.agent.priceCents).toBe(49900);
    expect(PLANS.agency.priceCents).toBe(119900);
    expect(TRIAL_MONTHS).toBe(4);
  });

  it('formats ZAR cents with grouped thousands', () => {
    expect(formatZar(49900)).toBe('R 499');
    expect(formatZar(119900)).toBe('R 1 199');
    expect(formatZar(0)).toBe('R 0');
  });

  it('maps roles to the right plan', () => {
    expect(planForRole('agency_admin')).toBe('agency');
    expect(planForRole('agent')).toBe('agent');
    expect(planForRole('super_admin')).toBe('agent');
    expect(getPlan('agency').name).toBe('Agency');
  });

  it('guards plan ids', () => {
    expect(isPlanId('agent')).toBe(true);
    expect(isPlanId('agency')).toBe(true);
    expect(isPlanId('enterprise')).toBe(false);
    expect(isPlanId(undefined)).toBe(false);
  });
});

describe('trial eligibility', () => {
  it('grants the trial only to PPRA-verified accounts with an FFC and no prior subscription', () => {
    expect(isTrialEligible({ isVerified: true, hasFfc: true }, false)).toBe(true);
    expect(isTrialEligible({ isVerified: true, hasFfc: false }, false)).toBe(false);
    expect(isTrialEligible({ isVerified: false, hasFfc: true }, false)).toBe(false);
    // Already had a subscription consumes the offer.
    expect(isTrialEligible({ isVerified: true, hasFfc: true }, true)).toBe(false);
  });
});

describe('entitlement derivation', () => {
  const now = new Date('2026-06-25T00:00:00.000Z');
  const base: SubscriptionRecord = {
    id: 's1', plan: 'agent', status: 'trialing', amount: 49900, currency: 'ZAR',
    trialEndsAt: null, currentPeriodEnd: null, cancelAtPeriodEnd: false,
  };

  it('returns none for no subscription', () => {
    expect(deriveEntitlement(null, now)).toMatchObject({ active: false, state: 'none' });
  });

  it('treats a future trial as active with days left', () => {
    const sub = { ...base, status: 'trialing' as const, trialEndsAt: '2026-10-25T00:00:00.000Z' };
    const ent = deriveEntitlement(sub, now);
    expect(ent.active).toBe(true);
    expect(ent.state).toBe('trialing');
    expect(ent.daysLeft).toBeGreaterThan(100);
    expect(ent.label).toContain('Trial');
  });

  it('treats an expired trial as expired', () => {
    const sub = { ...base, status: 'trialing' as const, trialEndsAt: '2026-05-25T00:00:00.000Z' };
    expect(deriveEntitlement(sub, now)).toMatchObject({ active: false, state: 'expired' });
  });

  it('treats an active paid subscription as active', () => {
    const sub = { ...base, status: 'active' as const, currentPeriodEnd: '2026-07-25T00:00:00.000Z' };
    expect(deriveEntitlement(sub, now)).toMatchObject({ active: true, state: 'active' });
  });

  it('treats a past_due subscription as not active', () => {
    const sub = { ...base, status: 'past_due' as const };
    expect(deriveEntitlement(sub, now)).toMatchObject({ active: false, state: 'expired' });
  });
});

describe('paystack webhook signature', () => {
  const secret = 'sk_test_example';
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'abc' } });

  it('accepts a correctly signed body', () => {
    const sig = createHmac('sha512', secret).update(body, 'utf8').digest('hex');
    expect(verifyPaystackSignature(body, sig, secret)).toBe(true);
  });

  it('rejects a tampered body or bad signature', () => {
    const sig = createHmac('sha512', secret).update(body, 'utf8').digest('hex');
    expect(verifyPaystackSignature(body + ' ', sig, secret)).toBe(false);
    expect(verifyPaystackSignature(body, 'deadbeef', secret)).toBe(false);
    expect(verifyPaystackSignature(body, null, secret)).toBe(false);
  });
});
