'use client';

import { useEffect, useState } from 'react';

import { readSavedHomeSlugs, subscribeSavedHomes } from '@/lib/saved-homes';

type SavedHomesLinkProps = {
  className?: string;
};

export function SavedHomesLink({ className = '' }: SavedHomesLinkProps) {
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const sync = () => setSavedCount(readSavedHomeSlugs().length);
    sync();
    return subscribeSavedHomes(sync);
  }, []);

  return (
    <a className={className} href="/saved">
      <span>Saved homes</span>
      {savedCount > 0 ? (
        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#0f766e]/10 px-1.5 py-0.5 text-[11px] font-black text-[#0f766e]">
          {savedCount}
        </span>
      ) : null}
    </a>
  );
}
