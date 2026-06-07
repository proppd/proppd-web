'use client';

import { Bath, BedDouble, Car, MapPin } from 'lucide-react';
import type { Listing } from '@/lib/demo-data';
import { SaveListingButton } from '@/components/properties/save-listing-button';
import { ListingBadgeDisplay, getListingBadges } from './listing-badges';

export function ListingCard({ listing }: { listing: Listing }) {
  const badges = getListingBadges(listing);

  return (
    <article className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition hover:shadow-lg hover:shadow-black/5">
      <a href={`/property/${listing.slug}`} className="block">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-[#F7F8FA]">
          <img
            src={listing.photos[0]?.src}
            alt={listing.photos[0]?.alt ?? listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Purpose badge */}
          <span className="absolute left-3 top-3 rounded bg-[#1A1A2E] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {listing.purpose}
          </span>
          {/* Listing badges */}
          <div className="absolute left-3 top-10 z-10">
            <ListingBadgeDisplay badges={badges} />
          </div>
          {/* Photo count */}
          {listing.photos.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {listing.photos.length} photos
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <p className="text-xl font-bold text-[#1A1A2E]">{listing.price}</p>

          {/* Beds / Baths / Parking */}
          <div className="mt-2 flex items-center gap-4 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1">
              <BedDouble size={15} className="text-[#9CA3AF]" /> {listing.beds} beds
            </span>
            <span className="flex items-center gap-1">
              <Bath size={15} className="text-[#9CA3AF]" /> {listing.baths} baths
            </span>
            <span className="flex items-center gap-1">
              <Car size={15} className="text-[#9CA3AF]" /> {listing.parking}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-[#1A1A2E]">
            {listing.title}
          </h3>

          {/* Location */}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
            <MapPin size={14} className="shrink-0 text-[#9CA3AF]" />
            {listing.location}
          </p>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
            <span className="text-xs font-semibold text-[#9CA3AF]">{listing.agency}</span>
            <span className="text-xs font-bold text-[#4A3AFF]">View details</span>
          </div>
        </div>
      </a>

      {/* Save button */}
      <div className="absolute right-3 top-14 z-10">
        <SaveListingButton
          slug={listing.slug}
          title={listing.title}
          iconOnly
          className="rounded-full border border-white/80 bg-white/90 p-2 text-[#6B7280] shadow-sm backdrop-blur-sm transition hover:text-[#4A3AFF]"
        />
      </div>
    </article>
  );
}
