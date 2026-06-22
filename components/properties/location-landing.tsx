import { Bell, MapPin } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import type { Listing } from '@/lib/demo-data';
import { buildSavedSearchMailto } from '@/lib/listings/saved-search';
import { formatLocationListingHeadline, type CityLanding, type ResolvedLocation } from '@/lib/locations';

type LocationLandingPageProps = {
  purpose: 'sale' | 'rent';
  location: ResolvedLocation;
  listings: Listing[];
  otherCities: CityLanding[];
};

export function LocationLandingPage({ purpose, location, listings, otherCities }: LocationLandingPageProps) {
  const purposePath = purpose === 'sale' ? 'for-sale' : 'to-rent';
  const purposeLabel = purpose === 'sale' ? 'For sale' : 'To rent';
  const oppositePath = purpose === 'sale' ? 'to-rent' : 'for-sale';
  const oppositeLabel = purpose === 'sale' ? 'to rent' : 'for sale';
  const headline = formatLocationListingHeadline(listings.length, purpose, location.name);
  const canonicalPath = `/properties/${purposePath}/${location.slug}`;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Property ${purpose === 'sale' ? 'for sale' : 'to rent'} in ${location.name}`,
            url: canonicalPath,
            numberOfItems: listings.length,
            itemListElement: listings.slice(0, 12).map((listing, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: listing.title,
              url: `/property/${listing.slug}`,
            })),
          }),
        }}
      />
      <SiteHeader />

      <div className="border-b border-[#E5E7EB] bg-white px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Properties', href: '/properties' },
              { label: purposeLabel, href: `/properties/${purposePath}` },
              { label: location.name },
            ]}
          />
        </div>
      </div>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">{purposeLabel} · {location.name}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] sm:text-4xl">{headline}</h1>
              <p className="mt-2 text-sm font-semibold text-[#6B7280]">
                Verified {location.name} listings with price-first cards, quick facts, and direct agent enquiries.
              </p>
            </div>
            <a
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white"
              href={buildSavedSearchMailto(
                { purpose, query: location.name, page: 1, pageSize: 12, sort: 'featured' },
                { path: `/properties/${purposePath}`, resultCount: listings.length },
              )}
              aria-label={`Request a saved search alert for ${location.name}`}
            >
              <Bell size={15} /> <span className="text-white">Save search</span>
            </a>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
          </div>

          {listings.length === 0 && (
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-8 text-sm font-semibold text-[#6B7280]">
              No {purpose === 'sale' ? 'for-sale' : 'rental'} listings in {location.name} yet. New verified stock is added as agents list with Proppd —{' '}
              <a className="font-bold text-[#4A3AFF] hover:text-[#3A2AE0]" href={`/properties/${purposePath}`}>browse all {purposeLabel.toLowerCase()} listings</a>{' '}
              or <a className="font-bold text-[#4A3AFF] hover:text-[#3A2AE0]" href="/request-valuation">request a valuation</a>.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid gap-5 lg:grid-cols-3">
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Keep exploring {location.name}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">More ways to search</h2>
            <div className="mt-5 grid gap-3">
              <LocationLink href={`/properties/${oppositePath}/${location.slug}`}>
                Property {oppositeLabel} in {location.name}
              </LocationLink>
              <LocationLink href={`/estate-agents/${location.slug}`}>
                Estate agents in {location.name}
              </LocationLink>
              <LocationLink href={`/properties/${purposePath}`}>
                All {purposeLabel.toLowerCase()} listings
              </LocationLink>
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Popular areas</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Property {purpose === 'sale' ? 'for sale' : 'to rent'} nearby</h2>
            <div className="mt-5 grid gap-3">
              {otherCities.map((city) => (
                <LocationLink key={city.slug} href={`/properties/${purposePath}/${city.slug}`}>
                  Property {purpose === 'sale' ? 'for sale' : 'to rent'} in {city.name}
                </LocationLink>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Selling in {location.name}?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">List with verified Proppd agents.</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/72">
              Get a valuation and connect with agents who know the {location.name} market — real listings, verified enquiries, no fake leads.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]" href="/request-valuation">Request valuation</a>
              <a className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-white" href="/list-with-us">List with us</a>
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function LocationLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
    >
      <MapPin size={16} className="shrink-0 text-[#4A3AFF]" /> {children}
    </a>
  );
}
