import { NextResponse, type NextRequest } from 'next/server';

export type RateLimitPolicy = {
  /** Stable bucket name such as `lead-form` or `dashboard-mutation`. */
  key: string;
  /** Maximum accepted requests inside the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RequestLike = Pick<Request, 'headers' | 'url'> | NextRequest;

const buckets = new Map<string, Bucket>();

export const rateLimitPolicies = {
  auth: { key: 'auth', limit: 5, windowMs: 60_000 },
  leadForm: { key: 'lead-form', limit: 5, windowMs: 60_000 },
  contactForm: { key: 'contact-form', limit: 5, windowMs: 60_000 },
  valuation: { key: 'valuation', limit: 10, windowMs: 60_000 },
  listingView: { key: 'listing-view', limit: 60, windowMs: 60_000 },
  savedSearch: { key: 'saved-search', limit: 20, windowMs: 60_000 },
  savedHome: { key: 'saved-home', limit: 60, windowMs: 60_000 },
  dashboardMutation: { key: 'dashboard-mutation', limit: 60, windowMs: 60_000 },
  adminMutation: { key: 'admin-mutation', limit: 60, windowMs: 60_000 },
  aiDescription: { key: 'ai-description', limit: 10, windowMs: 60_000 },
  aiLeadReply: { key: 'ai-lead-reply', limit: 10, windowMs: 60_000 },
} satisfies Record<string, RateLimitPolicy>;

export function rateLimitRequest(request: RequestLike, policy: RateLimitPolicy): NextResponse | null {
  return rateLimitHeaders(request.headers, policy, request.url);
}

export function rateLimitHeaders(headers: Headers, policy: RateLimitPolicy, scope = 'server-action'): NextResponse | null {
  const result = checkRateLimit(headers, policy, scope);
  if (result.allowed) return null;

  return NextResponse.json(
    { ok: false, error: 'Too many requests. Please wait a moment and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(policy.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

/**
 * Rate-limit by an explicit identifier (e.g. an email address) instead of the
 * caller IP. Used as a second dimension so a single mailbox cannot be targeted
 * from rotating IPs. The identifier is namespaced so it never collides with the
 * IP-keyed buckets.
 */
export function rateLimitByIdentifier(identifier: string, policy: RateLimitPolicy, scope = 'server-action'): NextResponse | null {
  const result = checkRateLimitForKey(`id:${sanitiseIdentifier(identifier)}`, policy, scope);
  if (result.allowed) return null;

  return NextResponse.json(
    { ok: false, error: 'Too many requests. Please wait a moment and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(policy.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

export function checkRateLimit(headers: Headers, policy: RateLimitPolicy, scope = 'server-action'):
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSeconds: number; resetAt: number } {
  return checkRateLimitForKey(rateLimitIdentifier(headers), policy, scope);
}

function checkRateLimitForKey(identifier: string, policy: RateLimitPolicy, scope: string):
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSeconds: number; resetAt: number } {
  const now = Date.now();
  const bucketKey = `${policy.key}:${routeScope(scope)}:${identifier}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    const resetAt = now + policy.windowMs;
    buckets.set(bucketKey, { count: 1, resetAt });
    return { allowed: true, remaining: policy.limit - 1, resetAt };
  }

  if (current.count >= policy.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  return { allowed: true, remaining: policy.limit - current.count, resetAt: current.resetAt };
}

export function rateLimitIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headers.get('x-real-ip')?.trim();
  const candidate = forwarded || realIp || 'unknown';
  return sanitiseIdentifier(candidate);
}

function sanitiseIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-zA-Z0-9:@._-]/g, '').slice(0, 96) || 'unknown';
}

export function resetRateLimitsForTests() {
  buckets.clear();
}

function routeScope(scope: string): string {
  try {
    const url = new URL(scope);
    return url.pathname;
  } catch {
    return scope;
  }
}
