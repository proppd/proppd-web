import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';
import { applyListingFilters, paginateListings, parseListingFilters } from '@/lib/listings/filters';
import { buildSavedSearchMailto } from '@/lib/listings/saved-search';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse verified Proppd property listings across South Africa with saved search and location-first filters.',
  alternates: { canonical: '/properties' },
};

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseListingFilters(toURLSearchParams(params));
  const filtered = applyListingFilters(listings, filters);
  const paginated = paginateListings(filtered, filters.page, filters.pageSize);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <form action="/properties" className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="flex min-h-14 items-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-500 shadow-sm focus-within:border-[#3B49FF] focus-within:ring-4 focus-within:ring-[#3B49FF]/10">
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
            <div className="flex flex-wrap gap-2">
              <FilterButton active={filters.purpose !== 'all'}>{filters.purpose === 'all' ? 'For sale & rent' : filters.purpose === 'sale' ? 'For sale' : 'To rent'}</FilterButton>
              <FilterButton>{priceLabel(filters.minPrice, filters.maxPrice)}</FilterButton>
              <FilterButton>{filters.bedrooms ? `${filters.bedrooms}+ beds` : 'Beds & baths'}</FilterButton>
              <FilterButton>Home type</FilterButton>
              <a className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-black shadow-sm transition hover:border-[#3B49FF]" href="/properties">
                <SlidersHorizontal size={16} /> More
              </a>
              <button className="inline-flex min-h-11 items-center rounded-full bg-[#3B49FF] px-5 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-black tracking-[-.04em] sm:text-3xl">
                    {filtered.length} homes {searchScopeLabel(filters)}
                  </h1>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    {filters.query ? `Matching “${filters.query}” across listing facts, areas, agents, and agencies.` : 'Price-first verified homes with saved search and agent routing.'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-[#050A30]">Sort: {filters.sort.replace('-', ' ')}</button>
                  <a className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#050A30] px-4 py-2 text-sm font-black text-white" href={buildSavedSearchMailto(filters, { path: '/properties', resultCount: filtered.length })} aria-label="Request a saved property search alert"><Bell size={15} /> <span className="text-white">Save search</span></a>
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
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_30%_20%,rgba(18,214,197,.55),transparent_14rem),radial-gradient(circle_at_72%_35%,rgba(59,73,255,.45),transparent_15rem),linear-gradient(135deg,#edf7ff,#f8fbff_45%,#e7fbf8)] p-5">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#050A30_1px,transparent_1px),linear-gradient(90deg,#050A30_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="relative rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#3B49FF] text-white"><MapPin size={18} /></div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Map preview</p>
                      <p className="font-black">Explore by area</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">The live map layer will sit here. For now, quick route users into verified listing cards and locations.</p>
                </div>
                {paginated.items.map((listing, index) => (
                  <a
                    key={listing.slug}
                    href={`/property/${listing.slug}`}
                    className="absolute rounded-full bg-white px-3 py-2 text-sm font-black text-[#050A30] shadow-xl ring-2 ring-[#3B49FF]/15"
                    style={{ left: `${18 + index * 20}%`, top: `${47 + (index % 2) * 16}%` }}
                  >
                    {listing.price.replace(' pm', '')}
                  </a>
                ))}
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-[#050A30] p-4 text-white shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Proppd map mode</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">Map/search split prepared for the next data layer.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function FilterButton({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <button className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-black shadow-sm transition ${active ? 'border-[#3B49FF] bg-[#3B49FF]/10 text-[#3B49FF]' : 'border-slate-300 bg-white text-[#050A30] hover:border-[#3B49FF]'}`}>
      {children} <ChevronDown size={15} />
    </button>
  );
}

function searchScopeLabel(filters: { query?: string; location?: string }) {
  if (filters.query && filters.location) return `matching “${filters.query}” around ${filters.location}`;
  if (filters.query) return `matching “${filters.query}”`;
  return `around ${filters.location || 'South Africa'}`;
}

function priceLabel(minPrice?: number, maxPrice?: number) {
  if (minPrice !== undefined && maxPrice !== undefined) return `R${minPrice.toLocaleString()} - R${maxPrice.toLocaleString()}`;
  if (minPrice !== undefined) return `From R${minPrice.toLocaleString()}`;
  if (maxPrice !== undefined) return `Up to R${maxPrice.toLocaleString()}`;
  return 'Any price';
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
