'use client';

import { Bath, BedDouble, Car, MapPin, X } from 'lucide-react';
import type { Listing } from '@/lib/demo-data';

interface PropertyComparisonProps {
  listings: Listing[];
  onRemove: (slug: string) => void;
}

export function PropertyComparison({ listings, onRemove }: PropertyComparisonProps) {
  if (listings.length === 0) return null;

  const fmt = (value: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#1A1A2E]">Compare properties</h3>
        <span className="text-xs font-bold text-[#9CA3AF]">{listings.length}/3 selected</span>
      </div>

      <div className="mt-4 overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Feature</th>
              {listings.map((listing) => (
                <th key={listing.slug} className="pb-3 text-center">
                  <div className="relative inline-block">
                    <img
                      src={listing.photos[0]?.src}
                      alt={listing.title}
                      className="h-16 w-24 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onRemove(listing.slug)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A1A2E] text-white hover:bg-red-500"
                      aria-label={`Remove ${listing.title}`}
                    >
                      <X size={10} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareRow label="Price" values={listings.map((l) => l.price)} />
            <CompareRow label="Beds" values={listings.map((l) => `${l.beds}`)} />
            <CompareRow label="Baths" values={listings.map((l) => `${l.baths}`)} />
            <CompareRow label="Parking" values={listings.map((l) => `${l.parking}`)} />
            <CompareRow label="Type" values={listings.map((l) => l.type)} />
            <CompareRow label="Location" values={listings.map((l) => l.location)} />
            <CompareRow label="Agency" values={listings.map((l) => l.agency)} />
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {listings.map((listing) => (
          <a
            key={listing.slug}
            href={`/property/${listing.slug}`}
            className="rounded-lg bg-[#4A3AFF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#3A2AE0]"
          >
            View {listing.title.slice(0, 20)}...
          </a>
        ))}
      </div>
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b border-[#F3F4F6]">
      <td className="py-2.5 text-xs font-bold text-[#9CA3AF]">{label}</td>
      {values.map((value, i) => (
        <td key={i} className="py-2.5 text-center text-sm font-bold text-[#1A1A2E]">
          {value}
        </td>
      ))}
    </tr>
  );
}
