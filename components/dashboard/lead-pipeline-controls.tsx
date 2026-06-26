'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, AlertCircle, StickyNote, CalendarClock } from 'lucide-react';
import { LEAD_PIPELINE_STATUSES, formatLeadStatus, type LeadStatus } from '@/lib/leads/pipeline';

type Props = {
  leadId: string;
  currentStatus: LeadStatus;
  enabled: boolean;
};

export function LeadPipelineControls({ leadId, currentStatus, enabled }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingOpen, setViewingOpen] = useState(false);
  const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; message: string }>({ kind: 'idle', message: '' });

  async function send(body: { status?: LeadStatus; note?: string; viewing_at?: string }) {
    setState({ kind: 'saving', message: '' });
    try {
      const response = await fetch(`/api/dashboard/leads/${encodeURIComponent(leadId)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
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
    return <p className="text-xs font-bold text-[#9CA3AF]">Connect a live database to manage this lead.</p>;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label className="flex items-center gap-2 text-xs font-bold text-[#9CA3AF]">
        Stage
        <select
          value={status}
          disabled={state.kind === 'saving'}
          onChange={(e) => {
            const next = e.target.value as LeadStatus;
            setStatus(next);
            if (next === 'viewing_booked') {
              setViewingOpen(true);
            } else {
              setViewingOpen(false);
              void (async () => {
                const prev = status;
                const ok = await send({ status: next });
                if (!ok) setStatus(prev);
              })();
            }
          }}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
        >
          {LEAD_PIPELINE_STATUSES.map((s) => (
            <option key={s} value={s}>{formatLeadStatus(s)}</option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => setNoteOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
      >
        <StickyNote size={13} /> Note
      </button>

      <span className="flex items-center gap-1 text-[11px] font-bold">
        {state.kind === 'saving' && <span className="flex items-center gap-1 text-[#4A3AFF]"><Loader2 size={11} className="animate-spin" /> Saving…</span>}
        {state.kind === 'saved' && <span className="flex items-center gap-1 text-[#2563EB]"><Check size={11} /> {state.message}</span>}
        {state.kind === 'error' && <span className="flex items-center gap-1 text-red-600"><AlertCircle size={11} /> {state.message}</span>}
      </span>

      {viewingOpen && (
        <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 sm:w-auto">
          <CalendarClock size={14} className="shrink-0 text-[#2563EB]" />
          <span className="text-xs font-bold text-[#2563EB]">Viewing date &amp; time</span>
          <input
            type="datetime-local"
            value={viewingDate}
            onChange={(e) => setViewingDate(e.target.value)}
            className="rounded-lg border border-[#BFDBFE] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] outline-none focus:border-[#2563EB]"
          />
          <button
            type="button"
            disabled={state.kind === 'saving' || !viewingDate}
            onClick={async () => {
              const prev = status === 'viewing_booked' ? currentStatus : status;
              const ok = await send({ status: 'viewing_booked', viewing_at: viewingDate });
              if (!ok) setStatus(prev as LeadStatus);
              else setViewingOpen(false);
            }}
            className="rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => { setViewingOpen(false); setStatus(currentStatus); }}
            className="text-xs font-bold text-[#6B7280] hover:text-[#4A3AFF]"
          >
            Cancel
          </button>
        </div>
      )}

      {noteOpen && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a private note…"
            className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2 text-xs font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF] sm:w-56"
          />
          <button
            type="button"
            disabled={state.kind === 'saving' || note.trim().length < 2}
            onClick={async () => {
              const ok = await send({ note });
              if (ok) {
                setNote('');
                setNoteOpen(false);
              }
            }}
            className="rounded-lg bg-[#4A3AFF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
