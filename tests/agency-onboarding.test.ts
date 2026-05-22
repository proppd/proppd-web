import { describe, expect, it } from 'vitest';
import { buildAgencyApplicationMailto, buildAgencyApplicationSummary, launchPackages, splitContactName } from '@/lib/agents/onboarding';

describe('agency onboarding helpers', () => {
  it('defines launch packages with clear pilot positioning', () => {
    expect(launchPackages).toHaveLength(3);
    expect(launchPackages.map((item) => item.id)).toEqual(['starter', 'growth', 'pilot']);
    expect(launchPackages.every((item) => item.features.length >= 4)).toBe(true);
  });

  it('builds a POPIA-aware agency application summary', () => {
    const summary = buildAgencyApplicationSummary({
      packageName: 'Agency Growth',
      agencyName: 'Northside Realty',
      contactName: 'Thabo Maseko',
      contactEmail: 'thabo@northside.co.za',
      contactPhone: '+27 11 555 1234',
      city: 'Johannesburg North',
      listingCount: '45',
      notes: 'Need a pilot by next month.',
    });

    expect(summary).toContain('Package: Agency Growth');
    expect(summary).toContain('Agency name: Northside Realty');
    expect(summary).toContain('Contact email: thabo@northside.co.za');
    expect(summary).toContain('Contact phone: +27 11 555 1234');
    expect(summary).toContain('Notes: Need a pilot by next month.');
    expect(summary).toContain('Approximate active listings: 45');
    expect(summary).toContain('POPIA acknowledgement');
  });

  it('splits contact names into first name and surname tokens', () => {
    expect(splitContactName('Thabo Maseko')).toEqual({ name: 'Thabo', surname: 'Maseko' });
    expect(splitContactName('Mpho')).toEqual({ name: 'Mpho', surname: 'Team' });
  });

  it('builds an encoded mailto for agency launch requests', () => {
    const mailto = buildAgencyApplicationMailto({ packageName: 'AgentOS Pilot' });

    expect(mailto).toContain('mailto:info@proppd.com');
    expect(mailto).toContain(encodeURIComponent('Agency launch request: AgentOS Pilot'));
    expect(mailto).toContain(encodeURIComponent('Agency name: [please add]'));
  });
});
