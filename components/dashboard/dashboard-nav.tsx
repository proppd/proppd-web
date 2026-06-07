'use client';

import { useState } from 'react';
import { Home, ListPlus, MessageCircle, User, Settings, BarChart3, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Listings', href: '/dashboard/listings', icon: ListPlus },
  { label: 'Leads', href: '/dashboard/leads', icon: MessageCircle },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

interface DashboardNavProps {
  currentPath: string;
}

export function DashboardNav({ currentPath }: DashboardNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#4A3AFF] text-white shadow-lg lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <nav className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-4">
              <span className="text-sm font-bold text-[#1A1A2E]">Navigation</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-[#6B7280] hover:text-[#1A1A2E]">
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              {navItems.map((item) => {
                const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                      isActive ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A2E]'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                    isActive ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A2E]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </span>
                  {isActive && <ChevronRight size={14} />}
                </a>
              );
            })}
          </div>

          <div className="mt-4 border-t border-[#E5E7EB] pt-3">
            <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A2E]">
              <Home size={18} />
              Back to site
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
