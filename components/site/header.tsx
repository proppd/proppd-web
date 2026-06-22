'use client';

import { useEffect, useState } from 'react';
import { Menu, X, Heart, ChevronDown, Users, Building2, LayoutDashboard, Wrench, Calculator } from 'lucide-react';
import { AuthModal, type AuthMode } from '@/components/auth/auth-modal';
import { ProppdLogo } from './logo';

const primaryNav = [
  ['Buy', '/properties/for-sale'],
  ['Rent', '/properties/to-rent'],
  ['Sell', '/home-values'],
];

const agentMenu = [
  { label: 'Agents', helper: 'Browse verified agents', href: '/agents', icon: Users },
  { label: 'Agencies', helper: 'Agency directory', href: '/agencies', icon: Building2 },
  { label: 'CRM', helper: 'Leads & workspace', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tools', helper: 'AgentOS & workflow', href: '/list-with-us', icon: Wrench },
  { label: 'Valuations', helper: 'Request a valuation', href: '/request-valuation', icon: Calculator },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  const openAuth = (mode: AuthMode) => {
    setMobileOpen(false);
    setAuthMode(mode);
  };

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

            {/* Agents dropdown — hover on desktop, keyboard via focus-within */}
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
                  <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">For agents &amp; agencies</p>
                  {agentMenu.map(({ label, helper, href, icon: Icon }) => (
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
                </div>
              </div>
            </div>
          </nav>

          {/* Right side — clean, minimal */}
          <div className="flex items-center gap-2">
            <a href="/saved" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F7F8FA] hover:text-[#1A1A2E]" aria-label="Saved homes">
              <Heart size={18} />
            </a>
            <a className="rounded-lg bg-[#4A3AFF] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3A2AE0] sm:px-4" href="/properties">
              Search
            </a>
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="hidden rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

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

            {/* Agents group */}
            <div className="border-t border-[#E5E7EB] px-3 py-3">
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">For agents &amp; agencies</p>
              {agentMenu.map(({ label, helper, href, icon: Icon }) => (
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

            <div className="border-t border-[#E5E7EB] px-3 py-3">
              <a href="/saved" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F7F8FA]">
                Saved homes
              </a>
            </div>

            <div className="border-t border-[#E5E7EB] px-3 py-3">
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
