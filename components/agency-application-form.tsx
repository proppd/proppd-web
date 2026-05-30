'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import {
  buildAgencyApplicationMailto,
  buildAgencyApplicationSummary,
  launchPackages,
  splitContactName,
  type AgencyApplicationInput,
} from '@/lib/agents/onboarding';

const initialState: AgencyApplicationInput = {
  packageName: 'Agency Growth',
  agencyName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  city: '',
  listingCount: '',
  notes: '',
};

type Props = {
  id?: string;
};

export function AgencyApplicationForm({ id = 'launch-application' }: Props) {
  const [form, setForm] = useState<AgencyApplicationInput>(initialState);
  const [popiaConsent, setPopiaConsent] = useState(false);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = useMemo(() => {
    return Boolean(
      popiaConsent &&
        form.packageName.trim() &&
        form.agencyName?.trim() &&
        form.contactName?.trim() &&
        form.contactEmail?.trim() &&
        form.contactPhone?.trim() &&
        form.city?.trim(),
    );
  }, [form, popiaConsent]);

  function updateField<K extends keyof AgencyApplicationInput>(key: K, value: AgencyApplicationInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus('');
  }

  function handleTextChange(key: keyof Omit<AgencyApplicationInput, 'packageName'>) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(key, event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);

    const requiredErrors = [
      !form.packageName?.trim() ? 'Choose a launch package.' : null,
      !form.agencyName?.trim() ? 'Agency name is required.' : null,
      !form.contactName?.trim() ? 'Contact name is required.' : null,
      !form.contactEmail?.trim() ? 'Contact email is required.' : null,
      !form.contactPhone?.trim() ? 'Contact phone is required.' : null,
      !form.city?.trim() ? 'Primary city/area is required.' : null,
      !popiaConsent ? 'POPIA consent is required.' : null,
    ].filter(Boolean) as string[];

    if (requiredErrors.length > 0) {
      setErrors(requiredErrors);
      setStatus('Please fix the highlighted launch details first.');
      return;
    }

    const summary = buildAgencyApplicationSummary(form);
    const { name, surname } = splitContactName(form.contactName);
    const payload = {
      name,
      surname,
      email: form.contactEmail ?? '',
      phone: form.contactPhone ?? '',
      message: summary,
      intent: 'more_info' as const,
      popiaConsent: true,
      sourcePage: '/list-with-us',
    };

    setIsSubmitting(true);
    setStatus('Saving your launch request securely...');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json().catch(() => null)) as { ok?: boolean; errors?: string[]; error?: string } | null;

      if (response.ok && responsePayload?.ok) {
        setStatus('Launch request saved. Proppd will review the agency details and follow up.');
        return;
      }

      if (response.status === 503) {
        const mailto = buildAgencyApplicationMailto(form);
        setStatus('We could not complete the portal handoff, so your email app will open with the launch details ready to send.');
        window.location.href = mailto;
        return;
      }

      if (responsePayload?.errors?.length) {
        setErrors(responsePayload.errors);
        setStatus('Please fix the highlighted launch details first.');
        return;
      }

      const mailto = buildAgencyApplicationMailto(form);
      setStatus(responsePayload?.error ?? 'We could not complete the portal handoff. Opening email with the launch details ready to send.');
      window.location.href = mailto;
    } catch {
      const mailto = buildAgencyApplicationMailto(form);
      setStatus('Network issue while sending. Opening email with the launch details ready to send.');
      window.location.href = mailto;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id={id} className="mt-8 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <ShieldCheck className="text-[#12D6C5]" size={24} />
        <div>
          <p className="text-sm font-black uppercase tracking-[.18em] text-[#3B49FF]">Launch application</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-.05em]">Start the agency onboarding flow.</h2>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">
        Share the agency details, stock readiness, and routing needs once so Proppd can review the launch fit and follow up with the right next step.
      </p>

      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500 lg:col-span-2">
          Launch package
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-black text-[#050A30] outline-none focus:border-[#3B49FF]"
            value={form.packageName}
            onChange={(event) => updateField('packageName', event.target.value)}
          >
            {launchPackages.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500">
          Agency name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            value={form.agencyName ?? ''}
            onChange={handleTextChange('agencyName')}
            placeholder="Sakstons"
          />
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500">
          Contact name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            value={form.contactName ?? ''}
            onChange={handleTextChange('contactName')}
            placeholder="Lisa Brown"
          />
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500">
          Contact email
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            type="email"
            value={form.contactEmail ?? ''}
            onChange={handleTextChange('contactEmail')}
            placeholder="team@sakstons.com"
          />
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500">
          Contact phone
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            type="tel"
            value={form.contactPhone ?? ''}
            onChange={handleTextChange('contactPhone')}
            placeholder="+27 11 123 4567"
          />
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500">
          Primary city/area
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            value={form.city ?? ''}
            onChange={handleTextChange('city')}
            placeholder="Sandton"
          />
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500">
          Approximate active listings
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            value={form.listingCount ?? ''}
            onChange={handleTextChange('listingCount')}
            placeholder="38"
          />
        </label>

        <label className="block text-xs font-black uppercase tracking-[.12em] text-slate-500 lg:col-span-2">
          Notes
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-[#F5F7FA] px-4 py-3 text-sm font-bold text-[#050A30] outline-none focus:border-[#3B49FF]"
            value={form.notes ?? ''}
            onChange={handleTextChange('notes')}
            placeholder="Any stock import notes, team size, or launch concerns"
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl bg-[#eefcf9] p-4 text-xs font-bold leading-5 text-[#0f766e] lg:col-span-2">
          <input
            className="mt-1 h-4 w-4 accent-[#12D6C5]"
            type="checkbox"
            checked={popiaConsent}
            onChange={(event) => setPopiaConsent(event.target.checked)}
          />
          <span>
            I consent to Proppd processing these details for agency onboarding and sharing them with the relevant internal team.
            {!popiaConsent && <span className="mt-1 block font-black text-[#0f766e]">Required before sending.</span>}
          </span>
        </label>

        {errors.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold leading-5 text-red-700 lg:col-span-2">
            <p className="font-black">Check these details:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {status && (
          <p className="flex items-start gap-2 rounded-2xl border border-slate-200 p-4 text-xs font-bold leading-5 text-slate-600 lg:col-span-2">
            {isReady ? <CheckCircle2 className="mt-0.5 text-[#12D6C5]" size={16} /> : <ShieldCheck className="mt-0.5 text-[#3B49FF]" size={16} />}
            {status}
          </p>
        )}

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#050A30] px-5 py-3 font-black text-white shadow-lg shadow-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
          type="submit"
          disabled={isSubmitting || !popiaConsent}
        >
          <Mail size={18} /> <span>{isSubmitting ? 'Saving request...' : 'Send launch request'}</span>
        </button>
      </form>
    </section>
  );
}
