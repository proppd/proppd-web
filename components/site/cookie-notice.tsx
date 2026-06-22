'use client';

import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'proppd.cookie-notice.v1';

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable (private mode); keep the notice hidden rather than nagging on every load.
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Ignore storage failures; the notice will simply reappear next visit.
    }
    setVisible(false);
  };

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie size={20} className="mt-0.5 shrink-0 text-[#4A3AFF]" />
          <p className="text-sm font-semibold leading-6 text-[#6B7280]">
            Proppd uses essential cookies to keep the site working and to understand how it is used. Read our{' '}
            <a className="font-bold text-[#4A3AFF] hover:text-[#3A2AE0]" href="/cookies">cookie policy</a> and{' '}
            <a className="font-bold text-[#4A3AFF] hover:text-[#3A2AE0]" href="/privacy">privacy policy</a>.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
 className="shrink-0 rounded-full bg-[#4A3AFF] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
