import { describe, expect, it } from 'vitest';
import {
  isValidAuthEmail,
  validateLoginInput,
  validatePassword,
  validateSignUpInput,
} from '@/lib/auth/validation';

describe('isValidAuthEmail', () => {
  it('accepts standard email addresses', () => {
    expect(isValidAuthEmail('agent@agency.co.za')).toBe(true);
    expect(isValidAuthEmail('  user@proppd.com  ')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidAuthEmail('not-an-email')).toBe(false);
    expect(isValidAuthEmail('user@')).toBe(false);
    expect(isValidAuthEmail('user@domain')).toBe(false);
    expect(isValidAuthEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts a password with letters and numbers of sufficient length', () => {
    expect(validatePassword('proppd2026')).toEqual([]);
  });

  it('rejects short passwords', () => {
    expect(validatePassword('ab1')).toContain('Password must be at least 8 characters.');
  });

  it('requires both letters and numbers', () => {
    expect(validatePassword('onlyletters')).toContain('Password must include at least one letter and one number.');
    expect(validatePassword('12345678')).toContain('Password must include at least one letter and one number.');
  });
});

describe('validateSignUpInput', () => {
  const valid = {
    firstName: 'Lerato',
    lastName: 'Mokoena',
    email: 'lerato@agency.co.za',
    password: 'proppd2026',
    confirmPassword: 'proppd2026',
  };

  it('accepts a complete valid sign-up', () => {
    expect(validateSignUpInput(valid)).toEqual({ success: true });
  });

  it('requires names and a valid email', () => {
    const result = validateSignUpInput({ ...valid, firstName: ' ', lastName: '', email: 'nope' });
    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.errors).toContain('Enter your first name.');
      expect(result.errors).toContain('Enter your last name.');
      expect(result.errors).toContain('Enter a valid email address.');
    }
  });

  it('rejects mismatched passwords', () => {
    const result = validateSignUpInput({ ...valid, confirmPassword: 'different1' });
    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.errors).toContain('Passwords do not match.');
    }
  });
});

describe('validateLoginInput', () => {
  it('accepts email plus password', () => {
    expect(validateLoginInput('agent@agency.co.za', 'secret123')).toEqual({ success: true });
  });

  it('requires a password and valid email', () => {
    const result = validateLoginInput('bad-email', '');
    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.errors).toContain('Enter a valid email address.');
      expect(result.errors).toContain('Enter your password.');
    }
  });
});
