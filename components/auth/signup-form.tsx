'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowRight, CheckCircle, Mail, Building2, User, MapPin } from 'lucide-react';
import { buildAuthCallbackUrl } from '@/lib/auth/redirects';

type Props = {
  supabaseUrl?: string;
  publishableKey?: string;
};

type Step = 'details' | 'email' | 'sent';

export function SignUpForm({ supabaseUrl, publishableKey }: Props) {
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agency: '',
    area: '',
    role: 'agent',
  });
  const [error, setError] = useState('');

  const supabase = useMemo(() => {
    if (!supabaseUrl || !publishableKey) return null;
    return createBrowserClient(supabaseUrl, publishableKey);
  }, [publishableKey, supabaseUrl]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.email.includes('@');

  const handleSubmit = async () => {
    if (!isValid) return;

    const cleanEmail = form.email.trim().toLowerCase();

    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(window.location.origin, '/dashboard'),
          shouldCreateUser: false,
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            agency: form.agency,
            area: form.area,
            role: form.role,
          },
        },
      });

      if (authError) {
        setError('We could not send a login link for that email. If you are new to Proppd, email info@proppd.com so we can approve your agency first.');
        return;
      }
    } else {
      const subject = encodeURIComponent('Proppd agent access request');
      const body = encodeURIComponent([
        `Please approve Proppd access for: ${cleanEmail}`,
        '',
        `Name: ${form.firstName} ${form.lastName}`,
        `Phone: ${form.phone || 'Not supplied'}`,
        `Agency: ${form.agency || 'Not supplied'}`,
        `Service area: ${form.area || 'Not supplied'}`,
        `Role: ${form.role}`,
      ].join('\n'));
      window.location.href = `mailto:info@proppd.com?subject=${subject}&body=${body}`;
    }

    setStep('sent');
  };

  if (step === 'sent') {
    return (
      <div className="rounded-xl border border-[#E6FBF7] bg-[#E6FBF7] p-6 text-center">
        <CheckCircle size={32} className="mx-auto text-[#00C9A7]" />
        <h3 className="mt-3 text-lg font-bold text-[#1A1A2E]">Check your inbox</h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          If <span className="font-bold text-[#1A1A2E]">{form.email}</span> is approved, the secure link will open your dashboard.
          New agency requests are reviewed before access is enabled.
        </p>
        <p className="mt-3 text-xs text-[#9CA3AF]">No link? Check spam/promotions or email info@proppd.com for approval help.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>
      )}

      {step === 'details' && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="John" icon={<User size={14} />} required />
            <Field label="Last name" value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="Smith" icon={<User size={14} />} required />
          </div>
          <Field label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="john@agency.co.za" type="email" icon={<Mail size={14} />} required />
          <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+27..." type="tel" icon={<Mail size={14} />} />
          <Field label="Agency" value={form.agency} onChange={(v) => update('agency', v)} placeholder="e.g. Seeff, RE/MAX" icon={<Building2 size={14} />} />
          <Field label="Service area" value={form.area} onChange={(v) => update('area', v)} placeholder="e.g. Sandton, Cape Town" icon={<MapPin size={14} />} />

          <button
            type="button"
            onClick={() => setStep('email')}
            disabled={!isValid}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {step === 'email' && (
        <div className="grid gap-4">
          <div className="rounded-lg bg-[#F7F8FA] p-4">
            <p className="text-sm font-bold text-[#1A1A2E]">Confirm your details</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-[#6B7280]">
              <span>{form.firstName} {form.lastName}</span>
              <span>{form.email}</span>
              {form.agency && <span>{form.agency}</span>}
              {form.area && <span>{form.area}</span>}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
            >
              <Mail size={14} /> Request access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, icon, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: React.ReactNode; required?: boolean;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label}
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
        {icon && <span className="text-[#9CA3AF]">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </label>
  );
}
