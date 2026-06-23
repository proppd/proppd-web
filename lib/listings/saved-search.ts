import type { ListingFilters } from '@/lib/listings/filters';

export type SavedSearchMailtoOptions = {
  path: '/properties' | '/properties/for-sale' | '/properties/to-rent';
  resultCount: number;
};

export function buildSavedSearchMailto(filters: ListingFilters, options: SavedSearchMailtoOptions): string {
  const url = buildSavedSearchPath(filters, options.path);
  const subject = `Saved search request: ${savedSearchName(filters, options.path)}`;
  const body = [
    'Hi Proppd,',
    '',
    'Please set up a search alert for this property search:',
    `Search: ${savedSearchName(filters, options.path)}`,
    `Current matching listings: ${options.resultCount}`,
    `Link: https://proppd.com${url}`,
    '',
    'Preferred alert frequency:',
    'Buyer/renter notes:',
    '',
    'I understand Proppd will use my contact details to respond to this saved-search request.',
  ].join('\n');

  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildSavedSearchPath(filters: ListingFilters, path: SavedSearchMailtoOptions['path']): string {
  const params = new URLSearchParams();

  if (filters.query) params.set('q', filters.query);
  if (path === '/properties' && filters.purpose !== 'all') params.set('purpose', filters.purpose);
  if (filters.location) params.set('location', filters.location);
  if (filters.propertyType) params.set('type', filters.propertyType);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.bedrooms !== undefined) params.set('bedrooms', String(filters.bedrooms));
  if (filters.bathrooms !== undefined) params.set('bathrooms', String(filters.bathrooms));
  if (filters.parking !== undefined) params.set('parking', String(filters.parking));
  if (filters.sort !== 'featured') params.set('sort', filters.sort);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function savedSearchName(filters: ListingFilters, path: SavedSearchMailtoOptions['path']): string {
  const purpose = path === '/properties/for-sale' ? 'homes for sale' : path === '/properties/to-rent' ? 'rental homes' : filters.purpose === 'sale' ? 'homes for sale' : filters.purpose === 'rent' ? 'rental homes' : 'homes';
  const query = filters.query ? ` matching “${filters.query}”` : '';
  const location = filters.location ? ` around ${filters.location}` : ' in South Africa';
  return `${purpose}${query}${location}`;
}
