'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, CheckCircle2, Home, Loader2, ShieldCheck, TrendingUp } from 'lucide-react';

type FormState = {
  purpose: 'sale' | 'rent';
  suburb: string;
  city: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  floorSize: string;
};

const initialForm: FormState = {
  purpose: 'sale',
  suburb: 'Sandton',
  city: 'Johannesburg',
  propertyType: 'House',
  bedrooms: '3',
  bathrooms: '2',
  floorSize: '',
};

export function InstantValuationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.suburb.trim() || !form.city.trim() || !form.propertyType.trim() || !form.bedrooms.trim()) {
      setError('Enter a suburb, city, property type, and bedrooms to create a clean estimate.');
      return;
    }

    const params = new URLSearchParams();
    params.set('purpose', form.purpose);
    params.set('suburb', form.suburb.trim());
    params.set('city', form.city.trim());
    params.set('propertyType', form.propertyType.trim());
    params.set('bedrooms', form.bedrooms.trim());
    if (form.bathrooms.trim()) params.set('bathrooms', form.bathrooms.trim());
    if (form.floorSize.trim()) params.set('floorSize', form.floorSize.trim());

    setIsSubmitting(true);
    router.push(`/home-values/estimate?${params.toString()}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-[#BFDBFE] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#2563EB]">Instant estimate</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] text-[#1A1A2E]">Start with the basics.</h2>
          </div>
          <div className="inline-flex rounded-full bg-[#EFF6FF] p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => update('purpose', 'sale')}
              className={`rounded-full px-4 py-2 ${form.purpose === 'sale' ? 'bg-[#4A3AFF] text-white' : 'text-[#2563EB]'}`}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => update('purpose', 'rent')}
              className={`rounded-full px-4 py-2 ${form.purpose === 'rent' ? 'bg-[#4A3AFF] text-white' : 'text-[#2563EB]'}`}
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

        <div className="mt-5 rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-white p-4 text-sm font-bold leading-6 text-[#1A1A2E]">
          <div className="flex items-center gap-2 text-[#2563EB]"><ShieldCheck size={16} /> Indicative range only</div>
          <p className="mt-2 text-[#6B7280]">The estimate opens on its own result page with a full comparison breakdown, confidence level, and agent-appraisal route.</p>
        </div>

        {error ? <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <TrendingUp size={18} />}
          View estimate page
        </button>
      </form>

      <aside className="rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-white to-white p-6 shadow-sm">
        <BarChart3 className="text-[#2563EB]" size={38} />
        <h2 className="mt-5 text-3xl font-bold tracking-[-.05em] text-[#1A1A2E]">Clean result page, not a cramped widget.</h2>
        <p className="mt-4 text-sm font-bold leading-6 text-[#6B7280]">
          The next screen shows the estimate range, midpoint, confidence, each comparable property, match score, and how every comp sits against the midpoint.
        </p>
        <div className="mt-6 grid gap-3">
          <Fact icon={<Home size={17} />} title="Dedicated valuation page" />
          <Fact icon={<CheckCircle2 size={17} />} title="Comparison cards with match scores" />
          <Fact icon={<ShieldCheck size={17} />} title="Agent appraisal CTA stays visible" />
        </div>
        <a href="/home-values/estimate?purpose=sale&suburb=Sandton&city=Johannesburg&propertyType=House&bedrooms=3&bathrooms=2&floorSize=188" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-5 py-3 text-sm font-bold text-[#2563EB]">
          Preview sample result <ArrowRight size={16} />
        </a>
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
        className="mt-2 w-full rounded-2xl border border-[#BFDBFE] bg-[#F8FBFF] px-4 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
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
    <div className="flex items-center gap-3 rounded-2xl border border-[#BFDBFE] bg-white/75 p-4 text-sm font-bold text-[#1A1A2E]">
      <span className="text-[#2563EB]">{icon}</span>
      {title}
    </div>
  );
}
