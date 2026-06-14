'use client';

import { useActionState, useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { updatePasswordAction, type ResetPasswordState } from '@/app/reset-password/actions';

type Props = {
  // Server-verified: true when the recovery session cookie is present.
  authenticated: boolean;
};

export function ResetPasswordForm({ authenticated }: Props) {
  const [state, formAction, pending] = useActionState<ResetPasswordState, FormData>(updatePasswordAction, {});
  const [show, setShow] = useState(false);

  if (!authenticated) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle size={18} />
          <h2 className="text-base font-bold">Reset link expired or invalid</h2>
        </div>
        <p className="mt-2 text-sm font-semibold text-amber-700">
          Password reset links can only be used once, expire after a short time, and must be opened in the same browser you requested them from. Request a fresh one from the sign-in screen.
        </p>
        <a href="/login" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]">
          Back to sign in <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-[#1A1A2E]">Choose a new password</h2>
      <p className="mt-1 text-sm text-[#6B7280]">Set a new password for your Proppd account.</p>

      {state.error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {state.error}
        </div>
      )}

      <div className="mt-5 grid gap-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          New password
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
            <Lock size={16} className="shrink-0 text-[#9CA3AF]" />
            <input
              name="password"
              type={show ? 'text' : 'password'}
              className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
              placeholder="At least 8 characters, letters and numbers"
              autoComplete="new-password"
              required
              minLength={8}
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
              name="confirm"
              type={show ? 'text' : 'password'}
              className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
        >
          {pending ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : <>Update password <ArrowRight size={14} /></>}
        </button>
      </div>
    </form>
  );
}
