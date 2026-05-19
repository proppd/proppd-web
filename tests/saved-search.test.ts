import { describe, expect, it } from 'vitest';
import { parseListingFilters } from '@/lib/listings/filters';
import { buildSavedSearchMailto, buildSavedSearchPath } from '@/lib/listings/saved-search';

describe('buildSavedSearchPath', () => {
  it('serializes only meaningful listing filters into a saved-search URL', () => {
    const filters = parseListingFilters(
      new URLSearchParams({
        q: 'secure parking',
        purpose: 'rent',
        location: 'Cape Town',
        minPrice: '10000',
        maxPrice: '20000',
        bedrooms: '2',
        sort: 'price-asc',
      }),
    );

    expect(buildSavedSearchPath(filters, '/properties')).toBe('/properties?q=secure+parking&purpose=rent&location=Cape+Town&minPrice=10000&maxPrice=20000&bedrooms=2&sort=price-asc');
  });

  it('keeps purpose-specific pages clean by not duplicating the purpose param', () => {
    const filters = parseListingFilters(new URLSearchParams({ q: 'secure parking', purpose: 'rent' }));

    expect(buildSavedSearchPath(filters, '/properties/to-rent')).toBe('/properties/to-rent?q=secure+parking');
  });
});

describe('buildSavedSearchMailto', () => {
  it('creates a support-friendly saved-search request email', () => {
    const filters = parseListingFilters(new URLSearchParams({ q: 'secure parking', purpose: 'rent' }));
    const mailto = buildSavedSearchMailto(filters, { path: '/properties/to-rent', resultCount: 1 });
    const decoded = decodeURIComponent(mailto);

    expect(mailto).toContain('mailto:info@proppd.com');
    expect(decoded).toContain('Saved search request: rental homes matching “secure parking” in South Africa');
    expect(decoded).toContain('Current matching listings: 1');
    expect(decoded).toContain('https://proppd.com/properties/to-rent?q=secure+parking');
    expect(decoded).toContain('I understand Proppd will use my contact details');
  });
});
