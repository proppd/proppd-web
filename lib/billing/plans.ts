export type PlanId = 'agent' | 'agency';

export type Plan = {
  id: PlanId;
  name: string;
  /** Price per month in ZAR cents (Paystack's smallest-unit amount). */
  priceCents: number;
  interval: 'monthly';
  tagline: string;
  features: string[];
  /** Env var holding the Paystack plan code used for recurring billing. */
  planCodeEnv: string;
};

// Free months granted to PPRA-verified accounts on their first subscription.
export const TRIAL_MONTHS = 4;

export const PLANS: Record<PlanId, Plan> = {
  agent: {
    id: 'agent',
    name: 'Agent',
    priceCents: 49900, // R499 / month
    interval: 'monthly',
    tagline: 'For individual agents running their own pipeline.',
    features: [
      'Unlimited leads',
      'Unlimited listings',
      'AgentOS CRM, viewings and follow-ups',
      'PPRA verification badge',
      'Buyer interest signals per listing',
    ],
    planCodeEnv: 'PAYSTACK_PLAN_AGENT',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    priceCents: 119900, // R1 199 / month
    interval: 'monthly',
    tagline: 'For agencies managing a team of agents.',
    features: [
      'Everything in the Agent plan',
      'Unlimited agents on the agency',
      'Agency-level PPRA verification',
      'Shared agency lead routing',
      'Agency listings dashboard',
    ],
    planCodeEnv: 'PAYSTACK_PLAN_AGENCY',
  },
};

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}

export function isPlanId(value: unknown): value is PlanId {
  return value === 'agent' || value === 'agency';
}

/** The plan that matches a workspace role. Agency admins bill at the agency tier. */
export function planForRole(role: string): PlanId {
  return role === 'agency_admin' ? 'agency' : 'agent';
}

/** Formats ZAR cents as a clean Rand string, e.g. 49900 -> "R 499". */
export function formatZar(cents: number): string {
  const rand = cents / 100;
  const whole = Number.isInteger(rand) ? rand.toString() : rand.toFixed(2);
  // Space-group thousands to match the rest of the product (e.g. "R 1 199").
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${grouped}`;
}
