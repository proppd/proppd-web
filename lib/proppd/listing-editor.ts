export const portalPropertyTypeOptions = [
  { label: 'House', slug: 'house', category: 'residential' },
  { label: 'Apartment', slug: 'apartment', category: 'residential' },
  { label: 'Townhouse', slug: 'townhouse', category: 'residential' },
  { label: 'Vacant Land', slug: 'vacant-land', category: 'land' },
  { label: 'Farm', slug: 'farm', category: 'agricultural' },
  { label: 'Commercial', slug: 'commercial', category: 'commercial' },
  { label: 'Industrial', slug: 'industrial', category: 'industrial' },
  { label: 'Office', slug: 'office', category: 'commercial' },
  { label: 'Retail', slug: 'retail', category: 'commercial' },
  { label: 'Development', slug: 'development', category: 'development' },
  { label: 'Room / Share', slug: 'room-share', category: 'residential' },
] as const;

export type PortalListingPurpose = 'sale' | 'rent';
export type PortalListingStatus = 'draft' | 'pending_review' | 'available' | 'under_offer' | 'sold' | 'rented' | 'archived';

export const LISTING_STATUSES: PortalListingStatus[] = ['draft', 'pending_review', 'available', 'under_offer', 'sold', 'rented', 'archived'];

export function isListingStatus(value: unknown): value is PortalListingStatus {
  return typeof value === 'string' && (LISTING_STATUSES as string[]).includes(value);
}

export type PortalListingInput = Record<string, unknown>;

export type PortalListingPhotoInput = {
  src: string;
  alt: string;
};

export type ValidPortalListingInput = {
  title: string;
  purpose: PortalListingPurpose;
  status: PortalListingStatus;
  price: number;
  description: string;
  suburb: string;
  city: string;
  province: string;
  propertyTypeSlug: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  floorSizeSqm?: number;
  erfSizeSqm?: number;
  ratesAndTaxes?: number;
  levies?: number;
  isFeatured?: boolean;
  mandateType?: 'sole' | 'joint' | 'open';
  mandateSellerName?: string;
  mandateCommissionPct?: number;
  mandateExpiresAt?: string;
  photos: PortalListingPhotoInput[];
};

const MAX_LISTING_PHOTOS = 20;

export function parseListingPhotos(value: unknown): PortalListingPhotoInput[] {
  if (!Array.isArray(value)) return [];

  const photos: PortalListingPhotoInput[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const src = coerceString((entry as Record<string, unknown>).src);
    if (!isValidPhotoUrl(src)) continue;
    const alt = coerceString((entry as Record<string, unknown>).alt) || 'Listing photo';
    photos.push({ src, alt });
    if (photos.length >= MAX_LISTING_PHOTOS) break;
  }
  return photos;
}

function isValidPhotoUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function coerceString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function coerceNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function coerceBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
  }
  return false;
}

export function validatePortalListingInput(input: PortalListingInput) {
  const errors: string[] = [];
  const title = coerceString(input.title);
  const purpose = coerceString(input.purpose) as PortalListingPurpose;
  const status = coerceString(input.status) as PortalListingStatus;
  const description = coerceString(input.description);
  const suburb = coerceString(input.suburb);
  const city = coerceString(input.city);
  const province = coerceString(input.province);
  const propertyTypeSlug = coerceString(input.propertyTypeSlug);
  const price = coerceNumber(input.price);

  if (title.length < 6) errors.push('Title is required.');
  if (purpose !== 'sale' && purpose !== 'rent') errors.push('Purpose must be sale or rent.');
  if (!['draft', 'pending_review', 'available', 'under_offer', 'sold', 'rented', 'archived'].includes(status)) {
    errors.push('Status is invalid.');
  }
  if (price === undefined || price < 0) errors.push('Price must be 0 or higher.');
  if (description.length < 20) errors.push('Description must be at least 20 characters.');
  if (suburb.length < 2) errors.push('Suburb is required.');
  if (city.length < 2) errors.push('City is required.');
  if (province.length < 2) errors.push('Province is required.');
  if (propertyTypeSlug.length < 2) errors.push('Select a property type.');

  const validPropertyType = portalPropertyTypeOptions.some((option) => option.slug === propertyTypeSlug);
  if (!validPropertyType) errors.push('Select a valid property type.');

  const bedrooms = coerceNumber(input.bedrooms);
  const bathrooms = coerceNumber(input.bathrooms);
  const parking = coerceNumber(input.parking);
  const floorSizeSqm = coerceNumber(input.floorSizeSqm);
  const erfSizeSqm = coerceNumber(input.erfSizeSqm);
  const ratesAndTaxes = coerceNumber(input.ratesAndTaxes);
  const levies = coerceNumber(input.levies);

  if (errors.length > 0) {
    return { success: false as const, errors };
  }

  const mandateTypeRaw = coerceString(input.mandateType);
  const mandateType = (mandateTypeRaw === 'sole' || mandateTypeRaw === 'joint' || mandateTypeRaw === 'open')
    ? mandateTypeRaw : undefined;

  const mandateExpiresAtRaw = coerceString(input.mandateExpiresAt);
  const mandateExpiresAt = mandateExpiresAtRaw || undefined;

  return {
    success: true as const,
    data: {
      title,
      purpose,
      status,
      price: price as number,
      description,
      suburb,
      city,
      province,
      propertyTypeSlug,
      bedrooms,
      bathrooms,
      parking,
      floorSizeSqm,
      erfSizeSqm,
      ratesAndTaxes,
      levies,
      isFeatured: coerceBoolean(input.isFeatured),
      mandateType,
      mandateSellerName: coerceString(input.mandateSellerName) || undefined,
      mandateCommissionPct: coerceNumber(input.mandateCommissionPct),
      mandateExpiresAt,
      photos: parseListingPhotos(input.photos),
    } satisfies ValidPortalListingInput,
  };
}

export function slugifyListingTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 60);
}

export function generatePortalListingSlug(title: string): string {
  const base = slugifyListingTitle(title) || 'listing';
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
