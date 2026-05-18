import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';
import { applyListingFilters, paginateListings, parseListingFilters } from '@/lib/listings/filters';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseListingFilters(toURLSearchParams(params));
  const filtered = applyListingFilters(listings, filters);
  const paginated = paginateListings(filtered, filters.page, filters.pageSize);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Property search</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Search property in South Africa</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Browse verified sale and rental opportunities while the Proppd MVP data layer comes online.
          </p>
          <div className="mt-8 grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-4">
            <FilterPill label="Purpose" value={filters.purpose === 'all' ? 'Buy or rent' : filters.purpose === 'sale' ? 'For sale' : 'To rent'} />
            <FilterPill label="Location" value={filters.location || 'Any location'} />
            <FilterPill label="Price" value={priceLabel(filters.minPrice, filters.maxPrice)} />
            <FilterPill label="Bedrooms" value={filters.bedrooms ? `${filters.bedrooms}+ beds` : 'Any beds'} />
          </div>
          <div className="mt-6 flex items-center justify-between text-sm font-bold text-slate-500">
            <span>{filtered.length} matching properties</span>
            <span>Sort: {filters.sort.replace('-', ' ')}</span>
          </div>
          <div className="mt-9 grid gap-6 lg:grid-cols-3">
            {paginated.items.map((listing) => (
              <a key={listing.slug} href={`/property/${listing.slug}`} aria-label={`View ${listing.title}`}>
                <ListingCard listing={listing} />
              </a>
            ))}
          </div>
          {paginated.items.length === 0 && (
            <div className="mt-9 rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600">
              No listings match those filters yet. Try a wider location or price range.
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-[#F5F7FA] px-5 py-3">
      <div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{label}</div>
      <div className="text-sm font-black text-[#050A30]">{value}</div>
    </div>
  );
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
