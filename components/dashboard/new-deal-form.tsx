'use client';

import { useState } from 'react';
import { Loader2, X, Handshake } from 'lucide-react';
import type { DealRecord } from '@/lib/proppd/deals';

type Listing = { id: string; title: string; streetAddress: string };

type Props = {
  listings: Listing[];
  onCreated: (deal: DealRecord) => void;
};

type FormState = { kind: 'idle' } | { kind: 'saving' } | { kind: 'error'; message: string };

export function NewDealButton({ listings, onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
      >
        <Handshake size={16} /> New deal
      </button>

      {open && (
        <NewDealModal
          listings={listings}
          onCreated={(deal) => { setOpen(false); onCreated(deal); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function NewDealModal({ listings, onCreated, onClose }: Props & { onClose: () => void }) {
  const [formState, setFormState] = useState<FormState>({ kind: 'idle' });

  // Form fields
  const [listingId, setListingId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [bondAmount, setBondAmount] = useState('');
  const [commissionPct, setCommissionPct] = useState('');
  const [otpSignedAt, setOtpSignedAt] = useState(todayDate());
  const [notes, setNotes] = useState('');

  // When a listing is selected, pre-fill the address
  function handleListingChange(id: string) {
    setListingId(id);
    if (!id) return;
    const listing = listings.find((l) => l.id === id);
    if (listing && !propertyAddress) {
      setPropertyAddress(listing.streetAddress || listing.title);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyAddress.trim()) return;
    if (!buyerName.trim()) return;

    setFormState({ kind: 'saving' });

    const priceCents = parseCents(purchasePrice);
    const bondCents = parseCents(bondAmount);
    const commPct = parseFloat(commissionPct) || undefined;

    const res = await fetch('/api/dashboard/deals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        listingId: listingId || undefined,
        propertyAddress: propertyAddress.trim(),
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
        purchasePriceCents: priceCents,
        bondAmountCents: bondCents,
        commissionPct: commPct,
        otpSignedAt: otpSignedAt || undefined,
        notes: notes.trim() || undefined,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormState({ kind: 'error', message: json.error ?? 'Failed to create deal.' });
      return;
    }
    onCreated(json.deal as DealRecord);
  }

  const saving = formState.kind === 'saving';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-y-auto max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Sale pipeline</p>
            <h2 className="text-lg font-bold text-[#1A1A2E]">New deal</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#1A1A2E]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Listing picker */}
          {listings.length > 0 && (
            <Field label="Link to a listing (optional)">
              <select
                value={listingId}
                onChange={(e) => handleListingChange(e.target.value)}
                className={inputCls}
              >
                <option value="">— No listing selected —</option>
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Property address */}
          <Field label="Property address *">
            <input
              required
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="12 Example Street, Sandton"
              className={inputCls}
            />
          </Field>

          {/* Buyer */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Buyer name *">
              <input
                required
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="John Smith"
                className={inputCls}
              />
            </Field>
            <Field label="Buyer email">
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="john@example.com"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Buyer phone">
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="+27 82 000 0000"
              className={inputCls}
            />
          </Field>

          {/* Financial */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Purchase price (R)">
              <input
                type="number"
                min={0}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="2500000"
                className={inputCls}
              />
            </Field>
            <Field label="Bond amount (R)">
              <input
                type="number"
                min={0}
                value={bondAmount}
                onChange={(e) => setBondAmount(e.target.value)}
                placeholder="2000000"
                className={inputCls}
              />
            </Field>
            <Field label="Commission %">
              <input
                type="number"
                min={0}
                max={25}
                step={0.25}
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                placeholder="7"
                className={inputCls}
              />
            </Field>
          </div>

          {/* OTP date */}
          <Field label="OTP signed date">
            <input
              type="date"
              value={otpSignedAt}
              onChange={(e) => setOtpSignedAt(e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context…"
              className={inputCls}
            />
          </Field>

          {formState.kind === 'error' && (
            <p className="text-sm font-bold text-red-600">{formState.message}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-bold text-[#6B7280] hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !propertyAddress.trim() || !buyerName.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
            >
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Create deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#374151]">{label}</span>
      {children}
    </label>
  );
}

function parseCents(value: string): number | undefined {
  const n = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(n) || n <= 0) return undefined;
  return Math.round(n * 100);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const inputCls =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] outline-none placeholder:text-[#D1D5DB] focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF]/20';
