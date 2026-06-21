import { describe, expect, it } from 'vitest';
import { buildAuthCallbackUrl, safeAuthRedirectPath } from '@/lib/auth/redirects';

describe('auth redirect helpers', () => {
  it('keeps relative in-app next paths', () => {
    expect(safeAuthRedirectPath('/dashboard/leads?source=property')).toBe('/dashboard/leads?source=property');
    expect(safeAuthRedirectPath('/property/sandton-home')).toBe('/property/sandton-home');
  });

  it('falls back when next points outside the app', () => {
    expect(safeAuthRedirectPath(null)).toBe('/dashboard');
    expect(safeAuthRedirectPath('https://evil.example/dashboard')).toBe('/dashboard');
    expect(safeAuthRedirectPath('//evil.example/dashboard')).toBe('/dashboard');
    expect(safeAuthRedirectPath('/\\evil.example')).toBe('/dashboard');
    expect(safeAuthRedirectPath('   ')).toBe('/dashboard');
    expect(safeAuthRedirectPath('https://evil.example/dashboard', '/dashboard/listings')).toBe('/dashboard/listings');
  });

  it('builds a callback URL with a sanitized next param', () => {
    expect(buildAuthCallbackUrl('https://proppd.com', '/dashboard/listings')).toBe(
      'https://proppd.com/auth/callback?next=%2Fdashboard%2Flistings',
    );
    expect(buildAuthCallbackUrl('https://proppd.com', 'https://evil.example')).toBe(
      'https://proppd.com/auth/callback?next=%2Fdashboard',
    );
  });
});
