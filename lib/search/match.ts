import type { Listing } from '@/lib/demo-data';
import { applyListingFilters, parseListingFilters, type ListingFilters } from '@/lib/listings/filters';
import type { SavedSearchPath } from './saved';

// Rebuild the filter set from a stored saved search (query string + path).
export function savedSearchFilters(queryString: string, path: SavedSearchPath): ListingFilters {
  const params = new URLSearchParams(queryString);
  if (path === '/properties/for-sale') params.set('purpose', 'sale');
  else if (path === '/properties/to-rent') params.set('purpose', 'rent');
  return parseListingFilters(params);
}

// Listings that match the saved search AND were listed after `since`.
export function findNewMatches(
  search: { queryString: string; path: SavedSearchPath },
  listings: Listing[],
  since: Date,
): Listing[] {
  const sinceMs = since.getTime();
  const matches = applyListingFilters(listings, savedSearchFilters(search.queryString, search.path));
  return matches.filter((listing) => {
    const listedMs = new Date(listing.listedAt).getTime();
    return Number.isFinite(listedMs) && listedMs > sinceMs;
  });
}
