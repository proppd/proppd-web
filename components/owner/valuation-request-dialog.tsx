'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import { formatValuationAmount, type InstantValuationResult } from '@/lib/valuation/instant';
import { buildValuationRequestMailto } from '@/lib/valuation/request';
import type { OwnerProperty } from '@/lib/owner/properties';

type DialogState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string }
  | { status: 'fallback' };

function buildMessage(property: OwnerProperty, estimate?: InstantValuationResult): string {
  const purpose = property.intent === 'rent' ? 'rent' : 'sale';
  const parts = [
    `I'd like an agent valuation for my ${property.bedrooms}-bed ${property.propertyType.toLowerCase()} in ${property.suburb}, ${property.city}.`,
    `I'm looking to ${property.intent === 'rent' ? 'rent it out' : 'sell'}.`,
  ];
  if (estimate && estimate.status === 'estimate') {
    parts.push(
      `Proppd's indicative range is ${formatValuationAmount(estimate.lowValue, purpose)}–${formatValuationAmount(estimate.highValue, purpose)}.`,
    );
  }
  if (property.askingPrice) {
    parts.push(`My target ${property.intent === 'rent' ? 'rent' : 'price'} is ${formatValuationAmount(property.askingPrice, purpose)}.`);
  }
  return parts.join(' ');
}

export function ValuationRequestDialog({
  property,
  estimate,
  defaultEmail,
  onClose,
}: {
  property: OwnerProperty;
  estimate?: InstantValuationResult;
  defaultEmail?: string;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<DialogState>({ status: 'idle' });

  const mailto = buildValuationRequestMailto({
    reason: property.intent === 'rent' ? 'renting' : 'selling',
    propertyType: property.propertyType,
    suburb: property.suburb,
    city: property.city,
    bedrooms: String(property.bedrooms),
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !surname.trim() || !email.trim() || !phone.trim()) {
      setState({ status: 'error', message: 'Please add your name, surname, email, and phone.' });
      return;
    }
    if (!consent) {
      setState({ status: 'error', message: 'Please confirm consent so an agent can contact you.' });
      return;
    }

    setState({ status: 'loading' });
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: buildMessage(property, estimate),
          intent: 'valuation',
          popiaConsent: true,
          sourcePage: '/my-properties',
        }),
      });

      if (response.status === 503) {
        setState({ status: 'fallback' });
        return;
      }

      const data = (await response.json()) as { ok: boolean; errors?: string[]; error?: string };
      if (response.ok && data.ok) {
        setState({ status: 'success' });
        return;
      }
      setState({ status: 'error', message: data.errors?.join(' ') || data.error || 'Could not send your request. Please try again.' });
    } catch {
      setState({ status: 'fallback' });
    }
  }

  const title = property.nickname || `${property.propertyType} in ${property.suburb}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center" role="dialog" aria-modal="true" aria-label="Request an agent valuation">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F7F8FA] hover:text-[#1A1A2E]" aria-label="Close">
          <X size={18} />
        </button>

        {state.status === 'success' ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]"><CheckCircle2 size={26} /></div>
            <h2 className="mt-4 text-2xl font-bold tracking-[-.03em] text-[#1A1A2E]">Request sent</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">A Proppd agent will follow up about <strong>{title}</strong>. We&apos;ve routed it with your property details and consent.</p>
            <button type="button" onClick={onClose} className="mt-6 inline-flex rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">Done</button>
          </div>
        ) : state.status === 'fallback' ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]"><ShieldCheck size={26} /></div>
            <h2 className="mt-4 text-2xl font-bold tracking-[-.03em] text-[#1A1A2E]">Send it by email</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">Lead routing isn&apos;t enabled on this environment yet. Open a pre-filled email instead and an agent will pick it up.</p>
            <a href={mailto} className="mt-6 inline-flex rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">Open email</a>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#2563EB]">Request agent valuation</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.03em] text-[#1A1A2E]">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">We&apos;ll route your property details to a suitable agent. Share how to reach you.</p>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Name" value={name} onChange={setName} placeholder="First name" />
                <Input label="Surname" value={surname} onChange={setSurname} placeholder="Surname" />
              </div>
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.co.za" />
              <Input label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="0XX XXX XXXX" />

              <label className="mt-1 flex items-start gap-2 text-xs font-semibold leading-5 text-[#6B7280]">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#4A3AFF]" />
                I consent to Proppd sharing these details with a suitable agent so they can contact me about this property (POPIA).
              </label>

              {state.status === 'error' && (
                <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"><AlertCircle size={16} className="mt-0.5 shrink-0" />{state.message}</p>
              )}

              <button type="submit" disabled={state.status === 'loading'} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-60">
                {state.status === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send to an agent</>}
              </button>
              <a href={mailto} className="text-center text-xs font-bold text-[#9CA3AF] transition hover:text-[#4A3AFF]">or open a pre-filled email instead</a>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10 placeholder:font-normal placeholder:text-[#9CA3AF]"
      />
    </label>
  );
}
