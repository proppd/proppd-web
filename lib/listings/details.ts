import type { Listing } from '@/lib/demo-data';

export type ListingFact = {
  label: string;
  value: string;
};

export function getListingBySlug(listings: Listing[], slug: string): Listing | undefined {
  return listings.find((listing) => listing.slug === slug);
}

export function getListingFacts(listing: Listing): ListingFact[] {
  const facts: ListingFact[] = [
    { label: 'Property type', value: listing.type },
    { label: 'Bedrooms', value: String(listing.beds) },
    { label: 'Bathrooms', value: String(listing.baths) },
    { label: 'Parking', value: String(listing.parking) },
    { label: 'Suburb', value: listing.suburb },
    { label: 'Province', value: listing.province },
  ];

  if (listing.floorSize) facts.push({ label: 'Floor size', value: `${listing.floorSize} m²` });
  if (listing.erfSize) facts.push({ label: 'Erf size', value: `${listing.erfSize} m²` });
  if (listing.rates) facts.push({ label: 'Rates', value: listing.rates });
  if (listing.levies) facts.push({ label: 'Levies', value: listing.levies });

  return facts;
}

export function buildListingShareText(listing: Listing): string {
  return `${listing.title} in ${listing.location} — ${listing.price}. View on Proppd: /property/${listing.slug}`;
}

export function buildEnquiryMailto(listing: Listing): string {
  const subject = `Enquiry: ${listing.title}`;
  const body = [
    `Hi ${listing.agent},`,
    '',
    `I am interested in ${listing.title} (${listing.price}) on Proppd.`,
    '',
    `Listing: https://proppd.com/property/${listing.slug}`,
    '',
    'Please contact me with the next steps.',
  ].join('\n');

  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getRelatedListings(listings: Listing[], listing: Listing, limit = 2): Listing[] {
  const sameCity = listings.filter((item) => item.slug !== listing.slug && item.city === listing.city);
  const samePurpose = listings.filter((item) => item.slug !== listing.slug && item.purpose === listing.purpose && item.city !== listing.city);
  const remaining = listings.filter(
    (item) => item.slug !== listing.slug && !sameCity.includes(item) && !samePurpose.includes(item),
  );

  return [...sameCity, ...samePurpose, ...remaining].slice(0, limit);
}
