import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Bell, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalListings } from '../../lib/proppd/backend';
import { applyListingFilters, paginateListings, parseListingFilters } from '@/lib/listings/filters';
import { buildSavedSearchMailto } from '@/lib/listings/saved-search';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse verified Proppd property listings across South Africa with saved search and location-first filters.',
  alternates: { canonical: '/properties' },
};

export const dynamic = 'force-dynamic';

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseListingFilters(toURLSearchParams(params));
  const portalListings = (await loadPortalListings()).items;
  const filtered = applyListingFilters(portalListings, filters);
  const paginated = paginateListings(filtered, filters.page, filters.pageSize);
  const areaWatchlist = buildAreaWatchlist(filtered);
  const resultMix = buildResultMix(filtered);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <form action="/properties" className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm xl:grid-cols-[1.6fr_1fr_1fr_1fr_auto] xl:items-end">
            <label className="flex min-h-14 items-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-500 focus-within:border-[#3B49FF] focus-within:ring-4 focus-within:ring-[#3B49FF]/10">
              <Search size={21} className="text-[#3B49FF]" />
              <input
                name="q"
                type="search"
                defaultValue={filters.query ?? ''}
                className="min-w-0 flex-1 bg-transparent font-bold text-[#050A30] outline-none placeholder:text-slate-500"
                placeholder="Search suburb, city, school, agent, or listing ID"
                aria-label="Search properties"
              />
            </label>

            <SelectField label="Purpose" name="purpose" defaultValue={filters.purpose}>
              <option value="all">For sale & rent</option>
              <option value="sale">For sale</option>
              <option value="rent">To rent</option>
            </SelectField>

            <SelectField label="Sort" name="sort" defaultValue={filters.sort}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </SelectField>

            <SelectField label="Home type" name="propertyType" defaultValue={filters.propertyType ?? ''}>
              <option value="">Any type</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
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
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#3B49FF] px-5 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20 transition hover:bg-[#2f3fd6]" type="submit">
                Search
              </button>
              <a className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-black text-[#050A30] shadow-sm transition hover:border-[#3B49FF]" href="/properties">
                Clear
              </a>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm font-black text-[#050A30]">
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
              <a className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/properties">
                Clear all
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-black tracking-[-.04em] sm:text-3xl">
                    {`${filtered.length} ${filtered.length === 1 ? 'home' : 'homes'} ${searchScopeLabel(filters)}`}
                  </h1>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    {filters.query ? `Matching “${filters.query}” across listing facts, areas, agents, and agencies.` : 'Price-first verified homes with saved search and agent routing.'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-[#050A30]">
                    {paginated.page} / {paginated.totalPages}
                  </div>
                  <a className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#050A30] px-4 py-2 text-sm font-black text-white" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: filtered.length })} aria-label="Request a saved property search alert">
                    <Bell size={15} /> <span className="text-white">Save search</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {paginated.items.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
            {paginated.items.length === 0 && (
              <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600">
                No listings match those filters yet. Try a wider location or price range.
              </div>
            )}

            {paginated.totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-600">
                  Showing page {paginated.page} of {paginated.totalPages} · {filtered.length} total matches
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
            <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,214,197,.55),transparent_14rem),radial-gradient(circle_at_72%_35%,rgba(59,73,255,.45),transparent_15rem),linear-gradient(135deg,#edf7ff,#f8fbff_45%,#e7fbf8)] p-5">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#050A30_1px,transparent_1px),linear-gradient(90deg,#050A30_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="relative grid gap-4">
                  <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#3B49FF] text-white"><MapPin size={18} /></div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Area watch</p>
                        <p className="font-black">{filtered.length} live homes across South Africa</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">Use the filters above to narrow the market, then tap a listing to open the full enquiry flow.</p>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/88 p-4 shadow-xl backdrop-blur">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Top areas</p>
                    <div className="mt-3 grid gap-3">
                      {areaWatchlist.length > 0 ? (
                        areaWatchlist.map((area) => (
                          <a
                            key={area.label}
                            href={buildPropertiesHref(params, { q: area.label })}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]"
                          >
                            <span>{area.label}</span>
                            <span className="rounded-full bg-[#3B49FF]/10 px-2.5 py-1 text-xs font-black text-[#3B49FF]">{area.count} match{area.count === 1 ? '' : 'es'}</span>
                          </a>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                          Tight filters yielded no area summary yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#050A30] p-4 text-white shadow-2xl">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Search shortcut</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/72">Save this search or switch to a purpose filter if you want the list to read smaller and cleaner.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#050A30]" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: filtered.length })}>Save search</a>
                      <a className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white" href="/request-valuation">Request valuation</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Area watchlist</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Most active suburbs in this result set.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">The current search is concentrated in a few pockets, so we surface those areas first and keep the rest easy to reach.</p>
              <div className="mt-5 grid gap-3">
                {areaWatchlist.length > 0 ? areaWatchlist.map((area) => (
                  <a key={area.label} href={buildPropertiesHref(params, { q: area.label })} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]">
                    <span>{area.label}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500">{area.count} listing{area.count === 1 ? '' : 's'}</span>
                  </a>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-semibold text-slate-600">
                    No area summary yet for these filters.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] bg-[#050A30] p-6 text-white shadow-sm lg:col-span-1">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Result mix</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">What this shortlist is made of.</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/72">A quick read on the current market split helps you decide whether to tighten by purpose, type, or location.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">For sale</p>
                  <p className="mt-2 text-3xl font-black">{resultMix.saleCount}</p>
                  <p className="mt-1 text-sm font-semibold text-white/65">Homes in the current set</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">To rent</p>
                  <p className="mt-2 text-3xl font-black">{resultMix.rentCount}</p>
                  <p className="mt-1 text-sm font-semibold text-white/65">Rental homes in the current set</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Top type</p>
                  <p className="mt-2 text-2xl font-black">{resultMix.topType}</p>
                  <p className="mt-1 text-sm font-semibold text-white/65">Most common property type</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-[#eefcf9] p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#0f766e]">Need a shortlist?</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#0f766e]">Turn the current result set into a clean handoff.</h2>
              <p className="mt-4 text-sm font-bold leading-6 text-[#0f766e]">Save the search email, then send it to a buyer, tenant, or co-buyer with the filters already captured.</p>
              <div className="mt-4 rounded-2xl border border-[#0f766e]/15 bg-white/75 p-4 text-xs font-black uppercase tracking-[.14em] text-[#0f766e]/70">
                Includes the search path, result count, and active filters.
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a className="inline-flex items-center justify-center rounded-full border border-[#0f766e]/20 bg-white px-5 py-3 text-sm font-black text-[#0f766e] shadow-sm" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: filtered.length })}>Save search email</a>
                <a className="inline-flex items-center justify-center rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white shadow-sm" href="/agents">Browse agents</a>
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
    <label className={`block text-xs font-black uppercase tracking-[.12em] text-slate-500 ${compact ? 'w-full sm:w-auto' : ''}`}>
      {label}
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className={`mt-2 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#050A30] shadow-sm outline-none transition focus:border-[#3B49FF] focus:ring-4 focus:ring-[#3B49FF]/10 ${compact ? 'sm:min-w-[9rem]' : ''}`}
      >
        {children}
      </select>
    </label>
  );
}

function FilterChip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="inline-flex items-center gap-2 rounded-full border border-[#3B49FF]/20 bg-[#3B49FF]/8 px-3 py-2 text-[#3B49FF] transition hover:border-[#3B49FF] hover:bg-[#3B49FF]/12" href={href}>
      {children}
    </a>
  );
}

function PaginationLink({ href, children, active = false, disabled = false }: { href: string; children: ReactNode; active?: boolean; disabled?: boolean }) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-300">
        {children}
      </span>
    );
  }

  return (
    <a
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition ${active ? 'border-[#3B49FF] bg-[#3B49FF]/10 text-[#3B49FF]' : 'border-slate-200 text-[#050A30] hover:border-[#3B49FF] hover:text-[#3B49FF]'}`}
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

function buildResultMix(listings: Array<{ purpose: string; type: string }>) {
  const saleCount = listings.filter((listing) => listing.purpose === 'For sale').length;
  const rentCount = listings.filter((listing) => listing.purpose === 'To rent').length;
  const typeCounts = new Map<string, number>();

  for (const listing of listings) {
    typeCounts.set(listing.type, (typeCounts.get(listing.type) ?? 0) + 1);
  }

  const topType = Array.from(typeCounts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? 'Mixed';

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
