import { createHmac, timingSafeEqual } from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';

export function getPaystackSecretKey(env: NodeJS.ProcessEnv = process.env): string | null {
  const key = env.PAYSTACK_SECRET_KEY?.trim();
  return key ? key : null;
}

export function getPaystackPlanCode(planCodeEnv: string, env: NodeJS.ProcessEnv = process.env): string | null {
  const code = env[planCodeEnv]?.trim();
  return code ? code : null;
}

/**
 * Verifies a Paystack webhook signature. Paystack signs the raw request body
 * with HMAC SHA-512 using the secret key and sends it in `x-paystack-signature`.
 * Pure and side-effect free so it can be unit tested without the network.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null | undefined, secretKey: string): boolean {
  if (!signature) return false;
  const expected = createHmac('sha512', secretKey).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type InitializeTransactionInput = {
  email: string;
  /** Amount in ZAR cents. */
  amount: number;
  planCode: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export type InitializeTransactionResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializeTransaction(
  input: InitializeTransactionInput,
  secretKey: string,
): Promise<InitializeTransactionResult | null> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: 'ZAR',
      plan: input.planCode,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { status?: boolean; data?: { authorization_url?: string; access_code?: string; reference?: string } };
  if (!json.status || !json.data?.authorization_url || !json.data.reference) return null;

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code ?? '',
    reference: json.data.reference,
  };
}

export type VerifiedTransaction = {
  status: string; // 'success' when paid
  reference: string;
  amount: number;
  customerCode: string | null;
  authorizationCode: string | null;
  planObject: { plan_code?: string } | null;
};

export async function verifyTransaction(reference: string, secretKey: string): Promise<VerifiedTransaction | null> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    status?: boolean;
    data?: {
      status?: string;
      reference?: string;
      amount?: number;
      customer?: { customer_code?: string };
      authorization?: { authorization_code?: string };
      plan_object?: { plan_code?: string };
    };
  };
  if (!json.status || !json.data) return null;

  return {
    status: json.data.status ?? 'unknown',
    reference: json.data.reference ?? reference,
    amount: json.data.amount ?? 0,
    customerCode: json.data.customer?.customer_code ?? null,
    authorizationCode: json.data.authorization?.authorization_code ?? null,
    planObject: json.data.plan_object ?? null,
  };
}
