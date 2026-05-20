import { ArrowRight } from 'lucide-react';
import { listings } from '@/lib/demo-data';
import { ListingCard } from '@/components/properties/listing-card';

const featuredListings = listings.filter((listing) => listing.featured);

export function FeaturedListings() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-slate-400">Featured</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.05em] text-[#050A30] sm:text-3xl">Featured properties</h2>
          </div>
          <a className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/properties">
            Browse all <ArrowRight size={16} />
          </a>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {featuredListings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
        </div>
      </div>
    </section>
  );
}
