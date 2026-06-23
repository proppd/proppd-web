'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Loader2, LogIn, X } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { cloudSaveSearch } from '@/lib/search/cloud';
import { savedSearchHref, type SavedSearchPath } from '@/lib/search/saved';

// NEXT_PUBLIC_* must be referenced as literal property accesses to be inlined.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function SaveSearchButton({ label, path, queryString }: { label: string; path: SavedSearchPath; queryString: string }) {
  const [auth, setAuth] = useState<'unknown' | 'in' | 'out'>('unknown');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);

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
  const href = savedSearchHref({ path, queryString });

  // Signed out (or still resolving): offer inline, open self-serve sign-in that
  // returns to this search and creates an account automatically for new buyers.
  if (auth !== 'in') {
    return (
      <div className="inline-block">
        <button type="button" onClick={() => setShowSignIn((open) => !open)} className={baseClass}>
          {showSignIn ? <X size={15} /> : <LogIn size={15} />} {showSignIn ? 'Close' : 'Save this search'}
        </button>
        {showSignIn && (
          <div className="mt-3 w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-lg">
            <p className="text-sm font-bold text-[#1A1A2E]">Save this search to your account</p>
            <p className="mt-1 text-xs font-semibold text-[#6B7280]">
              Enter your email — we&apos;ll send a secure link. New here? Your account is created automatically, no password.
            </p>
            <div className="mt-3">
              <SupabaseLoginForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} nextPath={href} allowSignUp />
            </div>
          </div>
        )}
      </div>
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
