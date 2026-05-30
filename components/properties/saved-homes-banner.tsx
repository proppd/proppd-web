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
    <div className="mt-4 rounded-[1.5rem] border border-[#0f766e]/15 bg-[#eefcf9] px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0f766e] shadow-sm">
            <Bookmark size={18} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#0f766e]">Saved homes</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#0f766e]">
              {savedCount} {savedCount === 1 ? 'home is' : 'homes are'} on your shortlist. Open it any time or sign in to keep it with you across devices.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/saved" className="inline-flex items-center gap-2 rounded-full bg-[#050A30] px-4 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]">
            Open shortlist
          </a>
          <a href="/login?next=%2Fsaved" className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-white px-4 py-3 text-sm font-black text-[#0f766e] transition hover:border-[#0f766e] hover:text-[#050A30]">
            <Lock size={15} /> Sync to account
          </a>
        </div>
      </div>
    </div>
  );
}
