import { NextResponse, type NextRequest } from 'next/server';

type RequestLike = Pick<Request, 'headers' | 'url'> | NextRequest;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const BASELINE_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  'upgrade-insecure-requests',
].join('; ');

export function isSafeHttpMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

export function allowedRequestOrigins(request: RequestLike): Set<string> {
  const origins = new Set<string>();
  addOrigin(origins, new URL(request.url).origin);
  addOrigin(origins, process.env.NEXT_PUBLIC_APP_URL);
  addOrigin(origins, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  return origins;
}

export function getRequestSourceOrigin(request: RequestLike): string | null {
  const origin = request.headers.get('origin');
  if (origin) return normaliseOrigin(origin);

  const referer = request.headers.get('referer');
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin(request: RequestLike): boolean {
  const sourceOrigin = getRequestSourceOrigin(request);
  // Same-origin fetches, server-to-server calls, and cron jobs may not include
  // Origin/Referer. Do not block those; reject only explicit cross-origin sources.
  if (!sourceOrigin) return true;
  return allowedRequestOrigins(request).has(sourceOrigin);
}

export function rejectCrossOriginMutation(request: RequestLike): NextResponse | null {
  if (isAllowedRequestOrigin(request)) return null;

  return NextResponse.json(
    { ok: false, error: 'Request origin is not allowed.' },
    { status: 403 },
  );
}

export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', BASELINE_CONTENT_SECURITY_POLICY);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

function addOrigin(origins: Set<string>, value: string | undefined) {
  const origin = normaliseOrigin(value);
  if (origin) origins.add(origin);
}

function normaliseOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
