'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock3, ChevronDown, ChevronUp } from 'lucide-react';
import type { AgentReviewRequest } from '@/lib/proppd/backend';

type Props = {
  items: AgentReviewRequest[];
  readOnly?: boolean;
};

export function AgentReviewQueue({ items, readOnly = false }: Props) {
  return (
    <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-[#E5E7EB]">
      <div className="hidden grid-cols-[1fr_130px_160px_180px] gap-4 bg-[#F7F8FA] px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF] sm:grid">
        <span>Applicant</span>
        <span>FFC number</span>
        <span>PPRA status</span>
        {readOnly ? <span>Outcome</span> : <span>Actions</span>}
      </div>
      {items.map((item) => (
        <ReviewRow key={item.id} item={item} readOnly={readOnly} />
      ))}
    </div>
  );
}

function ReviewRow({ item, readOnly }: { item: AgentReviewRequest; readOnly: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<'approved' | 'rejected' | null>(
    item.reviewStatus !== 'pending' ? (item.reviewStatus as 'approved' | 'rejected') : null,
  );
  const [error, setError] = useState<string | null>(null);

  async function act(action: 'approve' | 'reject') {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/agents/review/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        setOutcome(action === 'approve' ? 'approved' : 'rejected');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const fullName = `${item.firstName} ${item.lastName}`.trim();
  const submittedAt = new Date(item.createdAt).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      <div className="grid gap-3 px-5 py-4 transition hover:bg-[#F7F8FA] sm:grid-cols-[1fr_130px_160px_180px] sm:items-center">
        {/* Applicant */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#1A1A2E]">{fullName}</span>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-[#6B7280] transition hover:bg-slate-200"
              aria-label={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              details
            </button>
          </div>
          <p className="mt-0.5 text-sm font-bold text-[#9CA3AF]">{item.email}</p>
          <p className="text-xs font-bold text-[#C4C9D4]">Applied {submittedAt}</p>
        </div>

        {/* FFC */}
        <p className="font-mono text-sm font-bold text-[#1A1A2E]">{item.ffcNumber}</p>

        {/* PPRA status */}
        <StatusBadge status={item.verificationStatus} />

        {/* Actions / outcome */}
        {readOnly || outcome ? (
          <OutcomeBadge outcome={outcome ?? item.reviewStatus} />
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => act('approve')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            <button
              onClick={() => act('reject')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {expanded && (
        <div className="mx-5 mb-4 grid gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-sm sm:grid-cols-2">
          <Detail label="Phone" value={item.phone} />
          <Detail label="Agency" value={item.agency} />
          <Detail label="Service area" value={item.area} />
          <Detail label="PPRA reason" value={item.verificationReason} />
          {item.reviewedAt && (
            <Detail
              label="Reviewed"
              value={new Date(item.reviewedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === 'verified'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'not_verified'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';
  const label =
    status === 'verified' ? 'Verified' : status === 'not_verified' ? 'Not verified' : status;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      {label}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  if (outcome === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={13} /> Approved
      </span>
    );
  }
  if (outcome === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
        <XCircle size={13} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      <Clock3 size={13} /> Pending
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">{label}</p>
      <p className="mt-0.5 font-bold text-[#1A1A2E]">{value || '—'}</p>
    </div>
  );
}
