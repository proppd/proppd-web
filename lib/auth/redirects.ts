export const DEFAULT_AUTH_REDIRECT_PATH = '/dashboard/profile';

export function safeAuthRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
): string {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//')) return fallback;
  if (trimmed.includes('\\')) return fallback;

  return trimmed;
}

export function buildAuthCallbackUrl(origin: string, nextPath?: string | null): string {
  const url = new URL('/auth/callback', origin);
  url.searchParams.set('next', safeAuthRedirectPath(nextPath));
  return url.toString();
}
