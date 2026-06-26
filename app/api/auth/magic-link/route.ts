import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { buildAuthCallbackUrl } from '@/lib/auth/redirects';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { verifyWithPPRA, isAutoApprovable } from '@/lib/ppra/verification';
import { sendManualReviewEmail } from '@/lib/ppra/manual-review';

export const runtime = 'nodejs';
// PPRA verification makes an outbound HTTP call — allow enough time.
export const maxDuration = 30;

type MagicLinkBody = {
  email?: unknown;
  nextPath?: unknown;
  profile?: unknown;
  ppraVerification?: unknown;
};

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.auth);
  if (limited) return limited;

  const config = getSupabaseBrowserConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: 'Passwordless login is not available on this deployment.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as MagicLinkBody | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
  }

  const profile = profileData(body?.profile);
  const nextPath = safeNextPath(body?.nextPath);

  // ─── PPRA verification gate ───────────────────────────────────
  //
  // Agency signup requires a valid PPRA FFC verification. If the
  // client already ran the check, it passes the result; otherwise
  // we run it server-side. If not verified, the request goes to
  // manual review and NO magic link is sent.
  const ffcNumber = profile?.fidelity_fund_certificate_number;
  const firstName = profile?.first_name;
  const lastName = profile?.last_name;

  if (ffcNumber && firstName && lastName) {
    let verification;

    // Trust a client-passed verification result (already checked server-side
    // via /api/auth/verify-ffc). If missing or stale, re-verify.
    const passed = body?.ppraVerification;
    if (
      passed &&
      typeof passed === 'object' &&
      (passed as { status?: string }).status === 'verified'
    ) {
      verification = passed as { status: string; ffcNumber: string };
    } else {
      verification = await verifyWithPPRA({ ffcNumber, firstName, lastName });
    }

    if (isAutoApprovable(verification as Parameters<typeof isAutoApprovable>[0])) {
      // Auto-onboard: create the account with agent role
      const origin = new URL(request.url).origin;
      const supabase = createClient(config.url, config.publishableKey, { auth: { persistSession: false } });
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: buildAuthCallbackUrl(origin, nextPath),
          data: { ...profile, ppra_verified: 'true', ppra_verified_at: new Date().toISOString() },
        },
      });

      if (error) {
        return NextResponse.json({ ok: false, error: 'Could not send the login link. Please try again or email info@proppd.com.' }, { status: 400 });
      }

      return NextResponse.json({ ok: true, onboarded: true, ppra: 'verified' });
    }

    // Not verified — send to manual review, do NOT create account
    await sendManualReviewEmail({
      firstName,
      lastName,
      email,
      phone: profile?.phone,
      agency: profile?.agency,
      area: profile?.area,
      ffcNumber,
      verification: verification as Parameters<typeof sendManualReviewEmail>[0]['verification'],
    });

    return NextResponse.json({
      ok: false,
      ppra: 'not_verified',
      error: 'Your FFC could not be auto-verified against the PPRA register. The Proppd team has been notified and will review your application manually. For urgent queries, email info@proppd.com.',
    }, { status: 403 });
  }

  // ─── Existing user login (no FFC / no profile data = plain login) ──
  const origin = new URL(request.url).origin;
  const supabase = createClient(config.url, config.publishableKey, { auth: { persistSession: false } });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: buildAuthCallbackUrl(origin, nextPath),
      data: profile,
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Could not send the login link. If you are new to Proppd, email info@proppd.com so we can approve your access.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeNextPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value.slice(0, 120);
}

export function profileData(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const allowed = ['first_name', 'last_name', 'phone', 'agency', 'area', 'fidelity_fund_certificate_number', 'role'];
  const data: Record<string, string> = {};
  for (const key of allowed) {
    const raw = source[key];
    if (typeof raw === 'string' && raw.trim()) data[key] = raw.trim().slice(0, 120);
  }
  return Object.keys(data).length ? data : undefined;
}
