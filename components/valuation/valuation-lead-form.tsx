'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

type Props = {
  suburb: string;
  city: string;
  propertyType: string;
  bedrooms?: number;
  estimateRange?: string;
  confidence?: string;
};

type FieldState = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  popiaConsent: boolean;
};

function buildMessage(p: Props): string {
  const parts: string[] = [];
  parts.push(`Valuation appraisal request for a ${p.bedrooms ? `${p.bedrooms}-bedroom ` : ''}${p.propertyType} in ${p.suburb}, ${p.city}.`);
  if (p.estimateRange) parts.push(`Instant estimate: ${p.estimateRange}${p.confidence ? ` (${p.confidence} confidence)` : ''}.`);
  parts.push('Please contact me to confirm with a professional appraisal.');
  return parts.join(' ');
}

export function ValuationLeadForm({ suburb, city, propertyType, bedrooms, estimateRange, confidence }: Props) {
  const [fields, setFields] = useState<FieldState>({ name: '', surname: '', email: '', phone: '', popiaConsent: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update<K extends keyof FieldState>(key: K, value: FieldState[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fields.popiaConsent) return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fields.name,
          surname: fields.surname,
          email: fields.email,
          phone: fields.phone,
          message: buildMessage({ suburb, city, propertyType, bedrooms, estimateRange, confidence }),
          intent: 'valuation',
          popiaConsent: fields.popiaConsent,
          sourcePage: '/home-values/estimate',
        }),
      });
      const json = await res.json() as { ok: boolean; errors?: string[] };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.errors?.join('. ') ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-6 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 text-center">
        <CheckCircle2 className="mx-auto text-[#2563EB]" size={28} />
        <p className="mt-3 text-sm font-bold text-[#1A1A2E]">Appraisal request sent.</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">A Proppd agent will be in touch to confirm the market opinion.</p>
      </div>
    );
  }

  return (
    <form className="mt-6 grid gap-3" onSubmit={handleSubmit} noValidate>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Request agent appraisal</p>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-bold uppercase tracking-[.1em] text-[#9CA3AF]">
          First name
          <input
            required
            value={fields.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Lerato"
            className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-[.1em] text-[#9CA3AF]">
          Surname
          <input
            required
            value={fields.surname}
            onChange={(e) => update('surname', e.target.value)}
            placeholder="Mokoena"
            className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
          />
        </label>
      </div>

      <label className="block text-xs font-bold uppercase tracking-[.1em] text-[#9CA3AF]">
        Email
        <input
          required
          type="email"
          value={fields.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
        />
      </label>

      <label className="block text-xs font-bold uppercase tracking-[.1em] text-[#9CA3AF]">
        Phone
        <input
          required
          type="tel"
          value={fields.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+27 82 123 4567"
          className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl bg-[#EFF6FF] p-3 text-xs font-semibold leading-5 text-[#2563EB]">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[#2563EB]"
          checked={fields.popiaConsent}
          onChange={(e) => update('popiaConsent', e.target.checked)}
        />
        I consent to Proppd sharing these details with a suitable agent for a valuation follow-up.
      </label>

      {status === 'error' && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!fields.popiaConsent || status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
      >
        {status === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
        {status === 'submitting' ? 'Sending…' : 'Request appraisal'}
      </button>
    </form>
  );
}
