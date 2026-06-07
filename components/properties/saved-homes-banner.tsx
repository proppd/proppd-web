'use client';

import { Bookmark, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { readSavedHomeSlugs, subscribeSavedHomes } from '@/lib/saved-homes';

export function SavedHomesBanner() {
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const sync = () => setSavedCount(readSavedHomeSlugs().length);
    sync();
    return subscribeSavedHomes(sync);
  }, []);

  if (savedCount === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-[#00C9A7]/15 bg-[#E6FBF7] px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#00C9A7] shadow-sm">
            <Bookmark size={18} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#00C9A7]">Saved homes</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#00C9A7]">
              {savedCount} {savedCount === 1 ? 'home is' : 'homes are'} on your shortlist. Open it any time or sign in to keep it with you across devices.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/saved" className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]">
            Open shortlist
          </a>
          <a href="/login?next=%2Fsaved" className="inline-flex items-center gap-2 rounded-full border border-[#00C9A7]/20 bg-white px-4 py-3 text-sm font-bold text-[#00C9A7] transition hover:border-[#00C9A7] hover:text-[#1A1A2E]">
            <Lock size={15} /> Sync to account
          </a>
        </div>
      </div>
    </div>
  );
}
