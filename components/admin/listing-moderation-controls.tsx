'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Star, AlertCircle } from 'lucide-react';

type Status = 'draft' | 'pending_review' | 'available' | 'under_offer' | 'sold' | 'rented' | 'archived';

type Props = {
  slug: string;
  currentStatus: string;
  isFeatured: boolean;
  enabled: boolean;
};

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: 'pending_review', label: 'Pending review' },
  { value: 'available', label: 'Available' },
  { value: 'under_offer', label: 'Under offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export function ListingModerationControls({ slug, currentStatus, isFeatured, enabled }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [featured, setFeatured] = useState(isFeatured);
  const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; message: string }>({ kind: 'idle', message: '' });

  async function patch(payload: { status?: Status; isFeatured?: boolean }) {
    setState({ kind: 'saving', message: '' });
    try {
      const response = await fetch(`/api/admin/listings/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState({ kind: 'error', message: data?.error || 'Update failed.' });
        return false;
      }
      setState({ kind: 'saved', message: 'Saved' });
      router.refresh();
      return true;
    } catch {
      setState({ kind: 'error', message: 'Network error.' });
      return false;
    }
  }

  if (!enabled) {
    return <p className="text-xs font-bold text-[#9CA3AF]">Connect a live database to moderate.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="sr-only" htmlFor={`status-${slug}`}>Listing status</label>
      <select
        id={`status-${slug}`}
        value={status}
        disabled={state.kind === 'saving'}
        onChange={async (e) => {
          const next = e.target.value as Status;
          const prev = status;
          setStatus(next);
          const ok = await patch({ status: next });
          if (!ok) setStatus(prev);
        }}
        className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button
        type="button"
        disabled={state.kind === 'saving'}
        onClick={async () => {
          const next = !featured;
          setFeatured(next);
          const ok = await patch({ isFeatured: next });
          if (!ok) setFeatured(!next);
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
          featured ? 'bg-[#4A3AFF] text-white hover:bg-[#3A2AE0]' : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#4A3AFF] hover:text-[#4A3AFF]'
        }`}
      >
        <Star size={13} className={featured ? 'fill-white' : ''} /> {featured ? 'Featured' : 'Feature'}
      </button>

      <span className="flex items-center gap-1 text-[11px] font-bold">
        {state.kind === 'saving' && <span className="flex items-center gap-1 text-[#4A3AFF]"><Loader2 size={11} className="animate-spin" /> Saving…</span>}
        {state.kind === 'saved' && <span className="flex items-center gap-1 text-[#2563EB]"><Check size={11} /> {state.message}</span>}
        {state.kind === 'error' && <span className="flex items-center gap-1 text-red-600"><AlertCircle size={11} /> {state.message}</span>}
      </span>
    </div>
  );
}
