'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { buildLeadMailto, type ListingLeadContext } from '@/lib/leads/mailto';
import { type LeadInput, validateLeadInput } from '@/lib/leads/validation';

type EnquiryFormProps = {
  listing: ListingLeadContext;
  agentProfileHref: string;
  shareText: string;
  routingLabel: string;
  routingDetail: string;
};

type LeadFormState = LeadInput;

const initialState: LeadFormState = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  message: '',
  intent: 'viewing',
  popiaConsent: false,
};

export function EnquiryForm({ listing, agentProfileHref, shareText, routingLabel, routingDetail }: EnquiryFormProps) {
  const [form, setForm] = useState<LeadFormState>({
    ...initialState,
    message: `I am interested in ${listing.title}. Please contact me with the next steps.`,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = useMemo(() => validateLeadInput(form).success, [form]);

  function updateField<K extends keyof LeadFormState>(key: K, value: LeadFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus('');
  }

  function handleTextChange(key: keyof Omit<LeadFormState, 'popiaConsent' | 'intent'>) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(key, event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateLeadInput(form);
    if (validation.success === false) {
      setErrors(validation.errors);
      setMailtoHref(null);
      setStatus('Please fix the highlighted enquiry details first.');
      return;
    }

    const href = buildLeadMailto({
      listing,
      lead: validation.data,
      sourcePath: `/property/${listing.slug}`,
    });

    setErrors([]);
    setMailtoHref(href);
    setIsSubmitting(true);
    setStatus('Saving your enquiry securely...');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...validation.data,
          listingId: listing.id,
          sourcePage: `/property/${listing.slug}`,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; errors?: string[]; error?: string } | null;

      if (response.ok && payload?.ok) {
        setStatus('Enquiry saved. Proppd will route it to the relevant agent or agency.');
        setMailtoHref(null);
        return;
      }

      if (response.status === 503) {
        setStatus('We could not complete the portal handoff, so your email app will open with the enquiry details ready to send.');
        window.location.href = href;
        return;
      }

      if (payload?.errors?.length) {
        setErrors(payload.errors);
        setStatus('Please fix the highlighted enquiry details first.');
        return;
      }

      setStatus(payload?.error ?? 'We could not complete the portal handoff. Open your email app to send it to Proppd.');
      window.location.href = href;
    } catch {
      setStatus('Network issue while sending. Open your email app to send the verified enquiry to Proppd.');
      window.location.href = href;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="h-fit rounded-xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-[#4A3AFF]">Verified enquiry</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Contact {listing.agent}</h2>
      <p className="mt-3 text-sm leading-6 text-[#6B7280]">
        Capture your details once. Proppd keeps POPIA consent explicit and routes the enquiry clearly to the relevant agent or agency.
      </p>

      <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-white p-4 text-xs font-bold leading-5 text-[#6B7280] shadow-sm">
        <div className="flex items-center gap-2 font-bold text-[#1A1A2E]">
          <ShieldCheck size={15} className="text-[#00C9A7]" /> {routingLabel}
        </div>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{routingDetail}</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Name
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.name}
              onChange={handleTextChange('name')}
              placeholder="Your name"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
            Surname
            <input
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              value={form.surname}
              onChange={handleTextChange('surname')}
              placeholder="Your surname"
            />
          </label>
        </div>

        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          Email
          <input
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            type="email"
            value={form.email}
            onChange={handleTextChange('email')}
            placeholder="you@example.com"
          />
        </label>

        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          Phone
          <input
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            type="tel"
            value={form.phone}
            onChange={handleTextChange('phone')}
            placeholder="+27 82 123 4567"
          />
        </label>

        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          I want to
          <select
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            value={form.intent}
            onChange={(event) => updateField('intent', event.target.value as LeadFormState['intent'])}
          >
            <option value="viewing">Book a viewing</option>
            <option value="more_info">Get more information</option>
            <option value="valuation">Request a valuation</option>
            <option value="finance">Discuss finance</option>
          </select>
        </label>

        <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
          Message
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
            value={form.message}
            onChange={handleTextChange('message')}
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl bg-[#E6FBF7] p-4 text-xs font-bold leading-5 text-[#00C9A7]">
          <input
            className="mt-1 h-4 w-4 accent-[#00C9A7]"
            type="checkbox"
            checked={form.popiaConsent}
            onChange={(event) => updateField('popiaConsent', event.target.checked)}
          />
          <span>
            I consent to Proppd processing my details for this property enquiry and sharing them with the relevant agent or agency.
            {!form.popiaConsent && <span className="mt-1 block font-bold text-[#00C9A7]">Required before sending.</span>}
          </span>
        </label>

        {errors.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold leading-5 text-red-700">
            <p className="font-bold">Check these details:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {status && (
          <p className="flex items-start gap-2 rounded-2xl border border-[#E5E7EB] p-4 text-xs font-bold leading-5 text-[#6B7280]">
            {isReady ? <CheckCircle2 className="mt-0.5 text-[#00C9A7]" size={16} /> : <ShieldCheck className="mt-0.5 text-[#4A3AFF]" size={16} />}
            {status}
          </p>
        )}

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-5 py-3 font-bold text-white shadow-lg shadow-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting || !form.popiaConsent}
          aria-disabled={isSubmitting || !form.popiaConsent}
        >
          <Mail size={18} /> <span className="text-white">{isSubmitting ? 'Saving enquiry...' : 'Send verified enquiry'}</span>
        </button>

        {mailtoHref && (
          <a className="inline-flex w-full justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E]" href={mailtoHref}>
            Open email again
          </a>
        )}
      </form>

      <a className="mt-3 inline-flex w-full justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E]" href={agentProfileHref}>
        View agent profile
      </a>

      <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-xs font-bold leading-5 text-[#6B7280]">
        <div className="flex items-center gap-2 font-bold text-[#1A1A2E]"><ShieldCheck size={15} className="text-[#00C9A7]" /> POPIA-aware handoff</div>
        <p className="mt-2">Your enquiry includes your consent, listing context, and a clear route to the relevant agent or agency.</p>
      </div>
    </aside>
  );
}
