import { NextResponse, type NextRequest } from 'next/server';
import { loadPortalListings } from '@/lib/proppd/backend';
import { estimateInstantValuation, type InstantValuationInput } from '@/lib/valuation/instant';

export const runtime = 'nodejs';

type EstimateRequestBody = Partial<InstantValuationInput>;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EstimateRequestBody;
  const input = parseInput(body);

  if (!input) {
    return NextResponse.json(
      { ok: false, error: 'Enter a suburb, city, property type, and at least one bedroom to get an instant estimate.' },
      { status: 400 },
    );
  }

  const listings = await loadPortalListings();
  const estimate = estimateInstantValuation(input, listings.items);

  return NextResponse.json({
    ok: true,
    source: listings.source,
    estimate,
  });
}

function parseInput(body: EstimateRequestBody): InstantValuationInput | null {
  const suburb = stringValue(body.suburb);
  const city = stringValue(body.city);
  const propertyType = stringValue(body.propertyType);
  const bedrooms = numberValue(body.bedrooms);
  const bathrooms = numberValue(body.bathrooms);
  const floorSize = numberValue(body.floorSize);
  const purpose = body.purpose === 'rent' ? 'rent' : 'sale';

  if (!suburb || !city || !propertyType || !bedrooms) return null;

  return {
    suburb,
    city,
    propertyType,
    bedrooms,
    bathrooms,
    floorSize,
    purpose,
  };
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
