'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { SignUpForm } from './signup-form';
import { SupabaseLoginForm } from './supabase-login-form';

export type AuthMode = 'login' | 'signup';

type AuthModalProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
};

// NEXT_PUBLIC_* values are inlined into the client bundle only when referenced
// as literal property accesses, so this cannot go through getSupabaseBrowserConfig.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function AuthModal({ mode, onModeChange, onClose }: AuthModalProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Sign in' : 'Create account'}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F7F8FA] hover:text-[#1A1A2E]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex gap-2 rounded-lg bg-[#F7F8FA] p-1">
          <ModeTab active={mode === 'login'} onClick={() => onModeChange('login')}>Sign in</ModeTab>
          <ModeTab active={mode === 'signup'} onClick={() => onModeChange('signup')}>Create account</ModeTab>
        </div>

        <div className="mt-6">
          {mode === 'login' ? (
            <>
              <h2 className="text-xl font-bold text-[#1A1A2E]">Welcome back</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Sign in with your email and password.</p>
              <div className="mt-5">
                <SupabaseLoginForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} nextPath="/dashboard" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#1A1A2E]">Create your account</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Set an email and password to manage listings and leads.</p>
              <div className="mt-5">
                <SignUpForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} />
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-[#9CA3AF]">
          By continuing you agree to our{' '}
          <a href="/terms" className="font-bold text-[#4A3AFF]">Terms</a> and{' '}
          <a href="/privacy" className="font-bold text-[#4A3AFF]">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

function ModeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-4 py-2 text-sm font-bold transition ${
        active ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1A2E]'
      }`}
    >
      {children}
    </button>
  );
}
