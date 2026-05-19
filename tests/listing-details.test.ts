import { describe, expect, it } from 'vitest';
import { listings } from '@/lib/demo-data';
import { buildEnquiryMailto, buildListingShareText, getListingBySlug, getListingFacts, getRelatedListings } from '@/lib/listings/details';

describe('listing detail helpers', () => {
  it('finds listings by slug', () => {
    const listing = getListingBySlug(listings, 'sea-point-apartment-with-parking-20401');
    expect(listing?.agent).toBe('Mia Jacobs');
  });

  it('keeps listing IDs aligned with Supabase seed UUIDs for lead writes', () => {
    expect(listings.map((listing) => listing.id)).toEqual([
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
    ]);
  });

  it('keeps demo listings backed by accessible gallery photos', () => {
    for (const listing of listings) {
      expect(listing.photos.length).toBeGreaterThanOrEqual(3);
      expect(listing.photos[0]?.src).toContain('images.unsplash.com');
      expect(listing.photos.every((photo) => photo.alt.length > 12)).toBe(true);
    }
  });

  it('builds display facts without empty optional rows', () => {
    const rental = listings.find((listing) => listing.slug === 'sea-point-apartment-with-parking-20401');
    expect(rental).toBeDefined();

    const facts = getListingFacts(rental!);
    expect(facts).toContainEqual({ label: 'Floor size', value: '82 m²' });
    expect(facts).not.toContainEqual({ label: 'Erf size', value: expect.any(String) });
  });

  it('creates encoded POPIA-ready enquiry mailto links', () => {
    const listing = listings[0];
    const mailto = buildEnquiryMailto(listing);

    expect(mailto).toContain('mailto:info@proppd.com');
    expect(mailto).toContain(encodeURIComponent(`Enquiry: ${listing.title}`));
    expect(mailto).toContain(encodeURIComponent(`https://proppd.com/property/${listing.slug}`));
  });

  it('creates compact share text and excludes the current listing from related listings', () => {
    const listing = listings[0];

    expect(buildListingShareText(listing)).toContain(`/property/${listing.slug}`);
    expect(getRelatedListings(listings, listing).map((item) => item.slug)).not.toContain(listing.slug);
  });
});
