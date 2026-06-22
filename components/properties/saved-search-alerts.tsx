'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Mail } from 'lucide-react';

interface SavedSearchAlertsProps {
  searchParams?: {
    q?: string;
    location?: string;
    purpose?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  };
}

export function SavedSearchAlerts({ searchParams }: SavedSearchAlertsProps) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Store in localStorage
    const alerts = JSON.parse(localStorage.getItem('proppd…erts') || '[]');
    alerts.push({
      email,
      frequency,
      filters: searchParams,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('proppd…erts', JSON.stringify(alerts));

    setSubmitted(true);
    setEmail('');
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-[#EFF6FF] bg-[#EFF6FF] p-5">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#2563EB]" />
          <div>
            <p className="text-sm font-bold text-[#1A1A2E]">Alert saved!</p>
            <p className="text-xs text-[#6B7280]">
              We'll notify you at {email || 'your email'} when matching properties appear.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-3 text-xs font-bold text-[#4A3AFF] hover:text-[#3A2AE0]"
        >
          Set up another alert
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-[#4A3AFF]" />
        <h3 className="text-base font-bold text-[#1A1A2E]">Get alerts</h3>
      </div>
      <p className="mt-1 text-sm text-[#6B7280]">
        Be the first to know when new properties match this search.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          Email address
          <div className="relative mt-1.5">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] py-2.5 pl-9 pr-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
              placeholder="you@example.com"
              required
            />
          </div>
        </label>

        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          Alert frequency
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
          >
            <option value="instant">Instant — as soon as listed</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly summary</option>
          </select>
        </label>

        {searchParams && (
          <div className="rounded-lg bg-[#F7F8FA] px-3 py-2 text-xs text-[#6B7280]">
            <span className="font-bold">Tracking:</span>{' '}
            {searchParams.location && `Location: ${searchParams.location}`}
            {searchParams.q && ` · Search: "${searchParams.q}"`}
            {searchParams.purpose && ` · ${searchParams.purpose}`}
            {searchParams.bedrooms && ` · ${searchParams.bedrooms}+ beds`}
          </div>
        )}

        <button
          type="submit"
          className="rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
        >
          Save alert
        </button>
      </form>
    </div>
  );
}
