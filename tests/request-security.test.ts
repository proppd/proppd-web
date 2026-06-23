import { describe, expect, it } from 'vitest';
import { NextResponse } from 'next/server';
import {
  allowedRequestOrigins,
  getRequestSourceOrigin,
  isAllowedRequestOrigin,
  rejectCrossOriginMutation,
  withSecurityHeaders,
} from '@/lib/security/request-guards';

function request(headers: Record<string, string> = {}, url = 'https://proppd.com/api/leads') {
  return new Request(url, { method: 'POST', headers });
}

describe('request origin guards', () => {
  it('allows same-origin mutation requests', () => {
    const req = request({ origin: 'https://proppd.com' });

    expect(getRequestSourceOrigin(req)).toBe('https://proppd.com');
    expect(isAllowedRequestOrigin(req)).toBe(true);
    expect(rejectCrossOriginMutation(req)).toBeNull();
  });

  it('rejects explicit cross-origin mutation requests', async () => {
    const response = rejectCrossOriginMutation(request({ origin: 'https://evil.example' }));

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ ok: false, error: 'Request origin is not allowed.' });
  });

  it('trusts configured app origins in addition to the request host', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.proppd.com/';
    const req = request({ origin: 'https://www.proppd.com' }, 'https://proppd.com/api/leads');

    expect(Array.from(allowedRequestOrigins(req))).toEqual(expect.arrayContaining(['https://proppd.com', 'https://www.proppd.com']));
    expect(isAllowedRequestOrigin(req)).toBe(true);

    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('sets baseline browser security headers', () => {
    const response = withSecurityHeaders(NextResponse.next());

    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('strict-transport-security')).toContain('includeSubDomains');
  });
});
