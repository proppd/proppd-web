'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { formatLeadStatus, type LeadStageSuggestion } from '@/lib/leads/pipeline';

type Props = {
  leadId: string;
  suggestion: LeadStageSuggestion | null;
  enabled: boolean;
};

export function LeadStageSuggestionControls({ leadId, suggestion, enabled }: Props) {
  const router = useRouter();
  const [note, setNote] = useState(suggestion?.note ?? '');
  const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; message: string }>({ kind: 'idle', message: '' });

  if (!suggestion) {
    return (
      <p className="rounded-2xl bg-[#F7F8FA] p-3 text-xs font-bold leading-5 text-[#6B7280]">
        No one-click stage change is suggested for this lead. Use the full stage controls when a custom outcome is needed.
      </p>
    );
  }

  async function applySuggestion() {
    if (!suggestion) return;

    setState({ kind: 'saving', message: '' });
    try {
      const response = await fetch(`/api/dashboard/leads/${encodeURIComponent(leadId)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: suggestion.status, note }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState({ kind: 'error', message: data?.error || 'Update failed.' });
        return;
      }
      setState({ kind: 'saved', message: `Moved to ${formatLeadStatus(suggestion.status)}` });
      router.refresh();
    } catch {
      setState({ kind: 'error', message: 'Network error.' });
    }
  }

  return (
    <div className="rounded-2xl bg-[#F7F8FA] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">Suggested stage</p>
          <p className="mt-1 text-sm font-bold text-[#1A1A2E]">{formatLeadStatus(suggestion.status)}</p>
        </div>
        <button
          type="button"
          onClick={applySuggestion}
          disabled={state.kind === 'saving' || !enabled}
          title={enabled ? suggestion.label : 'Connect a live database to apply this suggestion'}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1A1A2E] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4A3AFF] disabled:opacity-50"
        >
          {state.kind === 'saving' ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          {suggestion.label}
        </button>
      </div>
      <label className="mt-3 block text-[11px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
        Audit note
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          disabled={!enabled}
          className="mt-1 w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold leading-5 text-[#1A1A2E] outline-none focus:border-[#4A3AFF] disabled:bg-[#F7F8FA] disabled:text-[#6B7280]"
        />
      </label>
      <div className="mt-2 min-h-4 text-[11px] font-bold">
        {!enabled ? <span className="text-[#9CA3AF]">Live database required to apply this shortcut.</span> : null}
        {state.kind === 'saved' ? <span className="inline-flex items-center gap-1 text-[#00C9A7]"><Check size={11} /> {state.message}</span> : null}
        {state.kind === 'error' ? <span className="inline-flex items-center gap-1 text-red-600"><AlertCircle size={11} /> {state.message}</span> : null}
      </div>
    </div>
  );
}
