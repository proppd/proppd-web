'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Loader2, LogIn } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { cloudSaveSearch } from '@/lib/search/cloud';
import { savedSearchHref, type SavedSearchPath } from '@/lib/search/saved';

export function SaveSearchButton({ label, path, queryString }: { label: string; path: SavedSearchPath; queryString: string }) {
  const [auth, setAuth] = useState<'unknown' | 'in' | 'out'>('unknown');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setAuth('out');
      return;
    }
    let active = true;
    supabase.auth.getUser().then(({ data }) => active && setAuth(data.user ? 'in' : 'out'));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setAuth(session?.user ? 'in' : 'out'));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const baseClass =
    'inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2 text-sm font-bold text-[#2563EB] transition hover:border-[#4A3AFF] hover:bg-[#DBEAFE]';

  // Until auth resolves (and when signed out) offer a sign-in path that returns here.
  if (auth !== 'in') {
    const nextParam = encodeURIComponent(savedSearchHref({ path, queryString }));
    return (
      <a href={`/login?next=${nextParam}`} className={baseClass}>
        <LogIn size={15} /> Sign in to save this search
      </a>
    );
  }

  async function save() {
    if (state === 'saving' || state === 'saved') return;
    setState('saving');
    try {
      await cloudSaveSearch({ label, path, queryString });
      setState('saved');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not save this search.');
    }
  }

  if (state === 'error') {
    return <span className="text-sm font-semibold text-red-600">{message}</span>;
  }

  return (
    <button type="button" onClick={save} disabled={state !== 'idle'} className={`${baseClass} disabled:opacity-70`}>
      {state === 'saved' ? (
        <><Check size={15} /> Search saved</>
      ) : state === 'saving' ? (
        <><Loader2 size={15} className="animate-spin" /> Saving…</>
      ) : (
        <><Bell size={15} /> Save this search</>
      )}
    </button>
  );
}
