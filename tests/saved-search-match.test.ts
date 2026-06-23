import { describe, expect, it } from 'vitest';
import type { Listing } from '@/lib/demo-data';
import { findNewMatches, savedSearchFilters } from '@/lib/search/match';

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: overrides.id ?? 'id',
    slug: overrides.slug ?? 'slug',
    purpose: overrides.purpose ?? 'For sale',
    title: overrides.title ?? 'A home',
    location: overrides.location ?? 'Sandton, Johannesburg',
    suburb: overrides.suburb ?? 'Sandton',
    city: overrides.city ?? 'Johannesburg',
    province: overrides.province ?? 'Gauteng',
    price: overrides.price ?? 'R 2 000 000',
    priceValue: overrides.priceValue ?? 2_000_000,
    beds: overrides.beds ?? 3,
    baths: overrides.baths ?? 2,
    parking: overrides.parking ?? 2,
    type: overrides.type ?? 'House',
    agency: overrides.agency ?? 'Sakstons',
    agent: overrides.agent ?? 'Mark Chait',
    gradient: overrides.gradient ?? 'from-[#1A1A2E] to-[#60A5FA]',
    photos: overrides.photos ?? [{ src: 'x', alt: 'x' }],
    description: overrides.description ?? 'desc',
    features: overrides.features ?? [],
    highlights: overrides.highlights ?? [],
    mandate: overrides.mandate ?? 'Agency verified',
    listedAt: overrides.listedAt ?? '2026-05-01',
    floorSize: overrides.floorSize,
    erfSize: overrides.erfSize,
    featured: overrides.featured,
    isActive: overrides.isActive,
  } as Listing;
}

describe('saved search matcher', () => {
  it('rebuilds purpose from the saved path and parses filters', () => {
    const filters = savedSearchFilters('minPrice=1000000&bedrooms=3', '/properties/for-sale');
    expect(filters.purpose).toBe('sale');
    expect(filters.minPrice).toBe(1_000_000);
    expect(filters.bedrooms).toBe(3);
  });

  it('returns only listings that match the search and are newer than the cutoff', () => {
    const listings = [
      listing({ slug: 'old-match', suburb: 'Sandton', priceValue: 2_500_000, beds: 3, listedAt: '2026-05-01' }),
      listing({ slug: 'new-match', suburb: 'Sandton', priceValue: 2_500_000, beds: 3, listedAt: '2026-06-10' }),
      listing({ slug: 'new-too-cheap', suburb: 'Sandton', priceValue: 900_000, beds: 3, listedAt: '2026-06-10' }),
      listing({ slug: 'new-wrong-area', suburb: 'Durban North', city: 'Durban', location: 'Durban North', priceValue: 2_500_000, beds: 3, listedAt: '2026-06-10' }),
    ];
    const matches = findNewMatches(
      { queryString: 'location=Sandton&minPrice=1000000&bedrooms=3', path: '/properties' },
      listings,
      new Date('2026-06-01'),
    );
    expect(matches.map((m) => m.slug)).toEqual(['new-match']);
  });

  it('finds nothing when no listing is newer than the cutoff', () => {
    const listings = [listing({ slug: 'old', listedAt: '2026-04-01' })];
    expect(findNewMatches({ queryString: '', path: '/properties' }, listings, new Date('2026-06-01'))).toEqual([]);
  });
});
