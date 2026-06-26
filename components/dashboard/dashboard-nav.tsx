'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, ListPlus, MessageCircle, User, BarChart3, Menu, X, ChevronRight, Plus, CalendarClock, CreditCard, Handshake } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', helper: 'Start here', href: '/dashboard', icon: BarChart3 },
  { label: 'Leads', helper: 'Reply and follow up', href: '/dashboard/leads', icon: MessageCircle },
  { label: 'Viewings', helper: 'Upcoming schedule', href: '/dashboard/viewings', icon: CalendarClock },
  { label: 'Deals', helper: 'Sale pipeline', href: '/dashboard/deals', icon: Handshake },
  { label: 'Listings', helper: 'Create and edit stock', href: '/dashboard/listings', icon: ListPlus },
  { label: 'Profile', helper: 'Public agent details', href: '/dashboard/profile', icon: User },
  { label: 'Billing', helper: 'Plan and payments', href: '/dashboard/billing', icon: CreditCard },
];

interface DashboardNavProps {
  currentPath?: string;
}

export function DashboardNav({ currentPath }: DashboardNavProps = {}) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname ?? '/dashboard';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#4A3AFF] text-white shadow-lg lg:hidden"
        aria-label="Open dashboard navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <nav className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-4">
              <span>
                <span className="block text-sm font-bold text-[#1A1A2E]">Agent CRM</span>
                <span className="block text-xs font-bold text-[#9CA3AF]">Pick what you need to do next.</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-[#6B7280] hover:text-[#1A1A2E]">
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              {navItems.map((item) => {
                const isActive = activePath === item.href || (item.href !== '/dashboard' && activePath.startsWith(item.href));
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      isActive ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A2E]'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>
                      <span className="block">{item.label}</span>
                      <span className="block text-[11px] font-bold opacity-70">{item.helper}</span>
                    </span>
                  </a>
                );
              })}
              <a
                href="/dashboard/listings/new"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#4A3AFF] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
              >
                <Plus size={16} /> Add listing
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="px-3 pb-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Agent CRM</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[#9CA3AF]">Simple routes for leads, stock, and profile setup.</p>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePath === item.href || (item.href !== '/dashboard' && activePath.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition ${
                    isActive ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A2E]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>
                      <span className="block">{item.label}</span>
                      <span className="block text-[11px] font-bold opacity-65">{item.helper}</span>
                    </span>
                  </span>
                  {isActive && <ChevronRight size={14} />}
                </a>
              );
            })}
          </div>

          <a href="/dashboard/listings/new" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#4A3AFF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
            <Plus size={16} /> Add listing
          </a>

          <div className="mt-4 border-t border-[#E5E7EB] pt-3">
            <a href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A2E]">
              <Home size={18} />
              Back to site
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
