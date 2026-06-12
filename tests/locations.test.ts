import { describe, expect, it } from 'vitest';
import { listings } from '@/lib/demo-data';
import type { Listing } from '@/lib/demo-data';
import {
  MAJOR_CITY_LANDINGS,
  buildCityLandingLinks,
  filterListingsByLocation,
  findAgentsForLocation,
  formatLocationListingHeadline,
  resolveLocationSlug,
  slugifyLocation,
} from '@/lib/locations';

describe('slugifyLocation', () => {
  it('slugifies city names for landing URLs', () => {
    expect(slugifyLocation('Cape Town')).toBe('cape-town');
    expect(slugifyLocation('Sea Point')).toBe('sea-point');
    expect(slugifyLocation('KwaZulu-Natal')).toBe('kwazulu-natal');
  });
});

describe('resolveLocationSlug', () => {
  it('resolves a city slug from listings', () => {
    const location = resolveLocationSlug(listings, 'johannesburg');
    expect(location).toEqual({ slug: 'johannesburg', name: 'Johannesburg', scope: 'city' });
  });

  it('resolves a suburb slug from listings', () => {
    const location = resolveLocationSlug(listings, 'sea-point');
    expect(location?.name).toBe('Sea Point');
    expect(location?.scope).toBe('suburb');
  });

  it('resolves a province slug from listings', () => {
    const location = resolveLocationSlug(listings, 'gauteng');
    expect(location?.name).toBe('Gauteng');
    expect(location?.scope).toBe('province');
  });

  it('falls back to major cities when no listings match', () => {
    const location = resolveLocationSlug([], 'pretoria');
    expect(location).toEqual({ slug: 'pretoria', name: 'Pretoria', scope: 'city' });
  });

  it('returns undefined for unknown locations', () => {
    expect(resolveLocationSlug(listings, 'atlantis-underwater-city')).toBeUndefined();
    expect(resolveLocationSlug(listings, '')).toBeUndefined();
  });
});

describe('filterListingsByLocation', () => {
  it('returns only listings in the resolved city', () => {
    const location = resolveLocationSlug(listings, 'cape-town');
    expect(location).toBeDefined();
    const matches = filterListingsByLocation(listings, location!);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((listing) => listing.city === 'Cape Town')).toBe(true);
  });

  it('excludes inactive listings', () => {
    const inactive: Listing[] = listings.map((listing) => ({ ...listing, isActive: false }));
    const location = resolveLocationSlug(listings, 'cape-town');
    expect(filterListingsByLocation(inactive, location!)).toHaveLength(0);
  });
});

describe('buildCityLandingLinks', () => {
  it('always includes the major launch cities', () => {
    const links = buildCityLandingLinks([]);
    expect(links.map((city) => city.slug)).toEqual(MAJOR_CITY_LANDINGS.map((city) => city.slug));
  });

  it('adds listing cities and excludes the current city', () => {
    const links = buildCityLandingLinks(listings, 'cape-town');
    expect(links.some((city) => city.slug === 'cape-town')).toBe(false);
    expect(links.some((city) => city.slug === 'johannesburg')).toBe(true);
  });
});

describe('findAgentsForLocation', () => {
  const agents = [
    { name: 'Lerato Mokoena', agency: 'Proppd Verified Realty', area: 'Johannesburg North', listings: 18 },
    { name: 'Mia Jacobs', agency: 'Atlantic Property Co.', area: 'Atlantic Seaboard', listings: 11 },
    { name: 'Retired Agent', agency: 'Old Agency', area: 'Johannesburg South', listings: 0, isActive: false },
  ];

  it('matches agents by area name', () => {
    const location = resolveLocationSlug(listings, 'johannesburg');
    const matches = findAgentsForLocation(agents, [], location!);
    expect(matches.map((agent) => agent.name)).toEqual(['Lerato Mokoena']);
  });

  it('matches agents through active listings in the location', () => {
    const location = resolveLocationSlug(listings, 'cape-town');
    const matches = findAgentsForLocation(agents, listings, location!);
    expect(matches.some((agent) => agent.name === 'Mia Jacobs')).toBe(true);
  });

  it('excludes inactive agents', () => {
    const location = resolveLocationSlug(listings, 'johannesburg');
    const matches = findAgentsForLocation(agents, listings, location!);
    expect(matches.some((agent) => agent.name === 'Retired Agent')).toBe(false);
  });
});

describe('formatLocationListingHeadline', () => {
  it('pluralises and labels the purpose', () => {
    expect(formatLocationListingHeadline(3, 'sale', 'Cape Town')).toBe('3 properties for sale in Cape Town');
    expect(formatLocationListingHeadline(1, 'rent', 'Durban')).toBe('1 property to rent in Durban');
  });
});
