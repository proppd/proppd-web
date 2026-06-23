/**
 * Field mapping and value normalisation for agency feeds.
 *
 * Feeds from different agencies/CRMs use different field names and value
 * conventions ("For Sale" vs "sale", "R 1 250 000" vs "1250000", "Flat" vs
 * "apartment"). This layer resolves each canonical listing field from a raw
 * record using configurable aliases, then normalises the value into the shape
 * `validatePortalListingInput` expects.
 */

import { portalPropertyTypeOptions, type PortalListingStatus } from '@/lib/proppd/listing-editor';
import type { RawRecord, RawValue } from './feed';

/** Maps each canonical listing field to the feed column names that may supply it. */
export type FieldAliases = Record<string, string[]>;

export type MapRecordOptions = {
  aliases?: FieldAliases;
  /** Status applied when the feed has none (defaults to pending_review). */
  defaultStatus?: PortalListingStatus;
};

export type MappedListing = {
  externalRef: string | null;
  /** Loosely typed object ready for validatePortalListingInput. */
  input: Record<string, unknown>;
  raw: RawRecord;
};

export const DEFAULT_FIELD_ALIASES: FieldAliases = {
  externalRef: ['ref', 'reference', 'reference_number', 'listing_id', 'listingid', 'mandate', 'web_ref', 'webref', 'id'],
  title: ['title', 'heading', 'name', 'marketing_heading', 'listing_title'],
  purpose: ['purpose', 'listing_type', 'sale_type', 'transaction_type', 'type_of_sale', 'category', 'status_type'],
  status: ['status', 'listing_status', 'state', 'availability'],
  price: ['price', 'asking_price', 'list_price', 'rent', 'rental', 'monthly_rental', 'amount'],
  description: ['description', 'body', 'details', 'marketing_description', 'full_description', 'about'],
  propertyTypeSlug: ['property_type', 'type', 'category_type', 'building_type', 'dwelling_type'],
  suburb: ['suburb', 'area', 'neighbourhood', 'neighborhood', 'locality'],
  city: ['city', 'town', 'municipality', 'metro'],
  province: ['province', 'region', 'state'],
  bedrooms: ['bedrooms', 'beds', 'bedroom', 'no_of_bedrooms'],
  bathrooms: ['bathrooms', 'baths', 'bathroom', 'no_of_bathrooms'],
  parking: ['parking', 'garages', 'garage', 'parkings', 'carports', 'parking_spaces'],
  floorSizeSqm: ['floor_size', 'floorsize', 'floor_area', 'building_size', 'size'],
  erfSizeSqm: ['erf_size', 'erfsize', 'land_size', 'stand_size', 'plot_size'],
  ratesAndTaxes: ['rates', 'rates_and_taxes', 'municipal_rates'],
  levies: ['levies', 'levy', 'monthly_levy', 'body_corporate_levy'],
  isFeatured: ['featured', 'is_featured', 'highlight'],
  photos: ['images', 'image', 'photos', 'photo', 'pictures', 'picture', 'image_url', 'image_urls', 'media'],
};

const PURPOSE_SALE = new Set(['sale', 'for sale', 'forsale', 'buy', 'sell', 'for-sale', 'sold']);
const PURPOSE_RENT = new Set(['rent', 'to rent', 'torent', 'rental', 'to let', 'tolet', 'let', 'letting', 'to-rent', 'rented']);

const PROPERTY_TYPE_SYNONYMS: Record<string, string> = {
  flat: 'apartment',
  apartment: 'apartment',
  'apartment/flat': 'apartment',
  house: 'house',
  'freestanding house': 'house',
  'detached house': 'house',
  home: 'house',
  townhouse: 'townhouse',
  'town house': 'townhouse',
  cluster: 'townhouse',
  simplex: 'townhouse',
  duplex: 'townhouse',
  'vacant land': 'vacant-land',
  land: 'vacant-land',
  plot: 'vacant-land',
  stand: 'vacant-land',
  'vacant-land': 'vacant-land',
  farm: 'farm',
  smallholding: 'farm',
  'small holding': 'farm',
  agricultural: 'farm',
  commercial: 'commercial',
  industrial: 'industrial',
  warehouse: 'industrial',
  factory: 'industrial',
  office: 'office',
  offices: 'office',
  retail: 'retail',
  shop: 'retail',
  development: 'development',
  'new development': 'development',
  room: 'room-share',
  'room / share': 'room-share',
  'room-share': 'room-share',
  share: 'room-share',
};

const STATUS_SYNONYMS: Record<string, PortalListingStatus> = {
  available: 'available',
  active: 'available',
  live: 'available',
  published: 'available',
  'on show': 'available',
  draft: 'draft',
  pending: 'pending_review',
  'pending review': 'pending_review',
  pending_review: 'pending_review',
  'under offer': 'under_offer',
  under_offer: 'under_offer',
  'under-offer': 'under_offer',
  sold: 'sold',
  rented: 'rented',
  leased: 'rented',
  let: 'rented',
  archived: 'archived',
  withdrawn: 'archived',
  expired: 'archived',
  inactive: 'archived',
};

const VALID_TYPE_SLUGS = new Set<string>(portalPropertyTypeOptions.map((option) => option.slug));

export function mapRecord(raw: RawRecord, options: MapRecordOptions = {}): MappedListing {
  const aliases = options.aliases ?? DEFAULT_FIELD_ALIASES;
  const defaultStatus = options.defaultStatus ?? 'pending_review';
  const lookup = buildLookup(raw);

  const get = (field: string): RawValue | undefined => {
    for (const alias of aliases[field] ?? []) {
      const value = lookup.get(alias.toLowerCase());
      if (value !== undefined && !(typeof value === 'string' && value.trim() === '')) {
        return value;
      }
    }
    return undefined;
  };

  const title = firstString(get('title'));
  const input: Record<string, unknown> = {
    title,
    purpose: normalizePurpose(firstString(get('purpose'))),
    status: normalizeStatus(firstString(get('status')), defaultStatus),
    price: parsePrice(firstString(get('price'))),
    description: firstString(get('description')),
    suburb: firstString(get('suburb')),
    city: firstString(get('city')),
    province: firstString(get('province')),
    propertyTypeSlug: normalizePropertyType(firstString(get('propertyTypeSlug'))),
    bedrooms: parseNumber(firstString(get('bedrooms'))),
    bathrooms: parseNumber(firstString(get('bathrooms'))),
    parking: parseNumber(firstString(get('parking'))),
    floorSizeSqm: parseNumber(firstString(get('floorSizeSqm'))),
    erfSizeSqm: parseNumber(firstString(get('erfSizeSqm'))),
    ratesAndTaxes: parsePrice(firstString(get('ratesAndTaxes'))),
    levies: parsePrice(firstString(get('levies'))),
    isFeatured: parseBoolean(firstString(get('isFeatured'))),
    photos: normalizePhotos(get('photos'), title),
  };

  return {
    externalRef: firstString(get('externalRef')) || null,
    input,
    raw,
  };
}

/** Case-insensitive view of the raw record keys. */
function buildLookup(raw: RawRecord): Map<string, RawValue> {
  const map = new Map<string, RawValue>();
  for (const [key, value] of Object.entries(raw)) {
    map.set(key.toLowerCase(), value);
  }
  return map;
}

function firstString(value: RawValue | undefined): string {
  if (value === undefined) return '';
  if (Array.isArray(value)) return (value[0] ?? '').toString().trim();
  return value.trim();
}

export function normalizePurpose(value: string): string {
  const key = value.trim().toLowerCase();
  if (PURPOSE_RENT.has(key)) return 'rent';
  if (PURPOSE_SALE.has(key)) return 'sale';
  // Heuristic fallback for free-text values like "Residential For Sale".
  if (/\brent|let\b/.test(key)) return 'rent';
  if (/\bsale|buy|sell\b/.test(key)) return 'sale';
  return '';
}

export function normalizePropertyType(value: string): string {
  const key = value.trim().toLowerCase();
  if (!key) return '';
  if (VALID_TYPE_SLUGS.has(key)) return key;
  const synonym = PROPERTY_TYPE_SYNONYMS[key];
  if (synonym) return synonym;
  // Loose contains match for noisy values ("Residential House for sale").
  for (const [needle, slug] of Object.entries(PROPERTY_TYPE_SYNONYMS)) {
    if (key.includes(needle)) return slug;
  }
  return '';
}

export function normalizeStatus(value: string, fallback: PortalListingStatus): PortalListingStatus {
  const key = value.trim().toLowerCase();
  if (!key) return fallback;
  return STATUS_SYNONYMS[key] ?? fallback;
}

export function parsePrice(value: string): number | undefined {
  if (!value) return undefined;
  // Strip currency symbols, spaces, and thousands separators ("R 1 250 000").
  const cleaned = value
    .replace(/[Rr]\s*/g, '')
    .replace(/[^\d.,-]/g, '')
    .replace(/,(?=\d{3}\b)/g, '')
    .replace(/\s+/g, '');
  if (!cleaned) return undefined;
  // If a comma remains, treat it as a decimal separator.
  const normalized = cleaned.includes('.') ? cleaned.replace(/,/g, '') : cleaned.replace(',', '.');
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseNumber(value: string): number | undefined {
  if (!value) return undefined;
  const numeric = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseBoolean(value: string): boolean {
  return ['true', '1', 'yes', 'on', 'y', 'featured'].includes(value.trim().toLowerCase());
}

const PHOTO_SPLIT = /[\n|,;]+/;

function normalizePhotos(value: RawValue | undefined, title: string): { src: string; alt: string }[] {
  if (value === undefined) return [];
  const urls = Array.isArray(value) ? value : String(value).split(PHOTO_SPLIT);
  const alt = title ? `${title} photo` : 'Listing photo';
  const seen = new Set<string>();
  const photos: { src: string; alt: string }[] = [];

  for (const candidate of urls) {
    const src = candidate.toString().trim();
    if (!/^https?:\/\//i.test(src) || seen.has(src)) continue;
    seen.add(src);
    photos.push({ src, alt });
    if (photos.length >= 20) break;
  }

  return photos;
}
