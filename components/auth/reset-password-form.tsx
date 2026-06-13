'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { validatePassword } from '@/lib/auth/validation';

type Phase = 'checking' | 'ready' | 'no-session' | 'saving' | 'done';

export function ResetPasswordForm() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setPhase('no-session');
      return;
    }
    let active = true;
    let settled = false;

    const ready = () => {
      if (active && !settled) {
        settled = true;
        setPhase('ready');
      }
    };
    const noSession = () => {
      if (active && !settled) {
        settled = true;
        setPhase('no-session');
      }
    };

    // The recovery token arrives either as ?code= (PKCE) or #access_token (implicit).
    // The browser client auto-processes it and fires PASSWORD_RECOVERY / SIGNED_IN.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session?.user) ready();
    });

    // Fast path: a session already established (e.g. via the server callback) — reads
    // local storage/cookies without a network round-trip that could hang the spinner.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) ready();
    }).catch(() => undefined);

    const hasRecoveryToken =
      typeof window !== 'undefined' &&
      (window.location.search.includes('code=') || window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery'));

    // Never hang on "verifying". If a token is present give the client a moment to
    // process it; otherwise resolve quickly so the user isn't stuck.
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) ready();
        else noSession();
      } catch {
        noSession();
      }
    }, hasRecoveryToken ? 5000 : 1500);

    return () => {
      active = false;
      settled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Password reset is not available on this deployment.');
      return;
    }

    setPhase('saving');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      const message = /session|jwt|token|missing/i.test(updateError.message)
        ? 'Your reset link has expired or is invalid. Request a new one from the sign-in screen.'
        : updateError.message || 'Could not update your password.';
      setError(message);
      setPhase('ready');
      return;
    }

    setPhase('done');
    setTimeout(() => window.location.assign('/dashboard'), 1200);
  }

  if (phase === 'checking') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm font-bold text-[#9CA3AF] shadow-sm">
        <Loader2 size={18} className="animate-spin text-[#4A3AFF]" /> Verifying your reset link…
      </div>
    );
  }

  if (phase === 'no-session') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle size={18} />
          <h2 className="text-base font-bold">Reset link expired or invalid</h2>
        </div>
        <p className="mt-2 text-sm font-semibold text-amber-700">
          Password reset links can only be used once and expire after a short time. Request a fresh one from the sign-in screen.
        </p>
        <a href="/login" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]">
          Back to sign in <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="rounded-xl border border-[#E6FBF7] bg-[#E6FBF7] p-6 text-center shadow-sm">
        <CheckCircle size={32} className="mx-auto text-[#00C9A7]" />
        <h2 className="mt-3 text-lg font-bold text-[#1A1A2E]">Password updated</h2>
        <p className="mt-2 text-sm text-[#6B7280]">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-[#1A1A2E]">Choose a new password</h2>
      <p className="mt-1 text-sm text-[#6B7280]">Set a new password for your Proppd account.</p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="mt-5 grid gap-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          New password
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
            <Lock size={16} className="shrink-0 text-[#9CA3AF]" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
              placeholder="At least 8 characters, letters and numbers"
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="shrink-0 text-[#9CA3AF] transition hover:text-[#1A1A2E]" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          Confirm password
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
            <Lock size={16} className="shrink-0 text-[#9CA3AF]" />
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              required
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={phase === 'saving'}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
        >
          {phase === 'saving' ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : <>Update password <ArrowRight size={14} /></>}
        </button>
      </div>
    </form>
  );
}
