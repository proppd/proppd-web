const SENSITIVE_PATTERNS = [
  /postgres(?:ql)?:\/\/[^\s]+/gi,
  /(?:service[_-]?role|anon|publishable|api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi,
  /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi,
  /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  /sb_[A-Za-z0-9_\-]{12,}/g,
];

export function sanitizeLogValue(value: unknown): string {
  const raw = value instanceof Error ? value.message : typeof value === 'string' ? value : 'Unexpected error';
  return SENSITIVE_PATTERNS.reduce((text, pattern) => text.replace(pattern, '[redacted]'), raw).slice(0, 500);
}

export function genericUserError(fallback = 'Something went wrong. Please try again.'): string {
  return fallback;
}

export function logServerError(scope: string, error: unknown, metadata?: Record<string, string | number | boolean | null | undefined>) {
  const safeMeta = metadata
    ? Object.fromEntries(
        Object.entries(metadata)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, typeof value === 'string' ? sanitizeLogValue(value) : value]),
      )
    : undefined;

  if (safeMeta && Object.keys(safeMeta).length > 0) {
    console.error(scope, sanitizeLogValue(error), safeMeta);
    return;
  }

  console.error(scope, sanitizeLogValue(error));
}
