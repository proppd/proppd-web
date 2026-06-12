import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocationLandingPage } from '@/components/properties/location-landing';
import { listings as demoListings } from '@/lib/demo-data';
import { applyListingFilters, parseListingFilters } from '@/lib/listings/filters';
import { buildCityLandingLinks, filterListingsByLocation, resolveLocationSlug } from '@/lib/locations';
import { loadPortalListings } from '../../../../lib/proppd/backend';

type Params = Promise<{ location: string }>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { location: slug } = await params;
  const location = resolveLocationSlug(demoListings, slug);
  if (!location) return { title: 'Location not found' };

  const title = `Property to rent in ${location.name}`;
  const description = `Browse verified rental homes and apartments in ${location.name} on Proppd. Real listings, direct agent enquiries, no fake leads.`;
  const canonical = `/properties/to-rent/${location.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Proppd`,
      description,
      url: canonical,
      siteName: 'Proppd',
      type: 'website',
      images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Proppd`,
      description,
      images: ['/proppd-logo-horizontal.png'],
    },
  };
}

export default async function ToRentLocationPage({ params }: { params: Params }) {
  const { location: slug } = await params;
  const portalListings = (await loadPortalListings()).items;
  const location = resolveLocationSlug(portalListings, slug) ?? resolveLocationSlug(demoListings, slug);
  if (!location) notFound();

  const filters = parseListingFilters(new URLSearchParams({ purpose: 'rent' }));
  const rentalListings = applyListingFilters(filterListingsByLocation(portalListings, location), filters);
  const otherCities = buildCityLandingLinks(portalListings, location.slug);

  return <LocationLandingPage purpose="rent" location={location} listings={rentalListings} otherCities={otherCities} />;
}
