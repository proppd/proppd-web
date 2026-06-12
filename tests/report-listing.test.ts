import { describe, expect, it } from 'vitest';
import { buildReportListingMailto, buildReportListingSummary } from '@/lib/listings/report';

const listing = {
  slug: 'modern-3-bedroom-house-in-sandton-12345',
  title: 'Modern 3-bedroom house in Sandton',
  agent: 'Lerato Mokoena',
  agency: 'Proppd Verified Realty',
};

describe('buildReportListingSummary', () => {
  it('includes listing, agent, agency, URL, and source path', () => {
    const summary = buildReportListingSummary(listing, '/property/modern-3-bedroom-house-in-sandton-12345');
    expect(summary).toContain('Listing: Modern 3-bedroom house in Sandton');
    expect(summary).toContain('Agent: Lerato Mokoena');
    expect(summary).toContain('Agency: Proppd Verified Realty');
    expect(summary).toContain('https://proppd.com/property/modern-3-bedroom-house-in-sandton-12345');
    expect(summary).toContain('Reported from: /property/modern-3-bedroom-house-in-sandton-12345');
  });

  it('prompts for a report reason', () => {
    const summary = buildReportListingSummary(listing, '/property/x');
    expect(summary).toContain('Reason for the report');
  });
});

describe('buildReportListingMailto', () => {
  it('builds a mailto link to the Proppd inbox with an encoded subject', () => {
    const mailto = buildReportListingMailto(listing, '/property/modern-3-bedroom-house-in-sandton-12345');
    expect(mailto.startsWith('mailto:info@proppd.com?subject=')).toBe(true);
    expect(mailto).toContain(encodeURIComponent('Report listing: Modern 3-bedroom house in Sandton'));
    expect(mailto).toContain('body=');
  });
});
