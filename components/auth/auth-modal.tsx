'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Home, X } from 'lucide-react';
import { SignUpForm } from './signup-form';
import { SupabaseLoginForm } from './supabase-login-form';

export type AuthMode = 'login' | 'signup';
type Audience = 'choose' | 'owner' | 'agent';

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
  // "Request access" is agent-only, so jump straight there; otherwise ask who they are.
  const [audience, setAudience] = useState<Audience>(mode === 'signup' ? 'agent' : 'choose');

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
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center" role="dialog" aria-modal="true" aria-label="Sign in to Proppd">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F7F8FA] hover:text-[#1A1A2E]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {audience === 'choose' ? (
          <>
            <h2 className="text-2xl font-bold tracking-[-.02em] text-[#1A1A2E]">Sign in to Proppd</h2>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">First, which best describes you?</p>

            <div className="mt-6 grid gap-3">
              <ChoiceCard
                icon={<Home size={22} />}
                title="I'm a seller or landlord"
                subtitle="Value, list, and track my own property"
                onClick={() => setAudience('owner')}
              />
              <ChoiceCard
                icon={<Building2 size={22} />}
                title="I'm an agent or agency"
                subtitle="Manage listings and leads for clients"
                onClick={() => setAudience('agent')}
              />
            </div>
          </>
        ) : audience === 'owner' ? (
          <>
            <BackButton onClick={() => setAudience('choose')} />
            <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Home size={22} />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-[-.02em] text-[#1A1A2E]">Sellers &amp; landlords</h2>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              Enter your email and we&apos;ll send a secure link. New here? Your account is created automatically — no password.
            </p>
            <div className="mt-5">
              <SupabaseLoginForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} nextPath="/my-properties" allowSignUp />
            </div>
          </>
        ) : (
          <>
            <BackButton onClick={() => setAudience('choose')} />
            <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Building2 size={22} />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-[-.02em] text-[#1A1A2E]">Agents &amp; agencies</h2>

            <div className="mt-5 flex gap-2 rounded-lg bg-[#F7F8FA] p-1">
              <ModeTab active={mode === 'login'} onClick={() => onModeChange('login')}>Sign in</ModeTab>
              <ModeTab active={mode === 'signup'} onClick={() => onModeChange('signup')}>Request access</ModeTab>
            </div>

            <div className="mt-5">
              {mode === 'login' ? (
                <>
                  <p className="text-sm font-semibold text-[#6B7280]">Enter your approved email and we&apos;ll send a one-time login link.</p>
                  <div className="mt-4">
                    <SupabaseLoginForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} nextPath="/dashboard" />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#6B7280]">Share your agency details. Approved users continue by magic link — no password setup.</p>
                  <div className="mt-4">
                    <SignUpForm supabaseUrl={SUPABASE_URL} publishableKey={SUPABASE_PUBLISHABLE_KEY} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-[#9CA3AF]">
          By continuing you agree to our{' '}
          <a href="/terms" className="font-bold text-[#4A3AFF]">Terms</a> and{' '}
          <a href="/privacy" className="font-bold text-[#4A3AFF]">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

function ChoiceCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#4A3AFF] hover:bg-[#F7F8FA]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-base font-bold text-[#1A1A2E]">{title}</span>
        <span className="block text-sm font-semibold text-[#6B7280]">{subtitle}</span>
      </span>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B7280] transition hover:text-[#1A1A2E]">
      <ArrowLeft size={15} /> Back
    </button>
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
