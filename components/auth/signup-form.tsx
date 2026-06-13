'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, Mail, Phone, Building2, User, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { validateSignUpInput } from '@/lib/auth/validation';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

type Props = {
  supabaseUrl?: string;
  publishableKey?: string;
};

type Step = 'form' | 'confirm-email' | 'done';

export function SignUpForm({ supabaseUrl, publishableKey }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agency: '',
    area: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => {
    if (!supabaseUrl || !publishableKey) return null;
    return getBrowserSupabaseClient();
  }, [publishableKey, supabaseUrl]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const valid = validateSignUpInput(form);
    if (valid.success === false) {
      setError(valid.errors[0]);
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();

    if (!supabase) {
      const subject = encodeURIComponent('Proppd account request');
      const body = encodeURIComponent(
        [
          `New account request for: ${cleanEmail}`,
          `Name: ${form.firstName} ${form.lastName}`,
          `Phone: ${form.phone}`,
          `Agency: ${form.agency}`,
          `Area: ${form.area}`,
        ].join('\n'),
      );
      window.location.href = `mailto:info@proppd.com?subject=${subject}&body=${body}`;
      setStep('confirm-email');
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
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

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      setStep('done');
      window.location.assign('/dashboard');
      return;
    }

    setStep('confirm-email');
  };

  if (step === 'done') {
    return (
      <div className="rounded-xl border border-[#E6FBF7] bg-[#E6FBF7] p-6 text-center">
        <CheckCircle size={32} className="mx-auto text-[#00C9A7]" />
        <h3 className="mt-3 text-lg font-bold text-[#1A1A2E]">Account created</h3>
        <p className="mt-2 text-sm text-[#6B7280]">Taking you to your dashboard…</p>
      </div>
    );
  }

  if (step === 'confirm-email') {
    return (
      <div className="rounded-xl border border-[#E6FBF7] bg-[#E6FBF7] p-6 text-center">
        <CheckCircle size={32} className="mx-auto text-[#00C9A7]" />
        <h3 className="mt-3 text-lg font-bold text-[#1A1A2E]">Confirm your email</h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          Your account is ready — we sent a confirmation email to{' '}
          <span className="font-bold text-[#1A1A2E]">{form.email}</span>.
          Confirm it, then sign in with your email and password.
        </p>
        <p className="mt-3 text-xs text-[#9CA3AF]">Didn&apos;t receive it? Check your spam folder.</p>
        <a href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
          Go to sign in <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>
      )}

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="John" icon={<User size={14} />} autoComplete="given-name" required />
          <Field label="Last name" value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="Smith" icon={<User size={14} />} autoComplete="family-name" required />
        </div>
        <Field label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="john@agency.co.za" type="email" icon={<Mail size={14} />} autoComplete="email" required />
        <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+27..." type="tel" icon={<Phone size={14} />} autoComplete="tel" />
        <Field label="Agency" value={form.agency} onChange={(v) => update('agency', v)} placeholder="e.g. Seeff, RE/MAX" icon={<Building2 size={14} />} />
        <Field label="Service area" value={form.area} onChange={(v) => update('area', v)} placeholder="e.g. Sandton, Cape Town" icon={<MapPin size={14} />} />

        <Field
          label="Password"
          value={form.password}
          onChange={(v) => update('password', v)}
          placeholder="At least 8 characters, letters and numbers"
          type={showPassword ? 'text' : 'password'}
          icon={<Lock size={14} />}
          autoComplete="new-password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="shrink-0 text-[#9CA3AF] transition hover:text-[#1A1A2E]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <Field
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(v) => update('confirmPassword', v)}
          placeholder="Repeat your password"
          type={showPassword ? 'text' : 'password'}
          icon={<Lock size={14} />}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
        >
          {loading ? 'Creating account…' : <>Create account <ArrowRight size={14} /></>}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, icon, required, autoComplete, trailing }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  autoComplete?: string;
  trailing?: React.ReactNode;
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
          autoComplete={autoComplete}
        />
        {trailing}
      </div>
    </label>
  );
}
