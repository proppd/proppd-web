import { describe, expect, it } from 'vitest';
import { buildLeadMailto, buildLeadSummary, type ListingLeadContext } from '@/lib/leads/mailto';

const listing: ListingLeadContext = {
  id: 'listing-1',
  slug: 'modern-3-bedroom-house-in-sandton-12345',
  title: 'Modern 3-bedroom house in Sandton',
  price: 'R 3 250 000',
  agent: 'Thabo Maseko',
  agency: 'Northside Realty',
};

describe('lead mailto helpers', () => {
  it('builds a POPIA-aware lead summary with listing and intent context', () => {
    const summary = buildLeadSummary({
      listing,
      lead: {
        name: 'Lerato',
        surname: 'Mokoena',
        email: 'Buyer@Example.com',
        phone: '+27 82 123 4567',
        message: 'Please arrange a viewing this week.',
        intent: 'viewing',
        popiaConsent: true,
      },
      sourcePath: '/property/modern-3-bedroom-house-in-sandton-12345',
    });

    expect(summary).toContain('Intent: Viewing request');
    expect(summary).toContain('Listing: Modern 3-bedroom house in Sandton');
    expect(summary).toContain('Agent: Thabo Maseko');
    expect(summary).toContain('POPIA consent: Yes');
    expect(summary).toContain('Email: buyer@example.com');
  });

  it('builds an encoded info@proppd.com lead mailto', () => {
    const mailto = buildLeadMailto({
      listing,
      lead: {
        name: 'Lerato',
        surname: 'Mokoena',
        email: 'buyer@example.com',
        phone: '+27 82 123 4567',
        message: 'Please arrange a viewing this week.',
        intent: 'viewing',
        popiaConsent: true,
      },
      sourcePath: '/property/modern-3-bedroom-house-in-sandton-12345',
    });

    expect(mailto).toContain('mailto:info@proppd.com');
    expect(mailto).toContain(encodeURIComponent('Lead: Modern 3-bedroom house in Sandton'));
    expect(mailto).toContain(encodeURIComponent('Please arrange a viewing this week.'));
  });
});
