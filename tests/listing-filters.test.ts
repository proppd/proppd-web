import { describe, expect, it } from 'vitest';
import { applyListingFilters, parseListingFilters } from '@/lib/listings/filters';
import { listings } from '@/lib/demo-data';

describe('parseListingFilters', () => {
  it('normalizes known listing filters from URL search params', () => {
    const filters = parseListingFilters(
      new URLSearchParams({
        purpose: 'rent',
        location: 'Cape Town',
        minPrice: '10000',
        maxPrice: '20000',
        bedrooms: '2',
        page: '3',
        sort: 'price-asc',
      }),
    );

    expect(filters).toEqual({
      purpose: 'rent',
      location: 'Cape Town',
      propertyType: undefined,
      minPrice: 10000,
      maxPrice: 20000,
      bedrooms: 2,
      bathrooms: undefined,
      parking: undefined,
      status: undefined,
      agency: undefined,
      agent: undefined,
      page: 3,
      pageSize: 12,
      sort: 'price-asc',
    });
  });

  it('falls back safely for invalid numbers and unknown options', () => {
    const filters = parseListingFilters(
      new URLSearchParams({ purpose: 'lease', minPrice: '-50', bedrooms: 'studio', page: '0', sort: 'random' }),
    );

    expect(filters.purpose).toBe('all');
    expect(filters.minPrice).toBeUndefined();
    expect(filters.bedrooms).toBeUndefined();
    expect(filters.page).toBe(1);
    expect(filters.sort).toBe('featured');
  });
});

describe('applyListingFilters', () => {
  it('filters sale and rental listings by purpose, city, price, and bedrooms', () => {
    const filters = parseListingFilters(new URLSearchParams({ purpose: 'rent', location: 'Cape Town', maxPrice: '20000', bedrooms: '2' }));
    const results = applyListingFilters(listings, filters);

    expect(results.map((listing) => listing.slug)).toEqual(['sea-point-apartment-with-parking-20401']);
  });

  it('sorts matching listings by price descending', () => {
    const filters = parseListingFilters(new URLSearchParams({ purpose: 'sale', sort: 'price-desc' }));
    const results = applyListingFilters(listings, filters);

    expect(results.map((listing) => listing.priceValue)).toEqual([3250000, 2150000]);
  });
});
