import { describe, expect, it, beforeEach } from 'vitest';
import {
  checkRateLimit,
  rateLimitIdentifier,
  rateLimitPolicies,
  rateLimitRequest,
  resetRateLimitsForTests,
} from '@/lib/security/rate-limit';

function headers(values: Record<string, string> = {}) {
  return new Headers(values);
}

describe('rate limiting', () => {
  beforeEach(() => resetRateLimitsForTests());

  it('derives a stable identifier without trusting unsafe characters', () => {
    expect(rateLimitIdentifier(headers({ 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }))).toBe('203.0.113.10');
    expect(rateLimitIdentifier(headers({ 'x-real-ip': 'bad ip / token' }))).toBe('badiptoken');
  });

  it('allows requests up to the policy limit and then blocks', async () => {
    const policy = { key: 'test-bucket', limit: 2, windowMs: 60_000 };
    const h = headers({ 'x-forwarded-for': '203.0.113.20' });

    expect(checkRateLimit(h, policy, '/api/test')).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkRateLimit(h, policy, '/api/test')).toMatchObject({ allowed: true, remaining: 0 });
    expect(checkRateLimit(h, policy, '/api/test')).toMatchObject({ allowed: false });
  });

  it('keeps route scopes separate for the same visitor', () => {
    const policy = { key: 'shared', limit: 1, windowMs: 60_000 };
    const h = headers({ 'x-forwarded-for': '203.0.113.30' });

    expect(checkRateLimit(h, policy, '/api/a')).toMatchObject({ allowed: true });
    expect(checkRateLimit(h, policy, '/api/b')).toMatchObject({ allowed: true });
    expect(checkRateLimit(h, policy, '/api/a')).toMatchObject({ allowed: false });
  });

  it('returns a generic 429 response with retry metadata', async () => {
    const req = new Request('https://proppd.com/api/leads', { headers: { 'x-forwarded-for': '203.0.113.40' } });
    const policy = { ...rateLimitPolicies.leadForm, limit: 1 };

    expect(rateLimitRequest(req, policy)).toBeNull();
    const response = rateLimitRequest(req, policy);

    expect(response?.status).toBe(429);
    expect(response?.headers.get('retry-after')).toBeTruthy();
    await expect(response?.json()).resolves.toEqual({ ok: false, error: 'Too many requests. Please wait a moment and try again.' });
  });
});
