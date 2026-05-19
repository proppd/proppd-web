'use client';

import { createClient } from '@supabase/supabase-js';
import type React from 'react';
import { useMemo, useState } from 'react';

type LoginFormProps = {
  supabaseUrl?: string;
  publishableKey?: string;
};

type SubmitState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function SupabaseLoginForm({ supabaseUrl, publishableKey }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>({ status: 'idle', message: 'Enter the email linked to your Proppd agent or admin profile.' });
  const isConfigured = Boolean(supabaseUrl && publishableKey);

  const supabase = useMemo(() => {
    if (!supabaseUrl || !publishableKey) return null;
    return createClient(supabaseUrl, publishableKey, { auth: { persistSession: true, autoRefreshToken: true } });
  }, [publishableKey, supabaseUrl]);

  async function submitMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState({ status: 'error', message: 'Invite-only login is still being connected. Email info@proppd.com from your agency inbox for access.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setState({ status: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setState({ status: 'loading', message: 'Sending secure login link…' });

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setState({ status: 'error', message: error.message || 'Could not send the login link. Please contact info@proppd.com.' });
      return;
    }

    setState({ status: 'success', message: 'Check your inbox for the secure Proppd login link.' });
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-4 sm:p-5">
      <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitMagicLink}>
        <label className="sr-only" htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          className="rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-[#050A30] outline-none transition placeholder:text-slate-400 focus:border-[#3B49FF] focus:ring-4 focus:ring-[#3B49FF]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
          type="email"
          placeholder="you@agency.co.za"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!isConfigured || state.status === 'loading'}
          required
        />
        <button
          className="rounded-full bg-[#050A30] px-6 py-4 text-sm font-black text-white transition hover:bg-[#3B49FF] disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={!isConfigured || state.status === 'loading'}
        >
          {state.status === 'loading' ? 'Sending…' : 'Send login link'}
        </button>
      </form>
      <p className={`mt-4 text-sm font-bold leading-6 ${state.status === 'error' ? 'text-red-600' : state.status === 'success' ? 'text-[#0f766e]' : 'text-slate-600'}`}>
        {isConfigured ? state.message : 'Invite-only login is still being connected. Email info@proppd.com from your agency inbox for access.'}
      </p>
    </div>
  );
}
