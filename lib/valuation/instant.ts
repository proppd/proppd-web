import type { Listing } from '@/lib/demo-data';

export type InstantValuationPurpose = 'sale' | 'rent';
export type InstantValuationConfidence = 'high' | 'medium' | 'low';

export type InstantValuationInput = {
  suburb: string;
  city: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  floorSize?: number;
  purpose?: InstantValuationPurpose;
};

export type ValuationComparable = {
  slug: string;
  title: string;
  suburb: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  priceValue: number;
  price: string;
  agency: string;
  agent: string;
  similarityScore: number;
};

export type InstantValuationResult = {
  status: 'estimate' | 'needs_agent';
  purpose: InstantValuationPurpose;
  label: string;
  lowValue: number;
  midValue: number;
  highValue: number;
  confidence: InstantValuationConfidence;
  reason: string;
  inputs: Required<Pick<InstantValuationInput, 'suburb' | 'city' | 'propertyType'>> & {
    bedrooms?: number;
    bathrooms?: number;
    floorSize?: number;
  };
  comparables: ValuationComparable[];
};

const MAX_COMPARABLES = 6;
const MIN_COMPARABLES_FOR_RANGE = 2;

export function estimateInstantValuation(input: InstantValuationInput, listings: Listing[]): InstantValuationResult {
  const purpose = input.purpose ?? 'sale';
  const usableListings = listings
    .filter((listing) => listing.isActive !== false)
    .filter((listing) => listing.priceValue > 0)
    .filter((listing) => matchesPurpose(listing, purpose));

  const scored = usableListings
    .map((listing) => ({ listing, score: scoreListing(input, listing) }))
    .filter((entry) => entry.score >= 45)
    .sort((left, right) => right.score - left.score || Math.abs(left.listing.priceValue - right.listing.priceValue));
  const compatibleType = scored.filter((entry) => isCompatiblePropertyType(input.propertyType, entry.listing.type));
  const comparablePool = compatibleType.length >= MIN_COMPARABLES_FOR_RANGE ? compatibleType : scored;

  const comparables = comparablePool.slice(0, MAX_COMPARABLES).map(({ listing, score }) => toComparable(listing, score));

  if (comparables.length < MIN_COMPARABLES_FOR_RANGE) {
    return {
      status: 'needs_agent',
      purpose,
      label: purpose === 'rent' ? 'Agent rental appraisal recommended' : 'Agent appraisal recommended',
      lowValue: 0,
      midValue: 0,
      highValue: 0,
      confidence: 'low',
      reason: `There are not enough comparable listings for ${cleanPlace(input.suburb, input.city)} yet, so Proppd should route this to a local agent for a responsible market opinion.`,
      inputs: normaliseInputs(input),
      comparables: [],
    };
  }

  const prices = comparables.map((comparable) => comparable.priceValue).sort((left, right) => left - right);
  const midValue = Math.round(median(prices));
  const spread = comparables.length >= 5 ? 0.09 : comparables.length >= 3 ? 0.12 : 0.16;
  const lowValue = roundToMarket(midValue * (1 - spread), purpose);
  const highValue = roundToMarket(midValue * (1 + spread), purpose);
  const confidence = comparables.length >= 5 ? 'high' : comparables.length >= 3 ? 'medium' : 'low';
  const purposeLabel = purpose === 'rent' ? 'rental listings' : 'sale listings';

  return {
    status: 'estimate',
    purpose,
    label: purpose === 'rent' ? 'Estimated monthly rental range' : 'Estimated market value range',
    lowValue,
    midValue: roundToMarket(midValue, purpose),
    highValue,
    confidence,
    reason: `Based on ${comparables.length} comparable ${purposeLabel} around ${cleanPlace(input.suburb, input.city)}, weighted by suburb, property type and bedroom match.`,
    inputs: normaliseInputs(input),
    comparables,
  };
}

export function formatValuationAmount(value: number, purpose: InstantValuationPurpose): string {
  if (!value) return 'Agent review';
  const formatted = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }).format(value);
  return purpose === 'rent' ? `R ${formatted} pm` : `R ${formatted}`;
}

function matchesPurpose(listing: Listing, purpose: InstantValuationPurpose): boolean {
  return purpose === 'rent' ? listing.purpose === 'To rent' : listing.purpose === 'For sale';
}

function scoreListing(input: InstantValuationInput, listing: Listing): number {
  let score = 0;
  const suburb = normalise(input.suburb);
  const city = normalise(input.city);
  const propertyType = normalise(input.propertyType);

  if (suburb && normalise(listing.suburb) === suburb) score += 45;
  else if (city && normalise(listing.city) === city) score += 24;
  else return 0;

  if (propertyType && normalise(listing.type) === propertyType) score += 25;
  else if (propertyType && (normalise(listing.type).includes(propertyType) || propertyType.includes(normalise(listing.type)))) score += 12;

  if (typeof input.bedrooms === 'number' && Number.isFinite(input.bedrooms)) {
    const bedroomDelta = Math.abs(listing.beds - input.bedrooms);
    if (bedroomDelta === 0) score += 20;
    else if (bedroomDelta === 1) score += 10;
  }

  if (typeof input.bathrooms === 'number' && Number.isFinite(input.bathrooms)) {
    const bathroomDelta = Math.abs(listing.baths - input.bathrooms);
    if (bathroomDelta === 0) score += 6;
    else if (bathroomDelta === 1) score += 3;
  }

  if (typeof input.floorSize === 'number' && Number.isFinite(input.floorSize) && listing.floorSize) {
    const sizeDelta = Math.abs(listing.floorSize - input.floorSize) / input.floorSize;
    if (sizeDelta <= 0.15) score += 8;
    else if (sizeDelta <= 0.3) score += 4;
  }

  return score;
}

function isCompatiblePropertyType(requested: string, actual: string): boolean {
  const requestedType = normalise(requested);
  const actualType = normalise(actual);
  if (!requestedType || !actualType) return true;
  if (requestedType === actualType) return true;

  const landed = ['house', 'townhouse', 'cluster', 'duplex', 'villa'];
  const sectional = ['apartment', 'flat', 'loft', 'penthouse'];

  if (landed.includes(requestedType)) return landed.includes(actualType);
  if (sectional.includes(requestedType)) return sectional.includes(actualType);
  return actualType.includes(requestedType) || requestedType.includes(actualType);
}

function toComparable(listing: Listing, score: number): ValuationComparable {
  return {
    slug: listing.slug,
    title: listing.title,
    suburb: listing.suburb,
    city: listing.city,
    propertyType: listing.type,
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    priceValue: listing.priceValue,
    price: listing.price,
    agency: listing.agency,
    agent: listing.agent,
    similarityScore: score,
  };
}

function median(values: number[]): number {
  const middle = Math.floor(values.length / 2);
  if (values.length % 2 === 1) return values[middle];
  return (values[middle - 1] + values[middle]) / 2;
}

function roundToMarket(value: number, purpose: InstantValuationPurpose): number {
  const step = purpose === 'rent' ? 500 : 50000;
  return Math.round(value / step) * step;
}

function cleanPlace(suburb: string, city: string): string {
  return [suburb.trim(), city.trim()].filter(Boolean).join(', ') || 'this market';
}

function normaliseInputs(input: InstantValuationInput): InstantValuationResult['inputs'] {
  return {
    suburb: input.suburb.trim(),
    city: input.city.trim(),
    propertyType: input.propertyType.trim(),
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    floorSize: input.floorSize,
  };
}

function normalise(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}
