import { listings } from '@/lib/demo-data';
import { ListingCard } from '@/components/properties/listing-card';

export function FeaturedListings() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Homes for you</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em] text-[#050A30] sm:text-5xl">Fresh on Proppd</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              A familiar card-led browsing flow: price first, facts next, then verified agent routing when you are ready to enquire.
            </p>
          </div>
          <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/properties">
            Browse all properties →
          </a>
        </div>
        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {listings.filter((listing) => listing.featured).map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
        </div>
      </div>
    </section>
  );
}
