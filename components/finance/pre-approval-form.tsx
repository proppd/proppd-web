'use client';

import { useState } from 'react';
import { FileCheck, CheckCircle, ArrowRight } from 'lucide-react';

interface PreApprovalFormProps {
  listingPrice?: number;
  listingTitle?: string;
}

export function PreApprovalForm({ listingPrice, listingTitle }: PreApprovalFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    // Step 1 - Personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Step 2 - Financial
    grossIncome: '',
    monthlyDebt: '',
    deposit: listingPrice ? String(Math.round(listingPrice * 0.1)) : '',
    employmentType: 'permanent',
    // Step 3 - Property
    propertyValue: listingPrice ? String(listingPrice) : '',
    propertyType: 'house',
    timeline: '3-6months',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store application
    const apps = JSON.parse(localStorage.getItem('proppd…pprovals') || '[]');
    apps.push({ ...formData, createdAt: new Date().toISOString() });
    localStorage.setItem('proppd…pprovals', JSON.stringify(apps));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-[#EFF6FF] bg-[#EFF6FF] p-6 text-center">
        <CheckCircle size={32} className="mx-auto text-[#2563EB]" />
        <h3 className="mt-3 text-lg font-bold text-[#1A1A2E]">Application received</h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          We'll review your pre-approval application and get back to you within 2 business days.
        </p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          {listingTitle && `Regarding: ${listingTitle}`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <FileCheck size={18} className="text-[#4A3AFF]" />
        <h3 className="text-base font-bold text-[#1A1A2E]">Get pre-approved</h3>
      </div>
      <p className="mt-1 text-sm text-[#6B7280]">
        Start your bond application before you find the right home.
      </p>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step >= s ? 'bg-[#4A3AFF] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-[#4A3AFF]' : 'bg-[#E5E7EB]'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        {step === 1 && (
          <div className="grid gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Personal details</p>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="First name" value={formData.firstName} onChange={(v) => update('firstName', v)} placeholder="John" required />
              <InputField label="Last name" value={formData.lastName} onChange={(v) => update('lastName', v)} placeholder="Smith" required />
            </div>
            <InputField label="Email" type="email" value={formData.email} onChange={(v) => update('email', v)} placeholder="john@example.com" required />
            <InputField label="Phone" type="tel" value={formData.phone} onChange={(v) => update('phone', v)} placeholder="+27..." required />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Financial snapshot</p>
            <InputField label="Gross monthly income (ZAR)" type="number" value={formData.grossIncome} onChange={(v) => update('grossIncome', v)} placeholder="50000" required />
            <InputField label="Monthly debt obligations (ZAR)" type="number" value={formData.monthlyDebt} onChange={(v) => update('monthlyDebt', v)} placeholder="5000" />
            <InputField label="Deposit amount (ZAR)" type="number" value={formData.deposit} onChange={(v) => update('deposit', v)} placeholder="200000" required />
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Employment type
              <select
                value={formData.employmentType}
                onChange={(e) => update('employmentType', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              >
                <option value="permanent">Permanent employment</option>
                <option value="self-employed">Self-employed</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Property details</p>
            <InputField label="Property value (ZAR)" type="number" value={formData.propertyValue} onChange={(v) => update('propertyValue', v)} placeholder="3000000" required />
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Property type
              <select
                value={formData.propertyType}
                onChange={(e) => update('propertyType', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="townhouse">Townhouse</option>
                <option value="duplex">Duplex</option>
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Purchase timeline
              <select
                value={formData.timeline}
                onChange={(e) => update('timeline', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              >
                <option value="asap">ASAP</option>
                <option value="1-3months">1-3 months</option>
                <option value="3-6months">3-6 months</option>
                <option value="6-12months">6-12 months</option>
                <option value="exploring">Just exploring</option>
              </select>
            </label>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="text-sm font-bold text-[#6B7280] hover:text-[#1A1A2E]"
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
            >
              Submit application <ArrowRight size={14} />
            </button>
          )}
        </div>
      </form>

      <p className="mt-3 text-[11px] text-[#9CA3AF]">
        Indicative only. Final approval depends on lender assessment and credit checks.
      </p>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, required }: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}
