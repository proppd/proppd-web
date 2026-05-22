import type { Listing } from '@/lib/demo-data';

export type ListingPurposeFilter = 'all' | 'sale' | 'rent';
export type ListingSort = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export type ListingFilters = {
  purpose: ListingPurposeFilter;
  query?: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  status?: string;
  agency?: string;
  agent?: string;
  page: number;
  pageSize: number;
  sort: ListingSort;
};

const PURPOSES = new Set<ListingPurposeFilter>(['all', 'sale', 'rent']);
const SORTS = new Set<ListingSort>(['featured', 'price-asc', 'price-desc', 'newest']);

export function parseListingFilters(searchParams: URLSearchParams): ListingFilters {
  const purpose = normalizePurpose(searchParams.get('purpose'));
  const sort = normalizeSort(searchParams.get('sort'));

  return {
    purpose,
    query: normalizeText(searchParams.get('q') || searchParams.get('query')),
    location: normalizeText(searchParams.get('location')),
    propertyType: normalizeText(searchParams.get('propertyType') || searchParams.get('type')),
    minPrice: parsePositiveNumber(searchParams.get('minPrice')),
    maxPrice: parsePositiveNumber(searchParams.get('maxPrice')),
    bedrooms: parsePositiveInteger(searchParams.get('bedrooms')),
    bathrooms: parsePositiveInteger(searchParams.get('bathrooms')),
    parking: parsePositiveInteger(searchParams.get('parking')),
    status: normalizeText(searchParams.get('status')),
    agency: normalizeText(searchParams.get('agency')),
    agent: normalizeText(searchParams.get('agent')),
    page: parsePage(searchParams.get('page')),
    pageSize: 12,
    sort,
  };
}

export function applyListingFilters(items: Listing[], filters: ListingFilters): Listing[] {
  const filtered = items.filter((listing) => {
    if (listing.isActive === false) return false;

    if (filters.purpose !== 'all') {
      const expectedPurpose = filters.purpose === 'sale' ? 'For sale' : 'To rent';
      if (listing.purpose !== expectedPurpose) return false;
    }

    if (filters.query && !matchesSearchQuery(listing, filters.query)) return false;
    if (filters.location && !contains(listing.location, filters.location)) return false;
    if (filters.propertyType && !contains(listing.type, filters.propertyType)) return false;
    if (filters.agency && !contains(listing.agency, filters.agency)) return false;
    if (filters.agent && !contains(listing.agent, filters.agent)) return false;
    if (filters.minPrice !== undefined && listing.priceValue < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && listing.priceValue > filters.maxPrice) return false;
    if (filters.bedrooms !== undefined && listing.beds < filters.bedrooms) return false;
    if (filters.bathrooms !== undefined && listing.baths < filters.bathrooms) return false;
    if (filters.parking !== undefined && listing.parking < filters.parking) return false;

    return true;
  });

  return sortListings(filtered, filters.sort);
}

export function paginateListings<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safePageSize)),
  };
}

function normalizePurpose(value: string | null): ListingPurposeFilter {
  if (!value) return 'all';
  const normalized = value.toLowerCase();
  if (normalized === 'for-sale') return 'sale';
  if (normalized === 'to-rent') return 'rent';
  return PURPOSES.has(normalized as ListingPurposeFilter) ? (normalized as ListingPurposeFilter) : 'all';
}

function normalizeSort(value: string | null): ListingSort {
  if (!value) return 'featured';
  const normalized = value.toLowerCase();
  return SORTS.has(normalized as ListingSort) ? (normalized as ListingSort) : 'featured';
}

function normalizeText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePositiveInteger(value: string | null): number | undefined {
  const parsed = parsePositiveNumber(value);
  if (parsed === undefined) return undefined;
  return Number.isInteger(parsed) ? parsed : undefined;
}

function parsePage(value: string | null): number {
  const parsed = parsePositiveInteger(value);
  return parsed && parsed > 0 ? parsed : 1;
}

function contains(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

function matchesSearchQuery(listing: Listing, query: string): boolean {
  const haystack = [
    listing.id,
    listing.slug,
    listing.title,
    listing.location,
    listing.suburb,
    listing.city,
    listing.province,
    listing.type,
    listing.agency,
    listing.agent,
    listing.description,
    ...listing.features,
    ...listing.highlights,
  ].join(' ');

  return contains(haystack, query);
}

function sortListings(items: Listing[], sort: ListingSort): Listing[] {
  const cloned = [...items];
  if (sort === 'price-asc') return cloned.sort((a, b) => a.priceValue - b.priceValue);
  if (sort === 'price-desc') return cloned.sort((a, b) => b.priceValue - a.priceValue);
  if (sort === 'newest') return cloned.reverse();
  return cloned.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}
