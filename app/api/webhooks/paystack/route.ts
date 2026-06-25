import { NextResponse, type NextRequest } from 'next/server';
import { getPaystackSecretKey, verifyPaystackSignature } from '@/lib/billing/paystack';
import { applySubscriptionStatusByCustomer } from '@/lib/proppd/billing-store';
import { logServerError } from '@/lib/security/logging';

export const runtime = 'nodejs';

type PaystackEvent = {
  event: string;
  data: {
    reference?: string;
    amount?: number;
    subscription_code?: string;
    email_token?: string;
    customer?: { customer_code?: string };
    authorization?: { authorization_code?: string };
  };
};

// Paystack -> Proppd webhook. Auth is the HMAC SHA-512 signature, NOT a session,
// so the cross-origin mutation guard must not run here.
export async function POST(request: NextRequest) {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) return NextResponse.json({ ok: false }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  if (!verifyPaystackSignature(rawBody, signature, secretKey)) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const customerCode = event.data.customer?.customer_code;

  try {
    if (!customerCode) {
      // Nothing we can match on — acknowledge so Paystack stops retrying.
      return NextResponse.json({ ok: true });
    }

    switch (event.event) {
      case 'charge.success':
        await applySubscriptionStatusByCustomer({
          customerCode,
          status: 'active',
          extendPeriodMonths: 1,
          eventType: 'charge.success',
          amount: event.data.amount ?? null,
          reference: event.data.reference ?? null,
        });
        break;

      case 'subscription.create':
        await applySubscriptionStatusByCustomer({
          customerCode,
          status: 'active',
          subscriptionCode: event.data.subscription_code ?? null,
          emailToken: event.data.email_token ?? null,
          eventType: 'subscription.create',
        });
        break;

      case 'invoice.payment_failed':
        await applySubscriptionStatusByCustomer({
          customerCode,
          status: 'past_due',
          eventType: 'invoice.payment_failed',
        });
        break;

      case 'subscription.disable':
      case 'subscription.not_renew':
        await applySubscriptionStatusByCustomer({
          customerCode,
          status: 'active',
          cancelAtPeriodEnd: true,
          eventType: event.event,
        });
        break;

      default:
        // Unhandled event — acknowledge.
        break;
    }
  } catch (err) {
    logServerError('[paystack] webhook handling failed', err);
    // Still 200 so Paystack does not hammer retries on a transient DB blip.
  }

  return NextResponse.json({ ok: true });
}
