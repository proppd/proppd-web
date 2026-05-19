import { Bell, Search } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';
import { applyListingFilters, parseListingFilters } from '@/lib/listings/filters';
import { buildSavedSearchMailto } from '@/lib/listings/saved-search';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ToRentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseListingFilters(toURLSearchParams({ ...params, purpose: 'rent' }));
  const rentListings = applyListingFilters(listings, filters);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <form action="/properties/to-rent" className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-14 flex-1 items-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-500 shadow-sm focus-within:border-[#3B49FF] focus-within:ring-4 focus-within:ring-[#3B49FF]/10">
            <Search size={21} className="text-[#3B49FF]" />
            <input
              name="q"
              type="search"
              defaultValue={filters.query ?? ''}
              className="min-w-0 flex-1 bg-transparent font-bold text-[#050A30] outline-none placeholder:text-slate-500"
              placeholder="Search rentals by suburb, city, agent, or listing ID"
              aria-label="Search homes to rent"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {['To rent', 'Monthly rent', 'Beds & baths', 'Pet friendly'].map((item) => (
              <button key={item} className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-black shadow-sm" type="button">{item}</button>
            ))}
            <button className="rounded-full bg-[#3B49FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20" type="submit">Search</button>
          </div>
        </form>
      </section>
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">To rent</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">{rentListings.length} rental homes {filters.query ? `matching “${filters.query}”` : 'in South Africa'}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">{filters.query ? 'Filtered across listing facts, areas, agents, and agencies.' : 'Rental cards with clear price, facts, verified agency routing, and POPIA-friendly enquiries.'}</p>
            </div>
            <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white" href={buildSavedSearchMailto(filters, { path: '/properties/to-rent', resultCount: rentListings.length })} aria-label="Request a saved rental search alert"><Bell size={15} /> <span className="text-white">Save search</span></a>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rentListings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
          </div>
          {rentListings.length === 0 && (
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600">
              No rental listings match that search yet. Try a wider suburb, city, agent, or feature.
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
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
