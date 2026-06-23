import { describe, expect, it } from 'vitest';
import { genericUserError, sanitizeLogValue } from '@/lib/security/logging';

describe('safe logging helpers', () => {
  it('redacts common secrets from logged errors', () => {
    const message = 'failed with Authorization: Bearer abc.def.ghi and password=supersecret and postgres://user:pass@example.com/db';

    const sanitized = sanitizeLogValue(message);

    expect(sanitized).not.toContain('abc.def.ghi');
    expect(sanitized).not.toContain('supersecret');
    expect(sanitized).not.toContain('postgres://user:pass@example.com/db');
    expect(sanitized).toContain('[redacted]');
  });

  it('keeps user-facing errors generic', () => {
    expect(genericUserError()).toBe('Something went wrong. Please try again.');
    expect(genericUserError('Could not complete login. Please request a fresh link.')).toBe('Could not complete login. Please request a fresh link.');
  });
});
