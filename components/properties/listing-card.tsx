'use client';

import { Bath, BedDouble, Car, MapPin, Heart } from 'lucide-react';
import type { Listing } from '@/lib/demo-data';
import { SaveListingButton } from '@/components/properties/save-listing-button';
import { ListingBadgeDisplay, getListingBadges } from './listing-badges';

export function ListingCard({ listing }: { listing: Listing }) {
  const badges = getListingBadges(listing);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#4A3AFF]/20 hover:shadow-xl hover:shadow-[#4A3AFF]/5">
      <a href={`/property/${listing.slug}`} className="block">
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-[#F7F8FA] sm:h-64">
          <img
            src={listing.photos[0]?.src}
            alt={listing.photos[0]?.alt ?? listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Purpose badge */}
          <span className="absolute left-3 top-3 rounded-lg bg-[#4A3AFF] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
            {listing.purpose}
          </span>
          
          {/* Listing badges */}
          <div className="absolute left-3 top-12 z-10">
            <ListingBadgeDisplay badges={badges} />
          </div>
          
          {/* Photo count */}
          {listing.photos.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              📷 {listing.photos.length}
            </span>
          )}

          {/* Quick view overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-lg">
              View details →
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price + Agency row */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-2xl font-bold tracking-tight text-[#1A1A2E]">{listing.price}</p>
          </div>

          {/* Location */}
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#6B7280]">
            <MapPin size={14} className="shrink-0 text-[#4A3AFF]" />
            {listing.location}
          </p>

          {/* Beds / Baths / Parking */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-[#1A1A2E]">
              <BedDouble size={15} className="text-[#4A3AFF]" /> {listing.beds} beds
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#1A1A2E]">
              <Bath size={15} className="text-[#4A3AFF]" /> {listing.baths} baths
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#1A1A2E]">
              <Car size={15} className="text-[#4A3AFF]" /> {listing.parking}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-[#6B7280]">
            {listing.title}
          </h3>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
            <span className="text-xs font-bold text-[#9CA3AF]">{listing.agency}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4A3AFF] transition group-hover:gap-2">
              Details <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </a>

      {/* Save button */}
      <div className="absolute right-3 top-3 z-10">
        <SaveListingButton
          slug={listing.slug}
          title={listing.title}
          iconOnly
          className="rounded-full border border-white/80 bg-white/90 p-2.5 text-[#6B7280] shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-[#4A3AFF] hover:text-white hover:shadow-xl"
        />
      </div>
    </article>
  );
}
