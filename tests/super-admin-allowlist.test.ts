import { describe, expect, it } from 'vitest';
import { isAllowedSuperAdminEmail, SUPER_ADMIN_EMAILS } from '@/lib/auth/super-admin';
import { clampNonAdminRole } from '@/lib/proppd/backend';

describe('super admin allowlist', () => {
  it('only allows Proppd staff emails', () => {
    expect(isAllowedSuperAdminEmail('info@proppd.com')).toBe(true);
    expect(isAllowedSuperAdminEmail('INFO@Proppd.com')).toBe(true);
    expect(isAllowedSuperAdminEmail('  info@proppd.com  ')).toBe(true);
  });

  it('rejects any other email, including agent emails', () => {
    expect(isAllowedSuperAdminEmail('james@sakstons.com')).toBe(false);
    expect(isAllowedSuperAdminEmail('graham@sakstons.com')).toBe(false);
    expect(isAllowedSuperAdminEmail('attacker@evil.test')).toBe(false);
    expect(isAllowedSuperAdminEmail(null)).toBe(false);
    expect(isAllowedSuperAdminEmail(undefined)).toBe(false);
    expect(isAllowedSuperAdminEmail('')).toBe(false);
  });

  it('keeps the allowlist intentionally small', () => {
    // A guard against an accidental broadening of platform admin access.
    expect(SUPER_ADMIN_EMAILS).toEqual(['info@proppd.com']);
  });
});

describe('role clamp at read time', () => {
  it('downgrades a rogue super_admin DB role on a non-allowlisted account', () => {
    // e.g. james@sakstons.com mis-seeded as super_admin but linked to an agent.
    expect(clampNonAdminRole('super_admin', true)).toBe('agent');
    // No agent linkage -> drops all the way to a normal user.
    expect(clampNonAdminRole('super_admin', false)).toBe('user');
  });

  it('leaves legitimate non-admin roles untouched', () => {
    expect(clampNonAdminRole('agent', true)).toBe('agent');
    expect(clampNonAdminRole('agency_admin', false)).toBe('agency_admin');
    expect(clampNonAdminRole('user', false)).toBe('user');
  });
});
