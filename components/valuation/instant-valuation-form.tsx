'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, Home, Loader2, Mail, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatValuationAmount, type InstantValuationResult } from '@/lib/valuation/instant';

type FormState = {
  purpose: 'sale' | 'rent';
  suburb: string;
  city: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  floorSize: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
};

const initialForm: FormState = {
  purpose: 'sale',
  suburb: 'Sandton',
  city: 'Johannesburg',
  propertyType: 'House',
  bedrooms: '3',
  bathrooms: '2',
  floorSize: '',
  ownerName: '',
  contactEmail: '',
  contactPhone: '',
};

type ApiResponse = {
  ok: boolean;
  error?: string;
  source?: string;
  estimate?: InstantValuationResult;
};

export function InstantValuationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [estimate, setEstimate] = useState<InstantValuationResult | null>(null);
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const appraisalHref = useMemo(() => buildAgentAppraisalMailto(form, estimate), [form, estimate]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/valuations/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: form.purpose,
          suburb: form.suburb,
          city: form.city,
          propertyType: form.propertyType,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          floorSize: form.floorSize,
        }),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.ok || !payload.estimate) {
        throw new Error(payload.error ?? 'Could not create an instant estimate yet.');
      }
      setEstimate(payload.estimate);
      setSource(payload.source ?? 'portal');
      setStatus('idle');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Could not create an instant estimate yet.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4A3AFF]">Instant estimate</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] text-[#1A1A2E]">Start with the basics.</h2>
          </div>
          <div className="inline-flex rounded-full bg-[#F7F8FA] p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => update('purpose', 'sale')}
              className={`rounded-full px-4 py-2 ${form.purpose === 'sale' ? 'bg-[#1A1A2E] text-white' : 'text-[#6B7280]'}`}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => update('purpose', 'rent')}
              className={`rounded-full px-4 py-2 ${form.purpose === 'rent' ? 'bg-[#1A1A2E] text-white' : 'text-[#6B7280]'}`}
            >
              Rental
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Suburb" value={form.suburb} onChange={(value) => update('suburb', value)} placeholder="Sandton" />
          <Field label="City" value={form.city} onChange={(value) => update('city', value)} placeholder="Johannesburg" />
          <Field label="Property type" value={form.propertyType} onChange={(value) => update('propertyType', value)} placeholder="House" />
          <Field label="Bedrooms" value={form.bedrooms} onChange={(value) => update('bedrooms', value)} placeholder="3" inputMode="numeric" />
          <Field label="Bathrooms" value={form.bathrooms} onChange={(value) => update('bathrooms', value)} placeholder="2" inputMode="numeric" />
          <Field label="Floor size, optional" value={form.floorSize} onChange={(value) => update('floorSize', value)} placeholder="188" inputMode="numeric" />
        </div>

        <div className="mt-5 rounded-2xl border border-[#E6FBF7] bg-[#f8fffd] p-4 text-sm font-bold leading-6 text-[#1A1A2E]">
          <div className="flex items-center gap-2 text-[#00A88B]"><ShieldCheck size={16} /> Indicative range only</div>
          <p className="mt-2 text-[#6B7280]">This is not a bank or formal valuation. Proppd uses available portal listings to create a market range, then routes serious requests to a local agent.</p>
        </div>

        {error ? <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-60"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <TrendingUp size={18} />}
          Get instant estimate
        </button>
      </form>

      <aside className="rounded-2xl bg-[#1A1A2E] p-5 text-white shadow-sm sm:p-6">
        {estimate ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#00C9A7]">{estimate.label}</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-white">{estimate.confidence} confidence</span>
            </div>

            {estimate.status === 'estimate' ? (
              <div className="mt-5 rounded-2xl bg-white p-5 text-[#1A1A2E]">
                <p className="text-sm font-bold text-[#6B7280]">Indicative range</p>
                <p className="mt-2 text-3xl font-bold tracking-[-.05em]">
                  {formatValuationAmount(estimate.lowValue, estimate.purpose)} – {formatValuationAmount(estimate.highValue, estimate.purpose)}
                </p>
                <p className="mt-3 text-sm font-bold text-[#4A3AFF]">Midpoint: {formatValuationAmount(estimate.midValue, estimate.purpose)}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-white p-5 text-[#1A1A2E]">
                <p className="text-2xl font-bold tracking-[-.04em]">Agent appraisal recommended</p>
                <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">This market needs a human check before showing a responsible range.</p>
              </div>
            )}

            <p className="mt-5 text-sm font-bold leading-6 text-white/70">{estimate.reason}</p>

            {estimate.comparables.length > 0 ? (
              <div className="mt-5 grid gap-3">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-white/45">Comparable homes used</p>
                {estimate.comparables.slice(0, 4).map((item) => (
                  <a key={item.slug} href={`/property/${item.slug}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-xs font-bold text-white/55">{item.suburb}, {item.city} · {item.bedrooms} beds · {item.propertyType}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[#00C9A7]">{formatValuationAmount(item.priceValue, estimate.purpose)}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3">
              <a href={appraisalHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold !text-[#1A1A2E]">
                <Mail size={17} /> Request agent appraisal
              </a>
              <a href="/request-valuation" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white">
                Open full valuation handoff <ArrowRight size={17} />
              </a>
            </div>

            <p className="mt-4 text-xs font-bold text-white/40">Data source: {source || 'portal listings'}</p>
          </div>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col justify-between">
            <div>
              <BarChart3 className="text-[#00C9A7]" size={38} />
              <h2 className="mt-5 text-3xl font-bold tracking-[-.05em]">A Zoopla-style estimate, built for Proppd clients.</h2>
              <p className="mt-4 text-sm font-bold leading-6 text-white/65">Owners get an instant range. Agents get a warmer, better-qualified valuation lead with the context they need to follow up.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Fact icon={<Home size={17} />} title="Uses comparable portal stock" />
              <Fact icon={<CheckCircle2 size={17} />} title="Shows confidence before overpromising" />
              <Fact icon={<ShieldCheck size={17} />} title="Keeps formal valuations human-led" />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: 'numeric';
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
      {label}
      <input
        className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </label>
  );
}

function Fact({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-white/80">
      <span className="text-[#00C9A7]">{icon}</span>
      {title}
    </div>
  );
}

function buildAgentAppraisalMailto(form: FormState, estimate: InstantValuationResult | null): string {
  const subject = encodeURIComponent(`Valuation appraisal request: ${form.suburb || 'property'}`);
  const lines = [
    'Please help me confirm this Proppd instant estimate.',
    '',
    `Purpose: ${form.purpose === 'rent' ? 'Rental estimate' : 'Sale estimate'}`,
    `Property: ${form.bedrooms || '?'} bedroom ${form.propertyType || 'property'} in ${form.suburb || 'suburb'}, ${form.city || 'city'}`,
    form.bathrooms ? `Bathrooms: ${form.bathrooms}` : '',
    form.floorSize ? `Floor size: ${form.floorSize} sqm` : '',
    estimate?.status === 'estimate'
      ? `Instant range: ${formatValuationAmount(estimate.lowValue, estimate.purpose)} – ${formatValuationAmount(estimate.highValue, estimate.purpose)} (${estimate.confidence} confidence)`
      : 'Instant range: Agent appraisal recommended',
    '',
    form.ownerName ? `Owner name: ${form.ownerName}` : 'Owner name:',
    form.contactEmail ? `Email: ${form.contactEmail}` : 'Email:',
    form.contactPhone ? `Phone: ${form.contactPhone}` : 'Phone:',
  ].filter(Boolean);

  return `mailto:info@proppd.com?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`;
}
