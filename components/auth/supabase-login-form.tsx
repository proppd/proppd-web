'use client';

import { createClient } from '@supabase/supabase-js';
import type React from 'react';
import { useMemo, useState } from 'react';

type LoginFormProps = {
  supabaseUrl?: string;
  publishableKey?: string;
  nextPath?: string;
};

type SubmitState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const INVITE_EMAIL = 'info@proppd.com';

export function SupabaseLoginForm({ supabaseUrl, publishableKey, nextPath = '/dashboard/listings' }: LoginFormProps) {
  const [email, setEmail] = useState(INVITE_EMAIL);
  const [state, setState] = useState<SubmitState>({
    status: 'idle',
    message: 'Enter the email linked to your Proppd agent or admin profile.',
  });
  const isConfigured = Boolean(supabaseUrl && publishableKey);

  const supabase = useMemo(() => {
    if (!supabaseUrl || !publishableKey) return null;
    return createClient(supabaseUrl, publishableKey, { auth: { persistSession: true, autoRefreshToken: true } });
  }, [publishableKey, supabaseUrl]);

  const cleanEmail = email.trim().toLowerCase();
  const isValidEmail = cleanEmail.includes('@') && cleanEmail.includes('.');
  const isAdminEmail = cleanEmail === INVITE_EMAIL;

  async function submitMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail) {
      setState({ status: 'error', message: 'Enter a valid work email address.' });
      return;
    }

    if (!supabase) {
      const subject = encodeURIComponent('Proppd access request');
      const body = encodeURIComponent(
        [`Please approve Proppd access for: ${cleanEmail}`, '', 'Agency:', 'Role:', 'Notes:'].join('\n'),
      );
      setState({ status: 'success', message: 'Opening your email app with a ready-to-send access request.' });
      window.location.href = `mailto:${INVITE_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    setState({ status: 'loading', message: isAdminEmail ? 'Sending admin login link…' : 'Sending secure login link…' });

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        shouldCreateUser: isAdminEmail,
      },
    });

    if (error) {
      setState({ status: 'error', message: error.message || 'Could not send the login link. Please contact info@proppd.com.' });
      return;
    }

    setState({ status: 'success', message: isAdminEmail ? 'Check info@proppd.com for the admin login link.' : 'Check your inbox for the secure Proppd login link.' });
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-4 sm:p-5">
      <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitMagicLink}>
        <label className="sr-only" htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          className="rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-[#050A30] outline-none transition placeholder:text-slate-400 focus:border-[#3B49FF] focus:ring-4 focus:ring-[#3B49FF]/10"
          type="email"
          placeholder="info@proppd.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
        <button
          className="rounded-full bg-[#050A30] px-6 py-4 text-sm font-black text-white transition hover:bg-[#3B49FF] disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={state.status === 'loading'}
        >
          {state.status === 'loading' ? 'Sending…' : isConfigured ? (isAdminEmail ? 'Send admin link' : 'Send login link') : 'Request invite'}
        </button>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p
          aria-live="polite"
          className={`text-sm font-bold leading-6 ${state.status === 'error' ? 'text-red-600' : state.status === 'success' ? 'text-[#0f766e]' : 'text-slate-600'}`}
        >
          {isConfigured ? state.message : 'The request button prepares a ready-to-send invite email until live login links are enabled.'}
        </p>
        <a
          className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]"
          href={`mailto:${INVITE_EMAIL}?subject=${encodeURIComponent('Proppd access request')}&body=${encodeURIComponent(
            [`Please approve Proppd access for: ${cleanEmail || '[add your work email]'}`, '', 'Agency:', 'Role:', 'Notes:'].join('\n'),
          )}`}
        >
          Email request
        </a>
      </div>

      {state.status === 'success' ? (
        <div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800">
          <p className="font-black uppercase tracking-[.14em]">What to check next</p>
          <p className="mt-2">Look for the message from Proppd or Supabase, then check spam and promotions if it does not land quickly.</p>
        </div>
      ) : null}
    </div>
  );
}
