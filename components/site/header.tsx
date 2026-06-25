'use client';

import { useEffect, useState } from 'react';
import { Menu, X, Heart, ChevronDown, Users, Building2, Briefcase } from 'lucide-react';
import { AuthModal, type AuthMode } from '@/components/auth/auth-modal';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { ProppdLogo } from './logo';

const primaryNav = [
  ['Buy', '/properties/for-sale'],
  ['Rent', '/properties/to-rent'],
  ['Sell', '/my-properties'],
];

// Consumer-facing: find an agent or agency to help you buy, sell or rent.
const findAgentMenu = [
  { label: 'Find an agent', helper: 'Browse verified agents', href: '/agents', icon: Users },
  { label: 'Browse agencies', helper: 'Agency directory', href: '/agencies', icon: Building2 },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  // Workspace users (agent / agency / admin) get the Dashboard; consumers get
  // the My-enquiries inbox. Defaults to false until the probe resolves.
  const [canAccessWorkspace, setCanAccessWorkspace] = useState(false);

  const openAuth = (mode: AuthMode) => {
    setMobileOpen(false);
    setAuthMode(mode);
  };

  // Track auth so the Sign in control disappears once signed in, and resolve
  // the user's role so the header shows the right destination for them.
  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;
    let active = true;

    const refreshAccess = async (isSignedIn: boolean) => {
      if (!isSignedIn) {
        if (active) setCanAccessWorkspace(false);
        return;
      }
      try {
        const res = await fetch('/api/me/access', { cache: 'no-store' });
        const body = await res.json();
        if (active) setCanAccessWorkspace(Boolean(body?.canAccessWorkspace));
      } catch {
        if (active) setCanAccessWorkspace(false);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      const isSignedIn = Boolean(data.user);
      if (active) setSignedIn(isSignedIn);
      void refreshAccess(isSignedIn);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const isSignedIn = Boolean(session?.user);
      setSignedIn(isSignedIn);
      void refreshAccess(isSignedIn);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    setMobileOpen(false);
    await getBrowserSupabaseClient()?.auth.signOut();
    // Full reset so any gated page (dashboard/admin) re-evaluates server-side.
    window.location.assign('/');
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Keyboard skip link — first focusable element, bypasses the nav */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[#4A3AFF] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1A1A2E] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <a href="/" aria-label="Proppd home" className="shrink-0">
            <ProppdLogo compact />
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#6B7280] lg:flex">
            {primaryNav.map(([label, href]) => (
              <a key={href} className="transition hover:text-[#1A1A2E]" href={href}>{label}</a>
            ))}

            {/* Agents dropdown (consumer: find an agent) — hover / keyboard focus-within */}
            <div className="relative group">
              <a
                href="/agents"
                className="inline-flex items-center gap-1 transition hover:text-[#1A1A2E] group-hover:text-[#1A1A2E]"
              >
                Agents
                <ChevronDown size={14} className="transition group-hover:rotate-180" />
              </a>
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="w-72 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl shadow-black/5">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">Find an agent</p>
                  {findAgentMenu.map(({ label, helper, href, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#F7F8FA]"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                        <Icon size={16} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#1A1A2E]">{label}</span>
                        <span className="block text-xs font-semibold text-[#9CA3AF]">{helper}</span>
                      </span>
                    </a>
                  ))}
                  <a href="/for-agents" className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-[#EFF6FF] px-3 py-2.5 transition hover:bg-[#DBEAFE]">
                    <span>
                      <span className="block text-sm font-bold text-[#1A1A2E]">Are you an agent?</span>
                      <span className="block text-xs font-semibold text-[#2563EB]">Proppd for Agents →</span>
                    </span>
                    <Briefcase size={16} className="text-[#2563EB]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Persistent professional path */}
            <a href="/for-agents" className="inline-flex items-center gap-1.5 font-semibold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
              <Briefcase size={15} /> For agents
            </a>
          </nav>

          {/* Right side — clean, minimal */}
          <div className="flex items-center gap-2">
            <a href="/saved" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F7F8FA] hover:text-[#1A1A2E]" aria-label="Saved homes">
              <Heart size={18} />
            </a>
            <a className="rounded-lg bg-[#4A3AFF] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3A2AE0] sm:px-4" href="/properties">
              Search
            </a>
            {signedIn ? (
              <>
                {canAccessWorkspace ? (
                  <a
                    href="/dashboard"
                    className="hidden rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex"
                  >
                    Dashboard
                  </a>
                ) : (
                  <a
                    href="/account/enquiries"
                    className="hidden rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex"
                  >
                    My enquiries
                  </a>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#1A1A2E] sm:inline-flex"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="hidden rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Skip-link target — start of page content, just past the nav */}
      <span id="main-content" tabIndex={-1} className="sr-only">
        Start of main content
      </span>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />

          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-4">
              <a href="/" aria-label="Proppd home" onClick={() => setMobileOpen(false)}>
                <ProppdLogo compact />
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280] hover:text-[#1A1A2E]"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="px-3 py-3">
              {primaryNav.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F7F8FA]"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Find an agent (consumer) */}
            <div className="border-t border-[#E5E7EB] px-3 py-3">
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">Find an agent</p>
              {findAgentMenu.map(({ label, helper, href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F7F8FA]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <Icon size={16} />
                  </span>
                  <span>
                    <span className="block">{label}</span>
                    <span className="block text-[11px] font-semibold text-[#9CA3AF]">{helper}</span>
                  </span>
                </a>
              ))}
            </div>

            {/* Professional path */}
            <div className="border-t border-[#E5E7EB] px-3 py-3">
              <a
                href="/for-agents"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between gap-3 rounded-lg bg-[#EFF6FF] px-3 py-3 text-sm font-bold text-[#1A1A2E] transition hover:bg-[#DBEAFE]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB]">
                    <Briefcase size={16} />
                  </span>
                  Proppd for Agents
                </span>
                <span className="text-[#2563EB]">→</span>
              </a>
            </div>

            <div className="border-t border-[#E5E7EB] px-3 py-3">
              <a href="/saved" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F7F8FA]">
                Saved homes
              </a>
            </div>

            <div className="border-t border-[#E5E7EB] px-3 py-3">
              {signedIn ? (
                <>
                  {canAccessWorkspace ? (
                    <a
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-lg bg-[#4A3AFF] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3A2AE0]"
                    >
                      Go to dashboard
                    </a>
                  ) : (
                    <a
                      href="/account/enquiries"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-lg bg-[#4A3AFF] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3A2AE0]"
                    >
                      My enquiries
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-2 block w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-center text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="block w-full rounded-lg bg-[#4A3AFF] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3A2AE0]"
                  >
                    Sign in
                  </button>
                  <p className="mt-3 px-3 text-center text-xs text-[#9CA3AF]">
                    Need agency access?{' '}
                    <button type="button" onClick={() => openAuth('signup')} className="font-bold text-[#4A3AFF]">
                      Request access
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {authMode && (
        <AuthModal mode={authMode} onModeChange={setAuthMode} onClose={() => setAuthMode(null)} />
      )}
    </>
  );
}
