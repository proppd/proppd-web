'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LeadQuality, LeadStatus } from '@/lib/leads/pipeline';

type LeadModerationControlsProps = {
  leadId: string;
  currentStatus: LeadStatus;
  currentQuality: LeadQuality;
  enabled: boolean;
};

type LeadUpdate = {
  status?: LeadStatus;
  quality?: LeadQuality;
};

const ACTIONS: Array<{
  key: string;
  label: string;
  body: LeadUpdate;
  tone: 'default' | 'warning' | 'success';
  disabledWhen: (status: LeadStatus, quality: LeadQuality) => boolean;
}> = [
  {
    key: 'contacted',
    label: 'Contacted',
    body: { status: 'contacted' },
    tone: 'default',
    disabledWhen: (status) => status === 'contacted',
  },
  {
    key: 'qualified',
    label: 'Qualified',
    body: { status: 'qualified' },
    tone: 'success',
    disabledWhen: (status) => status === 'qualified',
  },
  {
    key: 'flagged',
    label: 'Flag review',
    body: { quality: 'flagged' },
    tone: 'warning',
    disabledWhen: (_status, quality) => quality === 'flagged',
  },
  {
    key: 'clean',
    label: 'Clear flag',
    body: { quality: 'clean' },
    tone: 'default',
    disabledWhen: (_status, quality) => quality === 'clean',
  },
];

export function LeadModerationControls({ leadId, currentStatus, currentQuality, enabled }: LeadModerationControlsProps) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(currentStatus);
  const [quality, setQuality] = useState(currentQuality);

  async function updateLead(key: string, body: LeadUpdate) {
    setError(null);
    setActiveAction(key);

    try {
      const response = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; lead?: { status?: LeadStatus; quality?: LeadQuality } } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to update lead');
      }

      if (payload?.lead?.status) {
        setStatus(payload.lead.status);
      }
      if (payload?.lead?.quality) {
        setQuality(payload.lead.quality);
      }
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update lead');
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => {
          const disabled = !enabled || activeAction !== null || action.disabledWhen(status, quality);
          const toneClasses =
            action.tone === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100'
              : action.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#3B49FF] hover:text-[#3B49FF]';

          return (
            <button
              key={action.key}
              type="button"
              onClick={() => updateLead(action.key, action.body)}
              disabled={disabled}
              className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses}`}
            >
              {activeAction === action.key ? 'Saving…' : action.label}
            </button>
          );
        })}
      </div>

      {!enabled ? (
        <p className="text-xs font-bold text-slate-500">Live moderation is disabled in demo mode until a Supabase database is connected.</p>
      ) : null}
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
