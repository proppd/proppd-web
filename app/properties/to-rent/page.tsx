import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Bell, Home, Search, ShieldCheck, X } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';
import { applyListingFilters, parseListingFilters } from '@/lib/listings/filters';
import { buildSavedSearchMailto } from '@/lib/listings/saved-search';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'To rent',
  description: 'Browse verified rental homes on Proppd with monthly pricing, filters, and saved-search alerts.',
  alternates: { canonical: '/properties/to-rent' },
  openGraph: {
    title: 'To rent | Proppd',
    description: 'Browse verified rental homes on Proppd with monthly pricing, filters, and saved-search alerts.',
    url: '/properties/to-rent',
    siteName: 'Proppd',
    type: 'website',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'To rent | Proppd',
    description: 'Browse verified rental homes on Proppd with monthly pricing, filters, and saved-search alerts.',
    images: ['/proppd-logo-horizontal.png'],
  },
};

export default async function ToRentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseListingFilters(toURLSearchParams({ ...params, purpose: 'rent' }));
  const rentListings = applyListingFilters(listings, filters);
  const areaWatchlist = buildAreaWatchlist(rentListings);
  const resultLabel = rentListings.length === 1 ? 'rental home' : 'rental homes';
  const headline = `${rentListings.length} ${resultLabel} ${filters.query ? `matching “${filters.query}”` : 'in South Africa'}`;

  return (
    <main className="proppd-page">
      <SiteHeader />
      <section className="border-b border-[#E5E7EB] bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <form action="/properties/to-rent" className="grid gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm xl:grid-cols-[1.6fr_1fr_1fr_auto] xl:items-end">
            <label className="flex min-h-14 items-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#9CA3AF] focus-within:border-[#4A3AFF] focus-within:ring-4 focus-within:ring-[#4A3AFF]/10">
              <Search size={21} className="text-[#4A3AFF]" />
              <input
                name="q"
                type="search"
                defaultValue={filters.query ?? ''}
                className="min-w-0 flex-1 bg-transparent font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
                placeholder="Search rentals by suburb, city, agent, or listing ID"
                aria-label="Search homes to rent"
              />
            </label>

            <SelectField label="Sort" name="sort" defaultValue={filters.sort}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </SelectField>

            <SelectField label="Property type" name="propertyType" defaultValue={filters.propertyType ?? ''}>
              <option value="">Any type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Duplex">Duplex</option>
            </SelectField>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <SelectField label="Beds" name="bedrooms" defaultValue={filters.bedrooms ? String(filters.bedrooms) : ''} compact>
                <option value="">Any beds</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </SelectField>
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4A3AFF] px-5 text-sm font-bold text-white shadow-lg shadow-[#4A3AFF]/20 transition hover:bg-[#2f3fd6]" type="submit">
                Search
              </button>
              <a className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF]" href="/properties/to-rent">
                Clear
              </a>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-[#1A1A2E]">
            {filters.query ? <FilterChip href={buildToRentHref(params, { q: null })}>Search: “{filters.query}” <X size={14} /></FilterChip> : null}
            {filters.propertyType ? <FilterChip href={buildToRentHref(params, { propertyType: null })}>Type: {filters.propertyType} <X size={14} /></FilterChip> : null}
            {filters.bedrooms ? <FilterChip href={buildToRentHref(params, { bedrooms: null })}>Beds: {filters.bedrooms}+ <X size={14} /></FilterChip> : null}
            {filters.sort !== 'featured' ? <FilterChip href={buildToRentHref(params, { sort: 'featured' })}>Sort: {filters.sort.replace('-', ' ')} <X size={14} /></FilterChip> : null}
            {(filters.query || filters.propertyType || filters.bedrooms || filters.sort !== 'featured') ? (
              <a className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-[#9CA3AF] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties/to-rent">
                Clear all
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">To rent</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] sm:text-4xl">{headline}</h1>
              <p className="mt-2 text-sm font-semibold text-[#6B7280]">{filters.query ? 'Filtered across listing facts, areas, agents, and agencies.' : 'Rental cards with clear monthly pricing, verified routing, and POPIA-friendly enquiries.'}</p>
            </div>
            <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white" href={buildSavedSearchMailto(filters, { path: '/properties/to-rent', resultCount: rentListings.length })} aria-label="Request a saved rental search alert">
              <Bell size={15} /> <span className="text-white">Save search</span>
            </a>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rentListings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
          </div>

          {rentListings.length === 0 && (
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-8 text-sm font-semibold text-[#6B7280]">
              No rental listings match that search yet. Try a wider suburb, city, agent, or feature.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Rental support</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Need a narrower rental brief?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Save a search request and send the details straight to Proppd so we can keep matching you with verified homes to rent.
              </p>
            </div>
            <div className="rounded-lg bg-[#F7F8FA] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A2E]"><ShieldCheck size={16} className="text-[#4A3AFF]" /> Verified routing and POPIA-friendly enquiry handling</div>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">Start with the current filters, then refine by suburb, price band, and property type.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Top rental areas</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">{areaWatchlist.length} active rental pockets</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">Current results are concentrated in a few rental-friendly suburbs, so we surface the strongest pockets first.</p>
              <div className="mt-5 grid gap-3">
                {areaWatchlist.length > 0 ? areaWatchlist.map((area) => (
                  <a key={area.label} href={buildToRentHref(params, { q: area.label })} className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                    <span>{area.label}</span>
                    <span className="text-xs font-bold text-[#9CA3AF]">{area.count} listing{area.count === 1 ? '' : 's'}</span>
                  </a>
                )) : (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-semibold text-[#6B7280]">
                    No area summary yet for these filters.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-sm lg:col-span-1">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Search playbook</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Refine without losing the good rentals.</h2>
              <ul className="mt-5 space-y-3 text-sm font-semibold leading-6 text-white/72">
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">Search by suburb, city, agent, school, or listing ID.</li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">Use beds, type, and sort to keep the shortlist honest.</li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">Save the search so strong matches can be sent with the right context.</li>
              </ul>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-[#EFF6FF] p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Need a shortlist?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#2563EB]">Turn the current rental set into a clean handoff.</h2>
              <p className="mt-4 text-sm font-bold leading-6 text-[#2563EB]">Save the search, then email it to a tenant or co-buyer with the filters already captured.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a className="rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white" href={buildSavedSearchMailto(filters, { path: '/properties/to-rent', resultCount: rentListings.length })}>Save search email</a>
                <a className="rounded-full border border-[#BFDBFE] px-5 py-3 text-sm font-bold text-[#2563EB]" href="/agents">Browse agents</a>
              </div>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SelectField({ label, name, defaultValue, children, compact = false }: { label: string; name: string; defaultValue?: string; children: ReactNode; compact?: boolean }) {
  return (
    <label className={`block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF] ${compact ? 'w-full sm:w-auto' : ''}`}>
      {label}
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className={`mt-2 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none transition focus:border-[#4A3AFF] focus:ring-4 focus:ring-[#4A3AFF]/10 ${compact ? 'sm:min-w-[9rem]' : ''}`}
      >
        {children}
      </select>
    </label>
  );
}

function FilterChip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="inline-flex items-center gap-2 rounded-full border border-[#4A3AFF]/20 bg-[#4A3AFF]/8 px-3 py-2 text-[#4A3AFF] transition hover:border-[#4A3AFF] hover:bg-[#4A3AFF]/12" href={href}>
      {children}
    </a>
  );
}

function buildToRentHref(params: Record<string, string | string[] | undefined>, updates: Record<string, string | number | null | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) searchParams.append(key, item);
    } else if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  searchParams.set('purpose', 'rent');

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `/properties/to-rent?${query}` : '/properties/to-rent';
}

function toURLSearchParams(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) searchParams.append(key, item);
    } else if (value !== undefined) {
      searchParams.set(key, value);
    }
  }
  return searchParams;
}

function buildAreaWatchlist(listings: Array<{ location: string }>) {
  const areas = new Map<string, number>();

  for (const listing of listings) {
    const area = listing.location.split(',')[0]?.trim() || listing.location;
    areas.set(area, (areas.get(area) ?? 0) + 1);
  }

  return [...areas.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 3);
}
