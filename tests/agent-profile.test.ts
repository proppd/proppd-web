import { describe, expect, it } from 'vitest';
import { buildProfilePrefill, parseAreasServed, slugifyAgentName, validateAgentProfileInput } from '@/lib/agents/profile';

describe('parseAreasServed', () => {
  it('splits comma/newline separated strings and dedupes', () => {
    expect(parseAreasServed('Sandton, Rosebank\nSandton')).toEqual(['Sandton', 'Rosebank']);
  });

  it('accepts arrays and trims blanks', () => {
    expect(parseAreasServed([' Cape Town ', '', 'Camps Bay'])).toEqual(['Cape Town', 'Camps Bay']);
  });

  it('returns empty for unusable input', () => {
    expect(parseAreasServed(undefined)).toEqual([]);
    expect(parseAreasServed(42)).toEqual([]);
  });
});

describe('validateAgentProfileInput', () => {
  const valid = {
    name: 'Lerato Mokoena',
    phone: '+27 11 234 5678',
    agencyName: 'Seeff',
    areasServed: ['Sandton'],
  };

  it('accepts a complete profile', () => {
    const result = validateAgentProfileInput(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areasServed).toEqual(['Sandton']);
      expect(result.data.name).toBe('Lerato Mokoena');
    }
  });

  it('requires name, phone, agency and at least one area', () => {
    const result = validateAgentProfileInput({ name: 'Al', phone: '123', agencyName: '', areasServed: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('Enter your full name.');
      expect(result.errors).toContain('Enter a contact phone number.');
      expect(result.errors).toContain('Enter your agency name (or your own name if independent).');
      expect(result.errors).toContain('Add at least one area you serve, e.g. Sandton.');
    }
  });

  it('rejects an invalid public email', () => {
    const result = validateAgentProfileInput({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('Enter a valid email address.');
    }
  });

  it('accepts an area string and normalises it to an array', () => {
    const result = validateAgentProfileInput({ ...valid, areasServed: 'Sandton, Rosebank' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areasServed).toEqual(['Sandton', 'Rosebank']);
    }
  });
});

describe('buildProfilePrefill', () => {
  it('combines signup metadata into profile defaults', () => {
    const prefill = buildProfilePrefill(
      { first_name: 'Lerato', last_name: 'Mokoena', phone: '+27 11', agency: 'Seeff', area: 'Sandton, Rosebank' },
      'lerato@seeff.co.za',
    );
    expect(prefill.name).toBe('Lerato Mokoena');
    expect(prefill.phone).toBe('+27 11');
    expect(prefill.email).toBe('lerato@seeff.co.za');
    expect(prefill.agencyName).toBe('Seeff');
    expect(prefill.areasServed).toEqual(['Sandton', 'Rosebank']);
  });

  it('handles missing metadata gracefully', () => {
    const prefill = buildProfilePrefill(null, null);
    expect(prefill.name).toBeUndefined();
    expect(prefill.areasServed).toEqual([]);
  });
});

describe('slugifyAgentName', () => {
  it('produces directory-compatible slugs', () => {
    expect(slugifyAgentName('Lerato Mokoena')).toBe('lerato-mokoena');
    expect(slugifyAgentName('Smith & Co')).toBe('smith-and-co');
  });
});
