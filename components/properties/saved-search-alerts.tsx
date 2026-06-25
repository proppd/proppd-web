'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Loader2, LogIn, X } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { cloudSaveSearch } from '@/lib/search/cloud';
import { savedSearchHref, type SavedSearchPath } from '@/lib/search/saved';

// NEXT_PUBLIC_* must be referenced as literal property accesses to be inlined.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Email alerts for the current property search. Saving the search to the
 * signed-in account is what enables alerts: the daily cron
 * (/api/saved-searches/run-alerts) emails the account address whenever new
 * listings match a stored search. Signed-out visitors are offered the same
 * passwordless sign-in flow as the "Save this search" button.
 */
export function SavedSearchAlerts({ label, path, queryString }: { label: string; path: SavedSearchPath; queryString: string }) {
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

  const href = savedSearchHref({ path, queryString });

  async function enableAlerts() {
    if (state === 'saving' || state === 'saved') return;
    setState('saving');
    try {
      // The POST stamps the account email onto the row; the cron reads it.
      await cloudSaveSearch({ label, path, queryString });
      setState('saved');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not set up this alert.');
    }
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-[#4A3AFF]" />
        <h3 className="text-base font-bold text-[#1A1A2E]">Get new-match alerts</h3>
      </div>
      <p className="mt-1 text-sm text-[#6B7280]">
        We&apos;ll email you when new homes match this search — checked every morning.
      </p>

      {label && (
        <div className="mt-3 rounded-lg bg-[#F7F8FA] px-3 py-2 text-xs text-[#6B7280]">
          <span className="font-bold">Tracking:</span> <span className="capitalize">{label}</span>
        </div>
      )}

      {state === 'saved' ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#EFF6FF] bg-[#EFF6FF] p-3">
          <CheckCircle size={20} className="shrink-0 text-[#2563EB]" />
          <p className="text-sm font-bold text-[#1A1A2E]">
            Alerts on. <a href="/saved" className="text-[#4A3AFF] hover:text-[#3A2AE0]">Manage in Saved</a>.
          </p>
        </div>
      ) : auth === 'in' ? (
        <button
          type="button"
          onClick={enableAlerts}
          disabled={state === 'saving'}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-70"
        >
          {state === 'saving' ? (
            <><Loader2 size={15} className="animate-spin" /> Setting up…</>
          ) : (
            <><Bell size={15} /> Turn on alerts</>
          )}
        </button>
      ) : (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSignIn((open) => !open)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
          >
            {showSignIn ? <><X size={15} /> Close</> : <><LogIn size={15} /> Sign in to get alerts</>}
          </button>
          {showSignIn && (
            <div className="mt-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-lg">
              <p className="text-sm font-bold text-[#1A1A2E]">Email alerts for this search</p>
              <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                Enter your email — we&apos;ll send a secure link. New here? Your account is created automatically, no password.
              </p>
              <div className="mt-3">
                <SupabaseLoginForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} nextPath={href} allowSignUp />
              </div>
            </div>
          )}
        </div>
      )}

      {state === 'error' && <p className="mt-2 text-sm font-semibold text-red-600">{message}</p>}
    </div>
  );
}
