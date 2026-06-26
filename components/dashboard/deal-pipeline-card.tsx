'use client';

import { useState } from 'react';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, AlertTriangle,
  ArrowRight, Loader2, Trash2, Phone, Mail, Building2
} from 'lucide-react';
import { DEAL_STAGES, stageLabel, nextStage, type DealRecord, type DealStage, type ActiveDealStage } from '@/lib/proppd/deals';
import { formatZar } from '@/lib/billing/plans';

type Props = {
  deal: DealRecord;
  onUpdate: (updated: DealRecord) => void;
  onDelete: (id: string) => void;
};

type State =
  | { kind: 'idle' }
  | { kind: 'advancing'; stage: ActiveDealStage; date: string }
  | { kind: 'saving' }
  | { kind: 'confirming_delete' };

export function DealPipelineCard({ deal, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);

  const isFallen = deal.stage === 'fallen_through';
  const isComplete = deal.stage === 'registered';
  const next = isFallen || isComplete ? null : nextStage(deal.stage);

  async function advanceStage() {
    if (state.kind !== 'advancing' || !state.date) return;
    setError(null);
    setState({ kind: 'saving' });

    const dateField = stageDateFieldOf(state.stage);
    const res = await fetch(`/api/dashboard/deals/${deal.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stage: state.stage, [dateField]: state.date }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Failed to update deal.');
      setState({ kind: 'idle' });
      return;
    }
    onUpdate(json.deal as DealRecord);
    setState({ kind: 'idle' });
  }

  async function markFallenThrough(reason: string) {
    setError(null);
    setState({ kind: 'saving' });
    const now = new Date().toISOString();
    const res = await fetch(`/api/dashboard/deals/${deal.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        stage: 'fallen_through',
        fallenThroughAt: now,
        fallenThroughReason: reason || null,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Failed to update deal.');
      setState({ kind: 'idle' });
      return;
    }
    onUpdate(json.deal as DealRecord);
    setState({ kind: 'idle' });
  }

  async function confirmDelete() {
    setState({ kind: 'saving' });
    await fetch(`/api/dashboard/deals/${deal.id}`, { method: 'DELETE' });
    onDelete(deal.id);
  }

  const commissionCents =
    deal.purchasePriceCents != null && deal.commissionPct != null
      ? Math.round(deal.purchasePriceCents * deal.commissionPct / 100)
      : null;

  return (
    <div className={`rounded-xl border bg-white shadow-sm transition-all ${
      isFallen ? 'border-[#FCA5A5] opacity-80' :
      isComplete ? 'border-[#6EE7B7]' :
      'border-[#E5E7EB]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StageBadge stage={deal.stage} />
            {isComplete && (
              <span className="rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-bold text-[#065F46]">Registered ✓</span>
            )}
          </div>
          <p className="mt-1.5 text-base font-bold text-[#1A1A2E] truncate">{deal.propertyAddress}</p>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Buyer: <span className="font-semibold text-[#374151]">{deal.buyerName}</span>
          </p>
          {commissionCents != null && (
            <p className="mt-0.5 text-xs font-bold text-[#4A3AFF]">
              Est. commission: {formatZar(commissionCents)}
              {deal.purchasePriceCents && (
                <span className="ml-1 font-normal text-[#9CA3AF]">
                  ({deal.commissionPct}% of {formatZar(deal.purchasePriceCents)})
                </span>
              )}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#1A1A2E]"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Stage stepper */}
      {!isFallen && (
        <div className="border-t border-[#F3F4F6] px-5 py-4">
          <StepperBar deal={deal} />
        </div>
      )}

      {/* Advance / fallen-through actions */}
      {!isComplete && !isFallen && (
        <div className="border-t border-[#F3F4F6] px-5 py-4">
          {state.kind === 'advancing' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[#1A1A2E]">
                Date for &ldquo;{stageLabel(state.stage)}&rdquo;:
              </span>
              <input
                type="date"
                value={state.date}
                onChange={(e) => setState({ kind: 'advancing', stage: state.stage, date: e.target.value })}
                className="rounded-lg border border-[#BFDBFE] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] outline-none focus:border-[#2563EB]"
              />
              <button
                type="button"
                disabled={!state.date}
                onClick={advanceStage}
                className="rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setState({ kind: 'idle' })}
                className="text-xs font-bold text-[#9CA3AF] hover:text-[#4A3AFF]"
              >
                Cancel
              </button>
            </div>
          ) : state.kind === 'saving' ? (
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Loader2 size={14} className="animate-spin" /> Saving…
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {next && (
                <button
                  type="button"
                  onClick={() => setState({
                    kind: 'advancing',
                    stage: next,
                    date: todayDate(),
                  })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
                >
                  <ArrowRight size={13} /> Advance to: {stageLabel(next)}
                </button>
              )}
              <FallenThroughButton onConfirm={markFallenThrough} />
            </div>
          )}
          {error && (
            <p className="mt-2 text-xs font-bold text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#F3F4F6] p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Buyer details */}
            <DetailSection title="Buyer">
              <DetailRow icon={<Mail size={12} />} label="Email" value={deal.buyerEmail} />
              <DetailRow icon={<Phone size={12} />} label="Phone" value={deal.buyerPhone} />
              <DetailRow icon={<Building2 size={12} />} label="Attorney" value={deal.buyerAttorneyFirm} />
              <DetailRow icon={null} label="Contact" value={deal.buyerAttorneyContact} />
            </DetailSection>

            {/* Seller attorney */}
            <DetailSection title="Transfer Attorney">
              <DetailRow icon={<Building2 size={12} />} label="Firm" value={deal.sellerAttorneyFirm} />
              <DetailRow icon={null} label="Contact" value={deal.sellerAttorneyContact} />
            </DetailSection>
          </div>

          {/* Milestone dates */}
          <DetailSection title="Milestone dates">
            <div className="grid gap-1 sm:grid-cols-2">
              {DEAL_STAGES.map((s) => {
                const dateKey = stageDateFieldOf(s) as keyof DealRecord;
                const dateVal = deal[dateKey] as string | null;
                return dateVal ? (
                  <div key={s} className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">{stageLabel(s)}</span>
                    <span className="font-bold text-[#1A1A2E]">
                      {new Date(dateVal).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ) : null;
              })}
              {deal.fallenThroughAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-600">Fallen through</span>
                  <span className="font-bold text-[#1A1A2E]">
                    {new Date(deal.fallenThroughAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
            {deal.fallenThroughReason && (
              <p className="mt-2 text-xs text-red-600">Reason: {deal.fallenThroughReason}</p>
            )}
          </DetailSection>

          {deal.notes && (
            <DetailSection title="Notes">
              <p className="text-xs text-[#374151] whitespace-pre-wrap">{deal.notes}</p>
            </DetailSection>
          )}

          {/* Delete */}
          <div className="flex justify-end pt-2 border-t border-[#F3F4F6]">
            {state.kind === 'confirming_delete' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">Delete this deal?</span>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setState({ kind: 'idle' })}
                  className="text-xs font-bold text-[#9CA3AF] hover:text-[#4A3AFF]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setState({ kind: 'confirming_delete' })}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9CA3AF] hover:text-red-600"
              >
                <Trash2 size={13} /> Delete deal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage stepper bar
// ---------------------------------------------------------------------------

function StepperBar({ deal }: { deal: DealRecord }) {
  const currentIdx = DEAL_STAGES.indexOf(deal.stage as ActiveDealStage);

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {DEAL_STAGES.map((stage, idx) => {
        const done = currentIdx > idx || deal.stage === 'registered';
        const active = deal.stage === stage;
        return (
          <div key={stage} className="flex min-w-0 flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                done ? 'bg-[#2563EB] text-white' :
                active ? 'border-2 border-[#2563EB] text-[#2563EB]' :
                'border-2 border-[#E5E7EB] text-[#D1D5DB]'
              }`}>
                {done
                  ? <CheckCircle2 size={14} strokeWidth={2.5} />
                  : <Circle size={14} strokeWidth={2.5} />
                }
              </div>
              <span className={`mt-1 text-center text-[9px] font-bold leading-tight whitespace-nowrap ${
                active ? 'text-[#2563EB]' :
                done ? 'text-[#6B7280]' :
                'text-[#D1D5DB]'
              }`}>
                {stepperShortLabel(stage)}
              </span>
            </div>
            {idx < DEAL_STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${done ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function stepperShortLabel(stage: ActiveDealStage): string {
  const map: Record<ActiveDealStage, string> = {
    otp_signed: 'OTP',
    bond_submitted: 'Bond\nSubmit',
    bond_approved: 'Bond\nApproved',
    attorney_instructed: 'Attorney',
    deeds_lodged: 'Deeds',
    registered: 'Done ✓',
  };
  return map[stage] ?? stage;
}

// ---------------------------------------------------------------------------
// Fallen-through button (inline confirm)
// ---------------------------------------------------------------------------

function FallenThroughButton({ onConfirm }: { onConfirm: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
      >
        <AlertTriangle size={13} /> Fallen through
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="rounded-lg border border-[#FCA5A5] bg-white px-3 py-2 text-xs outline-none focus:border-red-500"
      />
      <button
        type="button"
        onClick={() => { onConfirm(reason); setOpen(false); }}
        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs font-bold text-[#9CA3AF] hover:text-[#4A3AFF]"
      >
        Cancel
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function StageBadge({ stage }: { stage: DealStage }) {
  const colours: Record<DealStage, string> = {
    otp_signed: 'bg-[#EFF6FF] text-[#2563EB]',
    bond_submitted: 'bg-[#FEF3C7] text-[#92400E]',
    bond_approved: 'bg-[#ECFDF5] text-[#065F46]',
    attorney_instructed: 'bg-[#F3E8FF] text-[#6B21A8]',
    deeds_lodged: 'bg-[#FFF7ED] text-[#9A3412]',
    registered: 'bg-[#D1FAE5] text-[#065F46]',
    fallen_through: 'bg-[#FEE2E2] text-[#991B1B]',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colours[stage]}`}>
      {stageLabel(stage)}
    </span>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {icon && <span className="shrink-0 text-[#9CA3AF]">{icon}</span>}
      <span className="text-[#9CA3AF]">{label}:</span>
      <span className="font-semibold text-[#374151]">{value}</span>
    </div>
  );
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function stageDateFieldOf(stage: ActiveDealStage): string {
  const map: Record<ActiveDealStage, string> = {
    otp_signed: 'otpSignedAt',
    bond_submitted: 'bondSubmittedAt',
    bond_approved: 'bondApprovedAt',
    attorney_instructed: 'attorneyInstructedAt',
    deeds_lodged: 'deedsLodgedAt',
    registered: 'registeredAt',
  };
  return map[stage];
}
