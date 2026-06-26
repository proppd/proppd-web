import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { buildAuthCallbackUrl } from '@/lib/auth/redirects';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { isVerifiedAgentEmail, doesProfileExistForEmail, createAgentReviewRequest } from '@/lib/proppd/backend';
import { rateLimitByIdentifier, rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { sendEmail, isEmailConfigured } from '@/lib/notifications/email';
import { buildMagicLinkEmailHtml, buildMagicLinkEmailText } from '@/lib/email/templates/magic-link';
import { verifyWithPPRA, isAutoApprovable } from '@/lib/ppra/verification';
import { sendManualReviewEmail } from '@/lib/ppra/manual-review';

export const runtime = 'nodejs';
// PPRA verification and outbound email sending can take longer than the default.
export const maxDuration = 30;

type MagicLinkBody = {
  email?: unknown;
  nextPath?: unknown;
  allowSignUp?: unknown;
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

  // Second rate-limit dimension keyed by the target email, so one mailbox cannot
  // be flooded with login links from rotating IP addresses.
  const limitedByEmail = rateLimitByIdentifier(email, rateLimitPolicies.auth, 'auth:magic-link');
  if (limitedByEmail) return limitedByEmail;

  const profile = profileData(body?.profile);
  const nextPath = safeNextPath(body?.nextPath);
  const origin = new URL(request.url).origin;

  // PPRA gate: if the request includes a certificate and identity fields, verify
  // it first. Verified agents are onboarded immediately; non-verified requests
  // are sent for manual review and do not get a magic link.
  const ffcNumber = profile?.fidelity_fund_certificate_number;
  const firstName = profile?.first_name;
  const lastName = profile?.last_name;

  if (ffcNumber && firstName && lastName) {
    let verification: Parameters<typeof isAutoApprovable>[0];

    const passed = body?.ppraVerification;
    if (passed && typeof passed === 'object' && (passed as { status?: string }).status === 'verified') {
      verification = passed as Parameters<typeof isAutoApprovable>[0];
    } else {
      verification = await verifyWithPPRA({ ffcNumber, firstName, lastName });
    }

    if (isAutoApprovable(verification)) {
      const response = NextResponse.json({ ok: true, onboarded: true, ppra: 'verified' });
      const supabase = createServerClient(config.url, config.publishableKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      });

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

      return response;
    }

    const reviewInput = {
      firstName,
      lastName,
      email,
      phone: profile?.phone,
      agency: profile?.agency,
      area: profile?.area,
      ffcNumber,
      verification: verification as Parameters<typeof sendManualReviewEmail>[0]['verification'],
    };
    await Promise.all([
      sendManualReviewEmail(reviewInput),
      createAgentReviewRequest({
        firstName,
        lastName,
        email,
        phone: profile?.phone,
        agency: profile?.agency,
        area: profile?.area,
        ffcNumber,
        verificationStatus: (verification as { status?: string }).status ?? 'unknown',
        verificationReason: (verification as { reason?: string }).reason,
      }),
    ]);

    return NextResponse.json(
      {
        ok: false,
        ppra: 'not_verified',
        error:
          'Your FFC could not be auto-verified against the PPRA register. The Proppd team has been notified and will review your application manually. For urgent queries, email info@proppd.com.',
      },
      { status: 403 },
    );
  }

  // Invite-only by default, but let agents who have passed PPRA / Fidelity Fund
  // validation onboard instantly: if their email already matches a verified,
  // active agent, allow the account to be created on first magic-link sign-in.
  const shouldCreateUser = body?.allowSignUp === true || (await isVerifiedAgentEmail(email).catch(() => false));

  // When a Supabase service role key and email provider are both configured,
  // generate the link ourselves so we can use the branded email template.
  const adminClient = getSupabaseAdminClient();
  if (adminClient && isEmailConfigured()) {
    let canProceed = shouldCreateUser;
    if (!canProceed) {
      canProceed = await doesProfileExistForEmail(email).catch(() => false);
    }

    if (canProceed) {
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('next', nextPath);

      const { data, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: loginUrl.toString(),
          data: profile,
        },
      });

      if (!error && data?.properties?.action_link) {
        const emailResult = await sendEmail({
          to: email,
          subject: 'Your Proppd sign-in link',
          html: buildMagicLinkEmailHtml({ actionLink: data.properties.action_link, email, origin }),
          text: buildMagicLinkEmailText({ actionLink: data.properties.action_link, email, origin }),
        });
        if (emailResult.delivered) {
          return NextResponse.json({ ok: true });
        }
      }
    } else {
      // Unknown email in invite-only mode: silently succeed to prevent enumeration.
      return NextResponse.json({ ok: true });
    }
  }

  // Fallback: use the PKCE flow via @supabase/ssr. The magic link returns a
  // `?code=` that /auth/callback can exchange.
  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo: buildAuthCallbackUrl(origin, nextPath),
      data: profile,
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Could not send the login link. If you are new to Proppd, email info@proppd.com so we can approve your access.' }, { status: 400 });
  }

  return response;
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
