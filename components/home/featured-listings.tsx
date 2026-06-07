import { ArrowRight } from 'lucide-react';
import { listings } from '@/lib/demo-data';
import { ListingCard } from '@/components/properties/listing-card';

const featuredListings = listings.filter((listing) => listing.featured);

export function FeaturedListings() {
  return (
    <section className="bg-[#F7F8FA]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Featured</p>
            <h2 className="mt-2 text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
              Featured properties
            </h2>
          </div>
          <a
            href="/properties"
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
          >
            Browse all <ArrowRight size={15} />
          </a>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
