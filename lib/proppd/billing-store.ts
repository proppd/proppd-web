import { Pool } from 'pg';
import { getPortalDatabaseUrl, type PortalUserAccess } from '@/lib/proppd/backend';
import { getPlan, planForRole, TRIAL_MONTHS, type PlanId } from '@/lib/billing/plans';
import type { SubscriptionRecord, SubscriptionStatus, VerificationFacts } from '@/lib/billing/subscription';

let poolCache: { url: string; pool: Pool } | undefined;

function getPool(url: string): Pool {
  if (!poolCache || poolCache.url !== url) {
    const host = safeHost(url);
    poolCache = {
      url,
      pool: new Pool({
        connectionString: url,
        max: 2,
        ssl: host && !['localhost', '127.0.0.1'].includes(host) ? { rejectUnauthorized: false } : undefined,
      }),
    };
  }
  return poolCache.pool;
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

type SubscriptionRow = {
  id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

function mapSubscription(row: SubscriptionRow): SubscriptionRecord {
  return {
    id: row.id,
    plan: row.plan,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
}

export type BillingContext = {
  subscription: SubscriptionRecord | null;
  verification: VerificationFacts;
  plan: PlanId;
};

/** Loads the subscriber's current subscription plus PPRA verification facts. */
export async function loadBillingContext(access: PortalUserAccess): Promise<BillingContext | null> {
  const url = getPortalDatabaseUrl();
  if (!url) return null;
  const pool = getPool(url);
  const plan = planForRole(access.role);

  const subResult = await pool.query<SubscriptionRow>(
    `select id, plan, status, amount, currency, trial_ends_at, current_period_end, cancel_at_period_end
     from public.subscriptions where profile_id = $1 limit 1`,
    [access.profileId],
  );

  const verification = await loadVerification(pool, access);

  return {
    subscription: subResult.rows[0] ? mapSubscription(subResult.rows[0]) : null,
    verification,
    plan,
  };
}

async function loadVerification(pool: Pool, access: PortalUserAccess): Promise<VerificationFacts> {
  if (access.role === 'super_admin') {
    return { isVerified: true, hasFfc: true };
  }

  if (access.role === 'agency_admin' && access.agencyId) {
    const res = await pool.query<{ is_verified: boolean; ffc_number: string | null }>(
      'select is_verified, ffc_number from public.agencies where id = $1 limit 1',
      [access.agencyId],
    );
    const row = res.rows[0];
    return { isVerified: Boolean(row?.is_verified), hasFfc: Boolean(row?.ffc_number) };
  }

  if (access.agentId) {
    const res = await pool.query<{ is_verified: boolean; ffc_number: string | null }>(
      'select is_verified, ffc_number from public.agents where id = $1 limit 1',
      [access.agentId],
    );
    const row = res.rows[0];
    return { isVerified: Boolean(row?.is_verified), hasFfc: Boolean(row?.ffc_number) };
  }

  return { isVerified: false, hasFfc: false };
}

/** Grants a free trial to a PPRA-verified subscriber. Returns the new record. */
export async function startTrialSubscription(access: PortalUserAccess, plan: PlanId): Promise<SubscriptionRecord | null> {
  const url = getPortalDatabaseUrl();
  if (!url) return null;
  const pool = getPool(url);
  const amount = getPlan(plan).priceCents;

  const res = await pool.query<SubscriptionRow>(
    `insert into public.subscriptions
       (profile_id, agent_id, agency_id, plan, status, amount, trial_ends_at, current_period_end)
     values ($1, $2, $3, $4::public.subscription_plan, 'trialing',
             $5, now() + make_interval(months => $6), now() + make_interval(months => $6))
     on conflict (profile_id) do nothing
     returning id, plan, status, amount, currency, trial_ends_at, current_period_end, cancel_at_period_end`,
    [access.profileId, access.agentId, access.agencyId, plan, amount, TRIAL_MONTHS],
  );

  const row = res.rows[0];
  if (!row) return null;
  await recordEvent(pool, row.id, 'trial_started', amount, null, { plan, months: TRIAL_MONTHS });
  return mapSubscription(row);
}

/** Ensures an incomplete row exists before redirecting to Paystack. Returns its id. */
export async function ensureIncompleteSubscription(access: PortalUserAccess, plan: PlanId): Promise<string | null> {
  const url = getPortalDatabaseUrl();
  if (!url) return null;
  const pool = getPool(url);
  const amount = getPlan(plan).priceCents;

  const res = await pool.query<{ id: string }>(
    `insert into public.subscriptions (profile_id, agent_id, agency_id, plan, status, amount)
     values ($1, $2, $3, $4::public.subscription_plan, 'incomplete', $5)
     on conflict (profile_id) do update set plan = excluded.plan, amount = excluded.amount, updated_at = now()
     returning id`,
    [access.profileId, access.agentId, access.agencyId, plan, amount],
  );
  return res.rows[0]?.id ?? null;
}

/** Activates a paid subscription after a verified Paystack payment. */
export async function activatePaidSubscriptionByProfile(input: {
  profileId: string;
  customerCode: string | null;
  authorizationCode: string | null;
  subscriptionCode?: string | null;
  reference: string;
  amount: number;
}): Promise<void> {
  const url = getPortalDatabaseUrl();
  if (!url) return;
  const pool = getPool(url);

  const res = await pool.query<{ id: string }>(
    `update public.subscriptions set
       status = 'active',
       paystack_customer_code = coalesce($2, paystack_customer_code),
       paystack_authorization_code = coalesce($3, paystack_authorization_code),
       paystack_subscription_code = coalesce($4, paystack_subscription_code),
       current_period_end = now() + make_interval(months => 1),
       cancel_at_period_end = false,
       updated_at = now()
     where profile_id = $1
     returning id`,
    [input.profileId, input.customerCode, input.authorizationCode, input.subscriptionCode ?? null],
  );

  const id = res.rows[0]?.id;
  if (id) await recordEvent(pool, id, 'payment_succeeded', input.amount, input.reference, {});
}

/** Webhook helper: update a subscription found by Paystack customer code. */
export async function applySubscriptionStatusByCustomer(input: {
  customerCode: string;
  status: SubscriptionStatus;
  extendPeriodMonths?: number;
  subscriptionCode?: string | null;
  emailToken?: string | null;
  cancelAtPeriodEnd?: boolean;
  eventType: string;
  amount?: number | null;
  reference?: string | null;
}): Promise<void> {
  const url = getPortalDatabaseUrl();
  if (!url) return;
  const pool = getPool(url);

  const res = await pool.query<{ id: string }>(
    `update public.subscriptions set
       status = $2::public.subscription_status,
       paystack_subscription_code = coalesce($3, paystack_subscription_code),
       paystack_email_token = coalesce($4, paystack_email_token),
       cancel_at_period_end = coalesce($5, cancel_at_period_end),
       current_period_end = case when $6::int is not null then now() + make_interval(months => $6::int) else current_period_end end,
       updated_at = now()
     where paystack_customer_code = $1
     returning id`,
    [
      input.customerCode,
      input.status,
      input.subscriptionCode ?? null,
      input.emailToken ?? null,
      input.cancelAtPeriodEnd ?? null,
      input.extendPeriodMonths ?? null,
    ],
  );

  const id = res.rows[0]?.id;
  if (id) await recordEvent(pool, id, input.eventType, input.amount ?? null, input.reference ?? null, {});
}

async function recordEvent(
  pool: Pool,
  subscriptionId: string,
  eventType: string,
  amount: number | null,
  reference: string | null,
  metadata: Record<string, unknown>,
): Promise<void> {
  await pool.query(
    `insert into public.subscription_events (subscription_id, event_type, amount, reference, metadata)
     values ($1, $2, $3, $4, $5)`,
    [subscriptionId, eventType, amount, reference, JSON.stringify(metadata)],
  );
}
