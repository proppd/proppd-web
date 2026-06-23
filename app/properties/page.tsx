import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Bell, ChevronLeft, ChevronRight, Map as MapIcon, MapPin, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { SearchAutocomplete } from '@/components/search/search-autocomplete';
import { ListingCard } from '@/components/properties/listing-card';
import { PropertyMap } from '@/components/properties/property-map';
import { SavedHomesBanner } from '@/components/properties/saved-homes-banner';
import { SavedSearchAlerts } from '@/components/properties/saved-search-alerts';
import { SaveSearchButton } from '@/components/properties/save-search-button';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalListings } from '../../lib/proppd/backend';
import { applyListingFilters, paginateListings, parseListingFilters } from '@/lib/listings/filters';
import { buildSavedSearchMailto, buildSavedSearchPath, savedSearchName } from '@/lib/listings/saved-search';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse verified Proppd property listings across South Africa with saved search and location-first filters.',
  alternates: { canonical: '/properties' },
  openGraph: {
    title: 'Properties | Proppd',
    description: 'Browse verified Proppd property listings across South Africa with saved search and location-first filters.',
    url: '/properties',
    siteName: 'Proppd',
    type: 'website',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Properties | Proppd',
    description: 'Browse verified Proppd property listings across South Africa with saved search and location-first filters.',
    images: ['/proppd-logo-horizontal.png'],
  },
};

export const dynamic = 'force-dynamic';

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseListingFilters(toURLSearchParams(params));
  const portalListings = (await loadPortalListings()).items;
  const filtered = applyListingFilters(portalListings, filters);
  const hasActiveSearch = Object.values(params).some((value) => value !== undefined && value !== null && value !== '');
  const savedSearchUrl = buildSavedSearchPath(filters, '/properties');
  const savedSearchQuery = savedSearchUrl.includes('?') ? savedSearchUrl.slice(savedSearchUrl.indexOf('?') + 1) : '';
  const savedSearchLabel = savedSearchName(filters, '/properties');
  const visibleListings = filtered.length > 0 || hasActiveSearch ? filtered : portalListings;
  const paginated = paginateListings(visibleListings, filters.page, filters.pageSize);
  const areaWatchlist = buildAreaWatchlist(visibleListings);
  const marketSnapshot = buildMarketSnapshot(visibleListings);
  const resultMix = buildResultMix(visibleListings);
  const mapPreview = buildMapPreview(areaWatchlist, visibleListings.length);
  const hasListings = visibleListings.length > 0;

  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="border-b border-[#E5E7EB] bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <form action="/properties" className="flex flex-wrap items-end gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm sm:p-4">
            <label className="flex min-h-12 min-w-[14rem] flex-1 items-center gap-3 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-[#9CA3AF] focus-within:border-[#4A3AFF] focus-within:ring-4 focus-within:ring-[#4A3AFF]/10 sm:min-h-14 sm:px-5">
              <SearchAutocomplete
                name="q"
                defaultValue={filters.query ?? ''}
                placeholder="Search suburb or city"
              />
            </label>

            <SelectField label="Purpose" name="purpose" defaultValue={filters.purpose} compact>
              <option value="all">For sale & rent</option>
              <option value="sale">For sale</option>
              <option value="rent">To rent</option>
            </SelectField>

            <SelectField label="Home type" name="propertyType" defaultValue={filters.propertyType ?? ''} compact>
              <option value="">Any type</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Duplex">Duplex</option>
              <option value="Flat">Flat</option>
              <option value="Cluster">Cluster</option>
              <option value="Vacant land">Vacant land</option>
            </SelectField>

            <PriceField label="Min price" name="minPrice" defaultValue={filters.minPrice} />
            <PriceField label="Max price" name="maxPrice" defaultValue={filters.maxPrice} />

            <SelectField label="Beds" name="bedrooms" defaultValue={filters.bedrooms ? String(filters.bedrooms) : ''} compact>
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </SelectField>

            <SelectField label="Baths" name="bathrooms" defaultValue={filters.bathrooms ? String(filters.bathrooms) : ''} compact>
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </SelectField>

            <SelectField label="Parking" name="parking" defaultValue={filters.parking ? String(filters.parking) : ''} compact>
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </SelectField>

            <SelectField label="Sort" name="sort" defaultValue={filters.sort} compact>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </SelectField>

            <div className="flex gap-2">
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4A3AFF] px-5 text-sm font-bold text-white shadow-lg shadow-[#4A3AFF]/20 transition hover:bg-[#2f3fd6]" type="submit">
                Search
              </button>
              <a className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF]" href="/properties">
                Clear
              </a>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-[#1A1A2E]">
            {filters.query ? <FilterChip href={buildPropertiesHref(params, { q: null })}>Search: “{filters.query}” <X size={14} /></FilterChip> : null}
            {filters.location ? <FilterChip href={buildPropertiesHref(params, { location: null })}>Location: {filters.location} <X size={14} /></FilterChip> : null}
            {filters.agency ? <FilterChip href={buildPropertiesHref(params, { agency: null })}>Agency: {filters.agency} <X size={14} /></FilterChip> : null}
            {filters.agent ? <FilterChip href={buildPropertiesHref(params, { agent: null })}>Agent: {filters.agent} <X size={14} /></FilterChip> : null}
            {filters.purpose !== 'all' ? <FilterChip href={buildPropertiesHref(params, { purpose: 'all' })}>Purpose: {filters.purpose === 'sale' ? 'For sale' : 'To rent'} <X size={14} /></FilterChip> : null}
            {filters.propertyType ? <FilterChip href={buildPropertiesHref(params, { propertyType: null })}>Type: {filters.propertyType} <X size={14} /></FilterChip> : null}
            {filters.minPrice !== undefined ? <FilterChip href={buildPropertiesHref(params, { minPrice: null })}>Min: R{filters.minPrice.toLocaleString('en-ZA')} <X size={14} /></FilterChip> : null}
            {filters.maxPrice !== undefined ? <FilterChip href={buildPropertiesHref(params, { maxPrice: null })}>Max: R{filters.maxPrice.toLocaleString('en-ZA')} <X size={14} /></FilterChip> : null}
            {filters.bedrooms ? <FilterChip href={buildPropertiesHref(params, { bedrooms: null })}>Beds: {filters.bedrooms}+ <X size={14} /></FilterChip> : null}
            {filters.bathrooms ? <FilterChip href={buildPropertiesHref(params, { bathrooms: null })}>Baths: {filters.bathrooms}+ <X size={14} /></FilterChip> : null}
            {filters.parking ? <FilterChip href={buildPropertiesHref(params, { parking: null })}>Parking: {filters.parking}+ <X size={14} /></FilterChip> : null}
            {filters.status ? <FilterChip href={buildPropertiesHref(params, { status: null })}>Status: {filters.status} <X size={14} /></FilterChip> : null}
            {filters.sort !== 'featured' ? <FilterChip href={buildPropertiesHref(params, { sort: 'featured' })}>Sort: {filters.sort.replace('-', ' ')} <X size={14} /></FilterChip> : null}
            {(filters.query || filters.location || filters.agency || filters.agent || filters.purpose !== 'all' || filters.propertyType || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.bedrooms || filters.bathrooms || filters.parking || filters.status || filters.sort !== 'featured') ? (
              <a className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-[#9CA3AF] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties">
                Clear all
              </a>
            ) : null}
          </div>
          {hasActiveSearch ? (
            <div className="mt-3">
              <SaveSearchButton label={savedSearchLabel} path="/properties" queryString={savedSearchQuery} />
            </div>
          ) : null}
          <SavedHomesBanner />
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#1A1A2E] sm:text-2xl">
                    {`${visibleListings.length} ${visibleListings.length === 1 ? 'home' : 'homes'} ${searchScopeLabel(filters)}`}
                  </h1>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">
                    {filters.query ? `Matching “${filters.query}” across listing facts, areas, agents, and agencies.` : 'Verified homes with agent routing.'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {paginated.totalPages > 1 ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-slate-50 px-4 py-2 text-sm font-bold text-[#1A1A2E]">
                      Page {paginated.page} of {paginated.totalPages}
                    </div>
                  ) : null}
                  <a className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#4A3AFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3A2AE0]" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: visibleListings.length })} aria-label="Request a saved property search alert">
                    <Bell size={15} /> <span className="text-white">Save search</span>
                  </a>
                </div>
              </div>
            </div>

            {hasListings ? (
              <div className="mt-4 rounded-[1.25rem] border border-[#BFDBFE] bg-[#EFF6FF] p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#DBEAFE] text-[#1A1A2E]"><ShieldCheck size={18} /></div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.16em] text-[#2563EB]">Verified on Proppd</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-[#2563EB]">Each visible listing includes an agency name, mandate context, and a clear enquiry route before you send personal details.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold text-[#1A1A2E]">
                    <span className="rounded-full bg-white px-3 py-2 shadow-sm">Agency named</span>
                    <span className="rounded-full bg-white px-3 py-2 shadow-sm">Mandate shown</span>
                    <span className="rounded-full bg-white px-3 py-2 shadow-sm">Enquiry route checked</span>
                  </div>
                </div>
              </div>
            ) : null}

            {hasListings ? (
              <div className="mt-4 mb-4">
                <PropertyMap
                  properties={paginated.items.map((l) => ({
                    slug: l.slug,
                    title: l.title,
                    price: l.price,
                    priceValue: l.priceValue,
                    location: l.location,
                    beds: l.beds,
                    baths: l.baths,
                    parking: l.parking,
                    type: l.type,
                    purpose: l.purpose,
                    photo: l.photos[0]?.src ?? '',
                    lat: l.lat,
                    lng: l.lng,
                  }))}
                />
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {paginated.items.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
            {paginated.items.length === 0 && <EmptyResults filters={filters} params={params} />}

            {paginated.totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-[#6B7280]">
                  Showing page {paginated.page} of {paginated.totalPages} · {visibleListings.length} total matches
                </p>
                <div className="flex flex-wrap gap-2">
                  <PaginationLink href={buildPropertiesHref(params, { page: Math.max(1, paginated.page - 1) })} disabled={paginated.page <= 1}>
                    <ChevronLeft size={15} /> Prev
                  </PaginationLink>
                  {visiblePages(paginated.page, paginated.totalPages).map((page) => (
                    <PaginationLink key={page} href={buildPropertiesHref(params, { page })} active={page === paginated.page}>
                      {page}
                    </PaginationLink>
                  ))}
                  <PaginationLink href={buildPropertiesHref(params, { page: Math.min(paginated.totalPages, paginated.page + 1) })} disabled={paginated.page >= paginated.totalPages}>
                    Next <ChevronRight size={15} />
                  </PaginationLink>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
              <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,214,197,.55),transparent_14rem),radial-gradient(circle_at_72%_35%,rgba(59,73,255,.45),transparent_15rem),linear-gradient(135deg,#edf7ff,#f8fbff_45%,#e7fbf8)] p-5">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#1A1A2E_1px,transparent_1px),linear-gradient(90deg,#1A1A2E_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="relative grid gap-4">
                  <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#4A3AFF] text-white"><MapPin size={18} /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Area watch</p>
                        <p className="font-bold">{visibleListings.length} live {visibleListings.length === 1 ? 'home' : 'homes'} {searchScopeLabel(filters)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#6B7280]">Use the filters above to narrow the market, then open a listing to start the enquiry flow.</p>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/92 p-4 shadow-xl backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Map preview</p>
                        <h2 className="mt-1 text-lg font-bold tracking-[-.03em] text-[#1A1A2E]">See where the result set clusters.</h2>
                      </div>
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#DBEAFE] text-[#2563EB]"><MapIcon size={18} /></div>
                    </div>
                    <div className="relative mt-4 h-56 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[radial-gradient(circle_at_24%_24%,rgba(59,73,255,.22),transparent_8rem),radial-gradient(circle_at_78%_68%,rgba(18,214,197,.28),transparent_9rem),linear-gradient(135deg,#f8fbff,#EFF6FF)]">
                      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(#1A1A2E_1px,transparent_1px),linear-gradient(90deg,#1A1A2E_1px,transparent_1px)] [background-size:32px_32px]" />
                      <div className="absolute left-4 top-4 rounded-full border border-[#E5E7EB] bg-white/90 px-3 py-1 text-xs font-bold text-[#1A1A2E] shadow-sm">{mapPreview.summary}</div>
                      {mapPreview.pins.length > 0 ? (
                        mapPreview.pins.map((pin, index) => (
                          <a
                            key={pin.label}
                            href={buildPropertiesHref(params, { location: pin.label, q: null, page: null })}
 className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4A3AFF] px-3 py-2 text-xs font-bold text-white shadow-lg shadow-slate-900/20 ring-4 ring-white/80 transition hover:bg-[#4A3AFF]"
                            style={getMapPinPosition(index)}
                            aria-label={`View homes around ${pin.label}`}
                          >
                            {pin.label} · {pin.count}
                          </a>
                        ))
                      ) : (
                        <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/90 p-4 text-sm font-bold leading-6 text-[#6B7280] shadow-sm">
                          Widen the search to rebuild the location preview.
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">Use this as a quick area guide, then open a listing for the full agent route and property facts.</p>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/88 p-4 shadow-xl backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Top areas</p>
                    <div className="mt-3 grid gap-3">
                      {areaWatchlist.length > 0 ? (
                        areaWatchlist.map((area) => (
                          <a
                            key={area.label}
                            href={buildPropertiesHref(params, { location: area.label, q: null, page: null })}
                            className="group flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
                            aria-label={`View ${area.label} homes`}
                          >
                            <span>View {area.label} homes</span>
                            <span className="rounded-full bg-[#4A3AFF]/10 px-2.5 py-1 text-xs font-bold text-[#4A3AFF] transition group-hover:bg-[#4A3AFF] group-hover:text-white">{area.count} match{area.count === 1 ? '' : 'es'} ›</span>
                          </a>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#6B7280]">
                          No area summary yet. Clear the location filter or browse all homes to reopen the market.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl proppd-panel p-4 shadow-2xl">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Search shortcut</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/72">Save this search, or narrow by purpose to make the result list more focused.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#1A1A2E]" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: visibleListings.length })}>Save search</a>
                      <a className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white" href="/request-valuation">Request valuation</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Saved search alerts - mobile/tablet */}
          <div className="mt-4 lg:hidden">
            <SavedSearchAlerts searchParams={{
              q: filters.query ?? undefined,
              location: filters.location ?? undefined,
              purpose: filters.purpose !== 'all' ? filters.purpose : undefined,
              bedrooms: filters.bedrooms ? String(filters.bedrooms) : undefined,
            }} />
          </div>
        </div>
      </section>

      {hasListings ? (
        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Market snapshot</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">{marketSnapshot.hasListings ? 'Price range in this result set.' : 'No price data to summarize yet.'}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{marketSnapshot.hasListings ? 'This view gives a faster read than the suburb list by showing the average asking price and the overall market spread.' : 'Once matching homes are live, this panel will show the average asking price, price band, and market spread for the filtered search.'}</p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Average asking</p>
                    <p className="mt-1 text-2xl font-bold tracking-[-.04em] text-[#1A1A2E]">{marketSnapshot.average}</p>
                    <p className="mt-1 text-sm font-semibold text-[#6B7280]">Across the current filtered listings</p>
                  </div>
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Price band</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1A2E]">{marketSnapshot.hasListings ? `${marketSnapshot.low} → ${marketSnapshot.high}` : 'No active price band yet'}</p>
                    <p className="mt-1 text-sm font-semibold text-[#6B7280]">{marketSnapshot.hasListings ? 'From the lowest to the highest asking price' : 'Widen the search or save it for the next matching listing'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Geography</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1A2E]">{marketSnapshot.cityLabel} · {marketSnapshot.provinceLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-[#6B7280]">{marketSnapshot.hasListings ? 'A quick sense of how broad the set is' : 'No geographic spread in the current filtered set'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl proppd-panel p-6 shadow-sm lg:col-span-1">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Result mix</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">What this result set is made of.</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/72">A quick read on the current market split helps you decide whether to tighten by purpose, type, or location.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">For sale</p>
                    <p className="mt-2 text-3xl font-bold">{resultMix.saleCount}</p>
                    <p className="mt-1 text-sm font-semibold text-white/65">Homes in the current set</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">To rent</p>
                    <p className="mt-2 text-3xl font-bold">{resultMix.rentCount}</p>
                    <p className="mt-1 text-sm font-semibold text-white/65">Rental homes in the current set</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Top type</p>
                    <p className="mt-2 text-2xl font-bold">{resultMix.topType}</p>
                    <p className="mt-1 text-sm font-semibold text-white/65">Most common property type</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-[#EFF6FF] p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Need a shortlist?</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#2563EB]">Turn the current result set into a clean handoff.</h2>
                <p className="mt-4 text-sm font-bold leading-6 text-[#2563EB]">Save the search email, then send it to a buyer, tenant, or co-buyer with the filters already captured.</p>
                <div className="mt-4 rounded-2xl border border-[#BFDBFE] bg-white/75 p-4 text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]/70">
                  Includes the search path, result count, and active filters.
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <a className="inline-flex items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-5 py-3 text-sm font-bold text-[#2563EB] shadow-sm" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: visibleListings.length })}>Save search email</a>
                  <a className="inline-flex items-center justify-center rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white shadow-sm" href="/saved">Open saved homes</a>
                </div>
                <p className="mt-3 text-xs font-semibold leading-6 text-[#2563EB]/80">
                  Saved homes stay on this device until you sign in. <a className="font-bold text-[#2563EB] underline decoration-[#93C5FD] underline-offset-2" href="/login?next=%2Fsaved">Sync across devices</a> when you’re ready.
                </p>
              </section>
            </div>
          </div>
        </section>
      ) : null}

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

function PriceField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: number }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={50000}
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder="R any"
        className="mt-2 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none transition focus:border-[#4A3AFF] focus:ring-4 focus:ring-[#4A3AFF]/10 sm:w-32"
      />
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

function EmptyResults({ filters, params }: { filters: ReturnType<typeof parseListingFilters>; params: Record<string, string | string[] | undefined> }) {
  const hasActiveFilters = Boolean(filters.query || filters.location || filters.agency || filters.agent || filters.purpose !== 'all' || filters.propertyType || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.bedrooms || filters.bathrooms || filters.parking || filters.status || filters.sort !== 'featured');
  const scope = filters.location || filters.query || 'this search';

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
        <div className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">No matching homes yet</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-.05em] text-[#1A1A2E]">
            Keep the search useful while stock catches up.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#6B7280]">
            There are no active listings for {scope} right now. Save the search for a handoff, widen the filters, or route the enquiry to the Proppd team so the next matching home can be picked up cleanly.
          </p>

          <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Suggested next searches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties?location=Sandton">
                Sandton homes
              </a>
              <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties?location=Sea%20Point">
                Sea Point rentals
              </a>
              <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties?location=Umhlanga">
                Umhlanga homes
              </a>
              <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties?purpose=sale">
                For-sale homes
              </a>
              <a className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties?purpose=rent">
                Rental homes
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a className="inline-flex items-center justify-center rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white shadow-lg" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: 0 })}>
              Save this search
            </a>
            {hasActiveFilters ? (
              <a className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties">
                Clear filters
              </a>
            ) : null}
            <a className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/list-with-us">
              List a property
            </a>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] bg-[#F7F8FA] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#9CA3AF]">Try next</p>
          <div className="mt-4 grid gap-2">
            {[
              ['Browse all homes', '/properties'],
              ['For-sale homes', '/properties?purpose=sale'],
              ['Rental homes', '/properties?purpose=rent'],
            ].map(([label, href]) => (
              <a key={label} className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href={href}>
                <span>{label}</span>
                <span className="text-[#4A3AFF]">›</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PaginationLink({ href, children, active = false, disabled = false }: { href: string; children: ReactNode; active?: boolean; disabled?: boolean }) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-slate-300">
        {children}
      </span>
    );
  }

  return (
    <a
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${active ? 'border-[#4A3AFF] bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'border-[#E5E7EB] text-[#1A1A2E] hover:border-[#4A3AFF] hover:text-[#4A3AFF]'}`}
      href={href}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </a>
  );
}

function visiblePages(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

function searchScopeLabel(filters: { query?: string; location?: string; agency?: string; agent?: string }) {
  if (filters.query && filters.location) return `matching “${filters.query}” around ${filters.location}`;
  if (filters.query) return `matching “${filters.query}”`;
  if (filters.location) return `around ${filters.location}`;
  if (filters.agency || filters.agent) return 'matching the active route filters';
  return 'around South Africa';
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

function buildMapPreview(areaWatchlist: Array<{ label: string; count: number }>, total: number) {
  const pins = areaWatchlist.slice(0, 3);
  const summary = total > 0 ? `${total} mapped ${total === 1 ? 'home' : 'homes'}` : 'No mapped homes yet';
  return { pins, summary };
}

function getMapPinPosition(index: number): { left: string; top: string } {
  const positions = [
    { left: '34%', top: '42%' },
    { left: '66%', top: '58%' },
    { left: '52%', top: '74%' },
  ];

  return positions[index] ?? positions[0];
}

function buildMarketSnapshot(listings: Array<{ priceValue: number; city: string; province: string }>) {
  const values = listings.map((listing) => listing.priceValue).sort((left, right) => left - right);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length > 0 ? `R ${Math.round(total / values.length).toLocaleString('en-ZA')}` : 'No active listings';
  const low = values.length > 0 ? `R ${values[0].toLocaleString('en-ZA')}` : '—';
  const high = values.length > 0 ? `R ${values[values.length - 1].toLocaleString('en-ZA')}` : '—';
  const cities = new Set(listings.map((listing) => listing.city)).size;
  const provinces = new Set(listings.map((listing) => listing.province)).size;

  return {
    average,
    low,
    high,
    cityLabel: `${cities} ${cities === 1 ? 'city' : 'cities'}`,
    provinceLabel: `${provinces} ${provinces === 1 ? 'province' : 'provinces'}`,
    hasListings: values.length > 0,
  };
}

function buildResultMix(listings: Array<{ purpose: string; type: string }>) {
  const saleCount = listings.filter((listing) => listing.purpose === 'For sale').length;
  const rentCount = listings.filter((listing) => listing.purpose === 'To rent').length;
  const typeCounts = new Map<string, number>();

  for (const listing of listings) {
    typeCounts.set(listing.type, (typeCounts.get(listing.type) ?? 0) + 1);
  }

  const topType = Array.from(typeCounts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? 'No active listings';

  return { saleCount, rentCount, topType };
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

function buildPropertiesHref(params: Record<string, string | string[] | undefined>, updates: Record<string, string | number | null | undefined>) {
  const searchParams = toURLSearchParams(params);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      searchParams.delete(key);
      continue;
    }
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `/properties?${query}` : '/properties';
}
