import type { Listing } from './demo-data';
import { slugifyDirectoryName, type DirectoryAgent } from './directory';

export type LocationScope = 'city' | 'suburb' | 'province';

export type ResolvedLocation = {
  slug: string;
  name: string;
  scope: LocationScope;
};

export type CityLanding = {
  slug: string;
  name: string;
};

export const MAJOR_CITY_LANDINGS: CityLanding[] = [
  { slug: 'cape-town', name: 'Cape Town' },
  { slug: 'johannesburg', name: 'Johannesburg' },
  { slug: 'pretoria', name: 'Pretoria' },
  { slug: 'durban', name: 'Durban' },
];

export function slugifyLocation(value: string): string {
  return slugifyDirectoryName(value);
}

export function resolveLocationSlug(listings: Listing[], slug: string): ResolvedLocation | undefined {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return undefined;

  for (const listing of listings) {
    if (slugifyLocation(listing.city) === normalized) {
      return { slug: normalized, name: listing.city, scope: 'city' };
    }
  }

  for (const listing of listings) {
    if (slugifyLocation(listing.suburb) === normalized) {
      return { slug: normalized, name: listing.suburb, scope: 'suburb' };
    }
  }

  for (const listing of listings) {
    if (slugifyLocation(listing.province) === normalized) {
      return { slug: normalized, name: listing.province, scope: 'province' };
    }
  }

  const majorCity = MAJOR_CITY_LANDINGS.find((city) => city.slug === normalized);
  if (majorCity) {
    return { slug: majorCity.slug, name: majorCity.name, scope: 'city' };
  }

  return undefined;
}

export function filterListingsByLocation(listings: Listing[], location: ResolvedLocation): Listing[] {
  return listings.filter((listing) => {
    if (listing.isActive === false) return false;
    const value = location.scope === 'city' ? listing.city : location.scope === 'suburb' ? listing.suburb : listing.province;
    return slugifyLocation(value) === location.slug;
  });
}

export function buildCityLandingLinks(listings: Listing[], excludeSlug?: string): CityLanding[] {
  const cities = new Map<string, string>(MAJOR_CITY_LANDINGS.map((city) => [city.slug, city.name]));

  for (const listing of listings) {
    if (listing.isActive === false) continue;
    const slug = slugifyLocation(listing.city);
    if (slug && !cities.has(slug)) cities.set(slug, listing.city);
  }

  return [...cities.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .filter((city) => city.slug !== excludeSlug);
}

export function findAgentsForLocation(agents: DirectoryAgent[], listings: Listing[], location: ResolvedLocation): DirectoryAgent[] {
  const locationListings = filterListingsByLocation(listings, location);
  const agentNamesWithStock = new Set(locationListings.map((listing) => listing.agent));
  const locationTerm = location.name.toLowerCase();

  return agents.filter((agent) => {
    if (agent.isActive === false) return false;
    return agentNamesWithStock.has(agent.name) || agent.area.toLowerCase().includes(locationTerm);
  });
}

export function formatLocationListingHeadline(count: number, purpose: 'sale' | 'rent', locationName: string): string {
  const noun = count === 1 ? 'property' : 'properties';
  const purposeLabel = purpose === 'sale' ? 'for sale' : 'to rent';
  return `${count} ${noun} ${purposeLabel} in ${locationName}`;
}
