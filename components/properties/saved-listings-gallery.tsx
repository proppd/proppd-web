'use client';

import { ArrowRight, Lock, Search, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Listing } from '@/lib/demo-data';
import { ListingCard } from '@/components/properties/listing-card';
import { readSavedHomeSlugs, subscribeSavedHomes, writeSavedHomeSlugs } from '@/lib/saved-homes';

export function SavedListingsGallery({ listings }: { listings: Listing[] }) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSavedSlugs(readSavedHomeSlugs());
    return subscribeSavedHomes(() => setSavedSlugs(readSavedHomeSlugs()));
  }, []);

  const savedListings = useMemo(() => {
    const index = new Map(listings.map((listing) => [listing.slug, listing]));
    return savedSlugs.map((slug) => index.get(slug)).filter((listing): listing is Listing => Boolean(listing));
  }, [listings, savedSlugs]);

  const clearSavedHomes = () => {
    writeSavedHomeSlugs([]);
    setSavedSlugs([]);
  };

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Saved homes</p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-.06em] text-[#1A1A2E]">Your shortlist lives here.</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#6B7280]">
                Tap Save on any listing to keep it on this device. Sign in to carry the same shortlist across devices and open it from your inbox or dashboard later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/login?next=%2Fsaved" className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]">
                <Lock size={15} /> Sign in to sync
              </a>
              <button type="button" onClick={clearSavedHomes} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                <Trash2 size={15} /> Clear shortlist
              </button>
            </div>
          </div>
        </div>

        {savedListings.length === 0 ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 shadow-sm sm:p-8">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Nothing saved yet</div>
              <h2 className="mt-4 text-3xl font-bold tracking-[-.05em] text-[#1A1A2E]">Save homes from the browse pages to build a shortlist.</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#6B7280]">
                Once you tap Save, the property will appear here on this device. If you sign in, Proppd can keep the shortlist with you across sessions and devices.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/properties" className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]">
                  <Search size={15} /> Browse homes
                </a>
                <a href="/properties/for-sale" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                  Featured sale homes <ArrowRight size={15} />
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">How saving works</p>
              <div className="mt-4 space-y-4 text-sm font-semibold leading-6 text-[#2563EB]">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1A2E]">1</span>
                  Tap Save on any property card or detail page.
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1A2E]">2</span>
                  Review the shortlist here before you share it with a buyer or co-buyer.
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1A2E]">3</span>
                  Sign in to sync the same homes on another device.
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-white p-4 text-sm font-bold text-[#6B7280] shadow-sm">
                <Sparkles className="mb-2 text-[#4A3AFF]" size={18} /> Your shortlist is private to this browser until you sign in.
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {savedListings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
