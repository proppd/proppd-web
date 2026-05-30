'use client';

import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { readSavedHomeSlugs, subscribeSavedHomes, writeSavedHomeSlugs } from '@/lib/saved-homes';

export function SaveListingButton({ slug, title, className = '', iconOnly = false }: { slug: string; title: string; className?: string; iconOnly?: boolean }) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSavedSlugs(readSavedHomeSlugs());
    return subscribeSavedHomes(() => setSavedSlugs(readSavedHomeSlugs()));
  }, []);

  const saved = useMemo(() => savedSlugs.includes(slug), [savedSlugs, slug]);

  const toggleSaved = () => {
    const current = new Set(readSavedHomeSlugs());
    if (current.has(slug)) current.delete(slug);
    else current.add(slug);
    writeSavedHomeSlugs(Array.from(current));
    setSavedSlugs(Array.from(current));
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Save'} ${title}`}
      title={saved ? 'Saved to shortlist' : 'Save to shortlist'}
      onClick={toggleSaved}
      className={`inline-flex items-center gap-2 rounded-full transition ${className}`.trim()}
    >
      <Heart size={15} fill={saved ? 'currentColor' : 'none'} strokeWidth={2.2} />
      {iconOnly ? null : <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
