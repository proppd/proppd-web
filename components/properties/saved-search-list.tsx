'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Bell, Loader2, Search, Trash2 } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { cloudListSearches, cloudRemoveSearch } from '@/lib/search/cloud';
import { savedSearchHref, type SavedSearch } from '@/lib/search/saved';

// NEXT_PUBLIC_* must be referenced as literal property accesses to be inlined.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function SavedSearchList() {
  const [auth, setAuth] = useState<'unknown' | 'in' | 'out'>('unknown');
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (auth !== 'in') {
      if (auth === 'out') setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    cloudListSearches()
      .then((list) => !cancelled && setSearches(list))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [auth]);

  async function remove(id: string) {
    setSearches((current) => current.filter((entry) => entry.id !== id));
    try {
      setSearches(await cloudRemoveSearch(id));
    } catch {
      // optimistic removal already applied
    }
  }

  return (
    <section className="px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]"><Bell size={20} /></span>
            <div>
              <h2 className="text-xl font-bold tracking-[-.02em] text-[#1A1A2E]">Saved searches</h2>
              <p className="text-sm font-semibold text-[#6B7280]">Re-run a search in one tap. Saved to your account.</p>
            </div>
          </div>

          {auth === 'out' ? (
            <div className="mt-5 rounded-xl border border-dashed border-[#BFDBFE] bg-[#F7F8FA] p-5">
              <p className="text-sm font-semibold text-[#6B7280]">Sign in to save searches and pick up where you left off across devices. New here? Your account is created automatically — no password.</p>
              <div className="mt-4 max-w-sm">
                <SupabaseLoginForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} nextPath="/saved" allowSignUp />
              </div>
            </div>
          ) : loading ? (
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#6B7280]"><Loader2 size={15} className="animate-spin" /> Loading your saved searches…</p>
          ) : searches.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F7F8FA] p-5 text-center">
              <p className="text-sm font-semibold text-[#6B7280]">No saved searches yet. Run a search and tap <span className="font-bold text-[#2563EB]">Save this search</span>.</p>
              <a href="/properties" className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-5 py-2.5 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"><Search size={15} /> Browse properties</a>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {searches.map((search) => (
                <div key={search.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <a href={savedSearchHref(search)} className="group flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]"><Search size={16} /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold capitalize text-[#1A1A2E] group-hover:text-[#4A3AFF]">{search.label}</span>
                      <span className="block text-xs font-semibold text-[#9CA3AF]">{search.path.replace('/properties/', '').replace('/properties', 'All listings').replace('for-sale', 'For sale').replace('to-rent', 'To rent') || 'All listings'}</span>
                    </span>
                  </a>
                  <a href={savedSearchHref(search)} className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#4A3AFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3A2AE0] sm:inline-flex">Run <ArrowRight size={14} /></a>
                  <button type="button" onClick={() => remove(search.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F7F8FA] hover:text-red-500" aria-label="Remove saved search">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
