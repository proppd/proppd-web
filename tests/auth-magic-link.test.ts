import { describe, expect, it } from 'vitest';
import { profileData } from '@/app/api/auth/magic-link/route';

describe('magic-link profile metadata', () => {
  it('keeps the Fidelity Fund Certificate number for agency access review', () => {
    expect(
      profileData({
        first_name: 'Lerato',
        last_name: 'Mokoena',
        agency: 'Example Estates',
        area: 'Sandton',
        fidelity_fund_certificate_number: 'FFC 1234567',
        role: 'agent',
      }),
    ).toMatchObject({
      first_name: 'Lerato',
      last_name: 'Mokoena',
      agency: 'Example Estates',
      area: 'Sandton',
      fidelity_fund_certificate_number: 'FFC 1234567',
      role: 'agent',
    });
  });

  it('drops unexpected profile keys', () => {
    expect(profileData({ fidelity_fund_certificate_number: 'FFC 1234567', admin: 'true' })).toEqual({
      fidelity_fund_certificate_number: 'FFC 1234567',
    });
  });
});
