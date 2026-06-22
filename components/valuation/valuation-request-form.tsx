'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { ArrowRight, CheckCircle2, Copy, Mail, ShieldCheck } from 'lucide-react';
import { buildValuationRequestMailto, buildValuationRequestSummary, formatValuationReason, type ValuationReason } from '@/lib/valuation/request';

type ValuationRequestFormProps = {
  reasons: ValuationReason[];
  initialReason?: ValuationReason;
};

type FormState = {
  reason: ValuationReason;
  propertyType: string;
  suburb: string;
  city: string;
  bedrooms: string;
  timeframe: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  popiaConsent: boolean;
};

const initialState = (reason: ValuationReason): FormState => ({
  reason,
  propertyType: 'House',
  suburb: 'Sandton',
  city: 'Johannesburg',
  bedrooms: '3',
  timeframe: 'Next 30 days',
  ownerName: '',
  contactEmail: '',
  contactPhone: '',
  popiaConsent: true,
});

export function ValuationRequestForm({ reasons, initialReason = 'selling' }: ValuationRequestFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initialReason));
  const [copyStatus, setCopyStatus] = useState('');

  const mailtoHref = useMemo(
    () =>
      buildValuationRequestMailto({
        reason: form.reason,
        propertyType: form.propertyType,
        suburb: form.suburb,
        city: form.city,
        bedrooms: form.bedrooms,
        timeframe: form.timeframe,
        ownerName: form.ownerName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
      }),
    [form],
  );

  const summary = useMemo(
    () =>
      buildValuationRequestSummary({
        reason: form.reason,
        propertyType: form.propertyType,
        suburb: form.suburb,
        city: form.city,
        bedrooms: form.bedrooms,
        timeframe: form.timeframe,
        ownerName: form.ownerName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
      }),
    [form],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setCopyStatus('');
  }

  function handleTextChange(key: keyof Omit<FormState, 'reason' | 'popiaConsent'>) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(key, event.target.value);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus('Request summary copied. Paste it into email or WhatsApp.');
    } catch {
      setCopyStatus('Copy failed. You can still use the email button below.');
    }
  }

  return (
    <aside className="h-fit rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:sticky lg:top-6">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-[#4A3AFF]">Request builder</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Shape the valuation request before sending it.</h2>
      <p className="mt-3 text-sm leading-6 text-[#6B7280]">
        Fill the basics once. Proppd uses the data to draft a clear, POPIA-aware handoff email for the owner or landlord.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          Reason
          <select
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            value={form.reason}
            onChange={(event) => updateField('reason', event.target.value as ValuationReason)}
          >
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {formatValuationReason(reason)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Property type
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.propertyType}
              onChange={handleTextChange('propertyType')}
              placeholder="House"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Bedrooms
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.bedrooms}
              onChange={handleTextChange('bedrooms')}
              placeholder="3"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Suburb
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.suburb}
              onChange={handleTextChange('suburb')}
              placeholder="Sandton"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            City
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.city}
              onChange={handleTextChange('city')}
              placeholder="Johannesburg"
            />
          </label>
        </div>

        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          Timeframe
          <input
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            value={form.timeframe}
            onChange={handleTextChange('timeframe')}
            placeholder="Next 30 days"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Owner name
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.ownerName}
              onChange={handleTextChange('ownerName')}
              placeholder="Your name"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Phone
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.contactPhone}
              onChange={handleTextChange('contactPhone')}
              placeholder="+27 82 123 4567"
            />
          </label>
        </div>

        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          Contact email
          <input
            type="email"
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            value={form.contactEmail}
            onChange={handleTextChange('contactEmail')}
            placeholder="owner@example.com"
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl bg-[#EFF6FF] p-4 text-xs font-bold leading-5 text-[#2563EB]">
          <input
            className="mt-1 h-4 w-4 accent-[#2563EB]"
            type="checkbox"
            checked={form.popiaConsent}
            onChange={(event) => updateField('popiaConsent', event.target.checked)}
          />
          <span>I confirm the owner or landlord has consented to Proppd using these details for a valuation handoff.</span>
        </label>
      </div>

      <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Live summary</p>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-xs leading-6 text-[#6B7280]">{summary}</pre>
      </div>

      {copyStatus ? (
        <p className="mt-4 rounded-2xl border border-[#E5E7EB] p-4 text-xs font-bold leading-5 text-[#6B7280]">
          {copyStatus}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        <a
 className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 disabled:opacity-60"
          href={form.popiaConsent ? mailtoHref : '#'}
          aria-disabled={!form.popiaConsent}
          tabIndex={form.popiaConsent ? 0 : -1}
          onClick={(event) => {
            if (!form.popiaConsent) event.preventDefault();
          }}
        >
          <Mail size={18} />
          <span className="text-white">Open valuation email</span>
        </a>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
          type="button"
          onClick={copySummary}
        >
          <Copy size={16} /> Copy summary
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs font-bold leading-5 text-[#6B7280]">
        <div className="flex items-center gap-2 font-bold text-[#1A1A2E]"><ShieldCheck size={15} className="text-[#2563EB]" /> POPIA-aware handoff</div>
        <p className="mt-2">The request stays human-readable with owner consent, property context, and a clear route for follow-up.</p>
      </div>

      <a className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E]" href="/business">
        See the product roadmap <ArrowRight size={16} />
      </a>
    </aside>
  );
}
