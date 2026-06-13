'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { validateLoginInput, isValidAuthEmail } from '@/lib/auth/validation';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

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

export function SupabaseLoginForm({ supabaseUrl, publishableKey, nextPath = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [state, setState] = useState<SubmitState>({ status: 'idle', message: '' });
  const isConfigured = Boolean(supabaseUrl && publishableKey);

  const supabase = useMemo(() => {
    if (!supabaseUrl || !publishableKey) return null;
    return getBrowserSupabaseClient();
  }, [publishableKey, supabaseUrl]);

  const cleanEmail = email.trim().toLowerCase();

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (resetMode) {
      await submitPasswordReset();
      return;
    }

    const valid = validateLoginInput(cleanEmail, password);
    if (valid.success === false) {
      setState({ status: 'error', message: valid.errors[0] });
      return;
    }

    if (!supabase) {
      const subject = encodeURIComponent('Proppd access request');
      const body = encodeURIComponent(
        [`Please approve Proppd access for: ${cleanEmail}`, '', 'Agency:', 'Role:', 'Notes:'].join('\n'),
      );
      setState({ status: 'success', message: 'Opening your email app with a ready-to-send access request.' });
      window.location.href = `mailto:info@proppd.com?subject=${subject}&body=${body}`;
      return;
    }

    setState({ status: 'loading', message: 'Signing you in…' });

    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    if (error) {
      setState({ status: 'error', message: error.message || 'Incorrect email or password.' });
      return;
    }

    setState({ status: 'success', message: 'Signed in — taking you to your dashboard.' });
    window.location.assign(nextPath);
  }

  async function submitPasswordReset() {
    if (!isValidAuthEmail(cleanEmail)) {
      setState({ status: 'error', message: 'Enter a valid email address.' });
      return;
    }

    if (!supabase) {
      setState({ status: 'error', message: 'Password reset is not available yet — contact info@proppd.com.' });
      return;
    }

    setState({ status: 'loading', message: 'Sending password reset email…' });

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setState({ status: 'error', message: error.message || 'Could not send the reset email.' });
      return;
    }

    setState({ status: 'success', message: 'Check your inbox for the password reset email.' });
  }

  return (
    <div>
      <form className="grid gap-4" onSubmit={submitLogin}>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          Email address
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
            <Mail size={16} className="shrink-0 text-[#9CA3AF]" />
            <input
              id="login-email"
              className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
              type="email"
              placeholder="you@agency.co.za"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>
        </label>

        {!resetMode && (
          <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
            Password
            <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
              <Lock size={16} className="shrink-0 text-[#9CA3AF]" />
              <input
                id="login-password"
                className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="shrink-0 text-[#9CA3AF] transition hover:text-[#1A1A2E]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
        )}

        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
          type="submit"
          disabled={state.status === 'loading'}
        >
          {state.status === 'loading' ? (
            'Working…'
          ) : resetMode ? (
            <>Send reset email <ArrowRight size={14} /></>
          ) : isConfigured ? (
            <>Sign in <ArrowRight size={14} /></>
          ) : (
            <>Request invite <ArrowRight size={14} /></>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setResetMode((value) => !value);
            setState({ status: 'idle', message: '' });
          }}
          className="justify-self-start text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
        >
          {resetMode ? 'Back to sign in' : 'Forgot password?'}
        </button>
      </form>

      {state.status !== 'idle' && state.message && (
        <div className={`mt-4 flex items-start gap-2.5 rounded-lg p-3 text-sm font-bold ${
          state.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#E6FBF7] text-[#00C9A7]'
        }`}>
          {state.status === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{state.message}</span>
        </div>
      )}
    </div>
  );
}
