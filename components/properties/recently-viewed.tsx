'use client';

import { useEffect, useState } from 'react';
import { Clock, Bath, BedDouble, MapPin } from 'lucide-react';

interface ViewedProperty {
  slug: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  photo: string;
  viewedAt: number;
}

const STORAGE_KEY = 'proppd_recently_viewed';
const MAX_ITEMS = 6;

export function RecentlyViewed() {
  const [viewed, setViewed] = useState<ViewedProperty[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setViewed(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  if (viewed.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[#9CA3AF]" />
          <h2 className="text-xl font-bold text-[#1A1A2E]">Recently viewed</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {viewed.slice(0, MAX_ITEMS).map((item) => (
            <a
              key={item.slug}
              href={`/property/${item.slug}`}
              className="group flex gap-4 rounded-xl border border-[#E5E7EB] bg-white p-3 transition hover:shadow-lg hover:shadow-black/5"
            >
              <img
                src={item.photo}
                alt={item.title}
                className="h-20 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1A1A2E]">{item.price}</p>
                <h3 className="mt-0.5 line-clamp-1 text-xs font-semibold text-[#6B7280]">{item.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#9CA3AF]">
                  <MapPin size={10} /> {item.location}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-0.5"><BedDouble size={10} /> {item.beds}</span>
                  <span className="flex items-center gap-0.5"><Bath size={10} /> {item.baths}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function trackRecentlyViewed(listing: {
  slug: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  photo: string;
}) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const viewed: ViewedProperty[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    const filtered = viewed.filter((item) => item.slug !== listing.slug);

    // Add to front
    filtered.unshift({
      ...listing,
      viewedAt: Date.now(),
    });

    // Keep max items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}
