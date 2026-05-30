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
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Saved homes</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-.06em] text-[#050A30]">Your shortlist lives here.</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                Tap Save on any listing to keep it on this device. Sign in to carry the same shortlist across devices and open it from your inbox or dashboard later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/login?next=%2Fsaved" className="inline-flex items-center gap-2 rounded-full bg-[#050A30] px-4 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]">
                <Lock size={15} /> Sign in to sync
              </a>
              <button type="button" onClick={clearSavedHomes} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:border-[#3B49FF] hover:text-[#3B49FF]">
                <Trash2 size={15} /> Clear shortlist
              </button>
            </div>
          </div>
        </div>

        {savedListings.length === 0 ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-6 shadow-sm sm:p-8">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-slate-500">Nothing saved yet</div>
              <h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#050A30]">Save homes from the browse pages to build a shortlist.</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                Once you tap Save, the property will appear here on this device. If you sign in, Proppd can keep the shortlist with you across sessions and devices.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/properties" className="inline-flex items-center gap-2 rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]">
                  <Search size={15} /> Browse homes
                </a>
                <a href="/properties/for-sale" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]">
                  Featured sale homes <ArrowRight size={15} />
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#12D6C5]/30 bg-[#eefcf9] p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#0f766e]">How saving works</p>
              <div className="mt-4 space-y-4 text-sm font-semibold leading-6 text-[#0f766e]">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#050A30]">1</span>
                  Tap Save on any property card or detail page.
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#050A30]">2</span>
                  Review the shortlist here before you share it with a buyer or co-buyer.
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#050A30]">3</span>
                  Sign in to sync the same homes on another device.
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-sm">
                <Sparkles className="mb-2 text-[#3B49FF]" size={18} /> Your shortlist is private to this browser until you sign in.
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
