import { describe, expect, it } from 'vitest';
import type { Listing } from '@/lib/demo-data';
import { estimateInstantValuation } from '@/lib/valuation/instant';

const baseListing = (overrides: Partial<Listing>): Listing => ({
  id: overrides.id ?? 'listing-1',
  slug: overrides.slug ?? 'listing-1',
  purpose: overrides.purpose ?? 'For sale',
  title: overrides.title ?? 'Comparable home',
  location: overrides.location ?? `${overrides.suburb ?? 'Sandton'}, ${overrides.city ?? 'Johannesburg'}`,
  suburb: overrides.suburb ?? 'Sandton',
  city: overrides.city ?? 'Johannesburg',
  province: overrides.province ?? 'Gauteng',
  price: overrides.price ?? `R ${overrides.priceValue ?? 3000000}`,
  priceValue: overrides.priceValue ?? 3000000,
  beds: overrides.beds ?? 3,
  baths: overrides.baths ?? 2,
  parking: overrides.parking ?? 2,
  type: overrides.type ?? 'House',
  agency: overrides.agency ?? 'Proppd Realty',
  agent: overrides.agent ?? 'Agent One',
  gradient: 'from-[#1A1A2E] via-[#4A3AFF] to-[#60A5FA]',
  photos: [],
  description: 'Test listing',
  features: [],
  highlights: [],
  mandate: 'Agency verified',
  listedAt: overrides.listedAt ?? '2026-05-01',
  floorSize: overrides.floorSize,
  erfSize: overrides.erfSize,
  isActive: overrides.isActive,
});

describe('estimateInstantValuation', () => {
  it('returns a sale range from strongest comparable listings first', () => {
    const result = estimateInstantValuation(
      {
        suburb: 'Sandton',
        city: 'Johannesburg',
        propertyType: 'House',
        bedrooms: 3,
        purpose: 'sale',
      },
      [
        baseListing({ id: 'a', slug: 'a', priceValue: 3000000 }),
        baseListing({ id: 'b', slug: 'b', priceValue: 3300000, baths: 3 }),
        baseListing({ id: 'c', slug: 'c', priceValue: 2700000, floorSize: 170 }),
        baseListing({ id: 'rental', slug: 'rental', purpose: 'To rent', priceValue: 25000 }),
        baseListing({ id: 'other-city', slug: 'other-city', city: 'Cape Town', suburb: 'Claremont', priceValue: 6000000 }),
      ],
    );

    expect(result.status).toBe('estimate');
    expect(result.midValue).toBe(3000000);
    expect(result.lowValue).toBeLessThan(result.midValue);
    expect(result.highValue).toBeGreaterThan(result.midValue);
    expect(result.confidence).toBe('medium');
    expect(result.comparables.map((item) => item.slug)).toEqual(['a', 'b', 'c']);
    expect(result.reason).toContain('3 comparable sale listings');
  });

  it('prefers compatible property types before using weaker same-suburb matches', () => {
    const result = estimateInstantValuation(
      {
        suburb: 'Sandton',
        city: 'Johannesburg',
        propertyType: 'House',
        bedrooms: 3,
        purpose: 'sale',
      },
      [
        baseListing({ id: 'house', slug: 'house', type: 'House', priceValue: 3200000 }),
        baseListing({ id: 'cluster', slug: 'cluster', type: 'Cluster', priceValue: 3000000 }),
        baseListing({ id: 'apartment', slug: 'apartment', type: 'Apartment', priceValue: 1400000 }),
      ],
    );

    expect(result.status).toBe('estimate');
    expect(result.comparables.map((item) => item.slug)).toEqual(['house', 'cluster']);
  });

  it('returns a low-confidence route when the market has too few matching listings', () => {
    const result = estimateInstantValuation(
      {
        suburb: 'Bishopscourt',
        city: 'Cape Town',
        propertyType: 'House',
        bedrooms: 5,
        purpose: 'sale',
      },
      [baseListing({ id: 'sandton', slug: 'sandton', suburb: 'Sandton', city: 'Johannesburg', priceValue: 3200000 })],
    );

    expect(result.status).toBe('needs_agent');
    expect(result.confidence).toBe('low');
    expect(result.comparables).toHaveLength(0);
    expect(result.reason).toContain('not enough comparable listings');
  });

  it('uses monthly rental comps separately from sale listings', () => {
    const result = estimateInstantValuation(
      {
        suburb: 'Sea Point',
        city: 'Cape Town',
        propertyType: 'Apartment',
        bedrooms: 2,
        purpose: 'rent',
      },
      [
        baseListing({ id: 'rent-a', slug: 'rent-a', purpose: 'To rent', suburb: 'Sea Point', city: 'Cape Town', type: 'Apartment', beds: 2, priceValue: 18000 }),
        baseListing({ id: 'rent-b', slug: 'rent-b', purpose: 'To rent', suburb: 'Sea Point', city: 'Cape Town', type: 'Apartment', beds: 2, priceValue: 22000 }),
        baseListing({ id: 'sale-a', slug: 'sale-a', purpose: 'For sale', suburb: 'Sea Point', city: 'Cape Town', type: 'Apartment', beds: 2, priceValue: 3500000 }),
      ],
    );

    expect(result.status).toBe('estimate');
    expect(result.midValue).toBe(20000);
    expect(result.comparables.map((item) => item.slug)).toEqual(['rent-a', 'rent-b']);
    expect(result.label).toBe('Estimated monthly rental range');
  });
});
