import { listings } from '@/lib/demo-data';
import { ListingCard } from '@/components/properties/listing-card';

export function FeaturedListings() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Portal preview</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em] text-[#050A30] sm:text-5xl">Featured properties</h2>
          </div>
          <a className="font-black text-[#3B49FF]" href="/properties">Browse all properties →</a>
        </div>
        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {listings.filter((listing) => listing.featured).map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
        </div>
      </div>
    </section>
  );
}
