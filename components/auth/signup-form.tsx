'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Mail, Building2, User, MapPin, BadgeCheck, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

type Props = {
  supabaseUrl?: string;
  publishableKey?: string;
};

type Step = 'details' | 'email' | 'sent';

type FFCVerificationState = {
  status: 'idle' | 'checking' | 'verified' | 'failed';
  message?: string;
  record?: { fullName?: string; firmName?: string };
};

export function SignUpForm({ supabaseUrl, publishableKey }: Props) {
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agency: '',
    area: '',
    fidelityFundCertificateNumber: '',
    role: 'agent',
  });
  const [error, setError] = useState('');
  const [ffcVerification, setFFCVerification] = useState<FFCVerificationState>({ status: 'idle' });

  const isConfigured = Boolean(supabaseUrl && publishableKey);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Any change to an identity field invalidates a prior PPRA check.
    if (['fidelityFundCertificateNumber', 'firstName', 'lastName'].includes(field)) {
      setFFCVerification({ status: 'idle' });
    }
  };

  const fieldsComplete = Boolean(
    form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.email.includes('@') && form.fidelityFundCertificateNumber.trim(),
  );
  // The agent can only continue once the PPRA check has succeeded.
  const canContinue = fieldsComplete && ffcVerification.status === 'verified';

  const verifyFFC = async () => {
    const ffc = form.fidelityFundCertificateNumber.trim();
    if (!ffc) return;

    setFFCVerification({ status: 'checking' });

    try {
      const response = await fetch('/api/auth/verify-ffc', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ffcNumber: ffc,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
        }),
      });

      const data = await response.json();
      const verification = data?.verification;

      if (response.ok && verification?.status === 'verified') {
        setFFCVerification({
          status: 'verified',
          message: `PPRA verified — ${verification.record?.fullName ?? 'certificate active'}`,
          record: {
            fullName: verification.record?.fullName,
            firmName: verification.record?.firmName ?? verification.record?.tradeName,
          },
        });
      } else if (response.ok && verification) {
        const labels: Record<string, string> = {
          not_found: 'FFC number not found on the PPRA register.',
          invalid_certificate: 'This certificate is not currently valid.',
          name_mismatch: 'The name on the PPRA register does not match yours.',
          endpoint_error: 'PPRA check is temporarily unavailable — you can still submit.',
        };
        setFFCVerification({
          status: 'failed',
          message: labels[verification.status] ?? 'Could not verify this FFC number.',
        });
      } else {
        setFFCVerification({
          status: 'failed',
          message: data?.error ?? 'Could not verify this FFC number.',
        });
      }
    } catch {
      setFFCVerification({
        status: 'failed',
        message: 'PPRA check is temporarily unavailable — you can still submit.',
      });
    }
  };

  const handleSubmit = async () => {
    if (!canContinue) return;

    const cleanEmail = form.email.trim().toLowerCase();

    if (isConfigured) {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          nextPath: '/dashboard',
          allowSignUp: false,
          profile: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            agency: form.agency,
            area: form.area,
            fidelity_fund_certificate_number: form.fidelityFundCertificateNumber,
            role: form.role,
          },
        }),
      });

      if (!response.ok) {
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
        `Fidelity Fund Certificate number: ${form.fidelityFundCertificateNumber || 'Not supplied'}`,
        `Role: ${form.role}`,
      ].join('\n'));
      window.location.href = `mailto:info@proppd.com?subject=${subject}&body=${body}`;
    }

    setStep('sent');
  };

  if (step === 'sent') {
    return (
      <div className="rounded-xl border border-[#EFF6FF] bg-[#EFF6FF] p-6 text-center">
        <CheckCircle size={32} className="mx-auto text-[#2563EB]" />
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
          {/* PPRA verification notice */}
          <div className="flex items-start gap-3 rounded-xl border border-[#A7F3D0] bg-[#F0FDF4] p-4">
            <Image src="/ppra-verified-badge.png" alt="Agent Verified by the PPRA" width={48} height={48} className="shrink-0 drop-shadow-sm" />
            <div>
              <p className="text-sm font-bold text-[#166534]">PPRA verification required</p>
              <p className="mt-1 text-xs leading-5 text-[#15803d]">
                Your <span className="font-bold">name</span>, <span className="font-bold">surname</span>, <span className="font-bold">agency</span> and <span className="font-bold">Fidelity Fund Certificate</span> are checked against the live PPRA register. You can only continue once verification succeeds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="John" icon={<User size={14} />} required />
            <Field label="Last name" value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="Smith" icon={<User size={14} />} required />
          </div>
          <Field label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="john@agency.co.za" type="email" icon={<Mail size={14} />} required />
          <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+27..." type="tel" icon={<Mail size={14} />} />
          <Field label="Agency" value={form.agency} onChange={(v) => update('agency', v)} placeholder="e.g. Seeff, RE/MAX" icon={<Building2 size={14} />} />
          <Field label="Service area" value={form.area} onChange={(v) => update('area', v)} placeholder="e.g. Sandton, Cape Town" icon={<MapPin size={14} />} />
          <div>
            <Field label="Fidelity Fund Certificate number" value={form.fidelityFundCertificateNumber} onChange={(v) => update('fidelityFundCertificateNumber', v)} placeholder="e.g. FFC 1234567" icon={<BadgeCheck size={14} />} required />

            {/* Verify button — required to unlock Continue */}
            {ffcVerification.status !== 'verified' && (
              <button
                type="button"
                onClick={verifyFFC}
                disabled={!fieldsComplete || ffcVerification.status === 'checking'}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#4A3AFF] bg-[#4A3AFF]/5 px-4 py-2.5 text-sm font-bold text-[#4A3AFF] transition hover:bg-[#4A3AFF]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ffcVerification.status === 'checking' ? (
                  <><Loader2 size={15} className="animate-spin" /> Checking PPRA register…</>
                ) : (
                  <><ShieldCheck size={15} /> Verify with PPRA</>
                )}
              </button>
            )}

            {ffcVerification.status === 'verified' && (
              <div className="mt-2 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                  <CheckCircle size={14} /> PPRA verified
                </p>
                {ffcVerification.record?.fullName && (
                  <p className="mt-1 text-xs font-semibold text-[#15803d]">Name: {ffcVerification.record.fullName}</p>
                )}
                {ffcVerification.record?.firmName && (
                  <p className="text-xs font-semibold text-[#15803d]">Agency: {ffcVerification.record.firmName}</p>
                )}
              </div>
            )}

            {ffcVerification.status === 'failed' && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-700">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{ffcVerification.message} If you believe this is an error, email info@proppd.com.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep('email')}
            disabled={!canContinue}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue <ArrowRight size={14} />
          </button>
          {fieldsComplete && ffcVerification.status !== 'verified' && (
            <p className="-mt-1 text-center text-xs font-semibold text-[#9CA3AF]">Complete PPRA verification above to continue.</p>
          )}
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
              <span className="flex items-center gap-1">
                FFC: {form.fidelityFundCertificateNumber}
                {ffcVerification.status === 'verified' && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                    <ShieldCheck size={10} /> PPRA verified
                  </span>
                )}
              </span>
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
