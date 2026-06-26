import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { buildAuthCallbackUrl } from '@/lib/auth/redirects';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { isVerifiedAgentEmail, doesProfileExistForEmail } from '@/lib/proppd/backend';
import { rateLimitByIdentifier, rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { sendEmail, isEmailConfigured } from '@/lib/notifications/email';
import { buildMagicLinkEmailHtml, buildMagicLinkEmailText } from '@/lib/email/templates/magic-link';

export const runtime = 'nodejs';

type MagicLinkBody = {
  email?: unknown;
  nextPath?: unknown;
  allowSignUp?: unknown;
  profile?: unknown;
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

  const nextPath = safeNextPath(body?.nextPath);
  const origin = new URL(request.url).origin;

  // Invite-only by default, but let agents who have passed PPRA / Fidelity Fund
  // validation onboard instantly: if their email already matches a verified,
  // active agent, allow the account to be created on first magic-link sign-in.
  const shouldCreateUser = body?.allowSignUp === true || (await isVerifiedAgentEmail(email).catch(() => false));

  // When a Supabase service role key and Resend are both configured, take over
  // the email send so we can use a branded template. The admin client generates
  // the magic link without sending it; we send it ourselves via Resend.
  // The admin-generated link uses the implicit (hash token) flow, so we redirect
  // to the login page — the HashSessionHandler there handles the hash tokens.
  const adminClient = getSupabaseAdminClient();
  if (adminClient && isEmailConfigured()) {
    // For invite-only requests, only generate a link when the user already has
    // a Proppd profile — prevents creating ghost auth accounts for unknown emails.
    let canProceed = shouldCreateUser;
    if (!canProceed) {
      canProceed = await doesProfileExistForEmail(email).catch(() => false);
    }

    if (canProceed) {
      // Redirect to /login so HashSessionHandler can exchange the hash tokens.
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('next', nextPath);

      const { data, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: loginUrl.toString(),
          data: profileData(body?.profile),
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
        // Resend delivery failed — fall through to signInWithOtp so the user still gets a link.
      }

      // Admin link generation failed or email undelivered — fall through to signInWithOtp below.
    } else {
      // Unknown email in invite-only mode: silently succeed to prevent enumeration.
      return NextResponse.json({ ok: true });
    }
  }

  // Fallback: use the PKCE flow via @supabase/ssr. The magic link returns a
  // `?code=` that /auth/callback can exchange — not implicit hash tokens.
  // The PKCE code-verifier is written as a cookie on this response.
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
      data: profileData(body?.profile),
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
