import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { buildAuthCallbackUrl } from '@/lib/auth/redirects';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';

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

  const nextPath = safeNextPath(body?.nextPath);
  const origin = new URL(request.url).origin;
  const supabase = createClient(config.url, config.publishableKey, { auth: { persistSession: false } });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: body?.allowSignUp === true,
      emailRedirectTo: buildAuthCallbackUrl(origin, nextPath),
      data: profileData(body?.profile),
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
