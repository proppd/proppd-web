'use client';

import { MessageSquare } from 'lucide-react';

// Persistent bottom action bar on mobile listing pages so the primary action
// (enquire) is always one tap away without scrolling back to the form.
// Hidden on lg+ where the enquiry form is already sticky in the sidebar.
export function MobileEnquiryBar({ price, agent }: { price: string; agent: string }) {
  function scrollToEnquiry() {
    const target = document.getElementById('enquiry');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Move focus to the first field for keyboard/screen-reader users.
      target.querySelector<HTMLElement>('input, textarea, select, button')?.focus({ preventScroll: true });
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-tight text-[#1A1A2E]">{price}</p>
          <p className="truncate text-xs font-semibold text-[#9CA3AF]">Contact {agent}</p>
        </div>
        <button
          type="button"
          onClick={scrollToEnquiry}
          aria-label={`Enquire about this listing with ${agent}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#4A3AFF]/20 transition hover:bg-[#3A2AE0]"
        >
          <MessageSquare size={16} /> Enquire
        </button>
      </div>
    </div>
  );
}
