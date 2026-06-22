'use client';

import { useMemo, useState } from 'react';
import { Calculator, Mail, ShieldCheck } from 'lucide-react';
import { estimateAffordability, formatRand, type AffordabilityInput } from '@/lib/finance/affordability';

const presets = [
  {
    label: 'First-time buyer',
    input: { grossMonthlyIncome: 42000, monthlyDebt: 2500, deposit: 120000, annualInterestRate: 11.75, termYears: 20 },
  },
  {
    label: 'Growing family',
    input: { grossMonthlyIncome: 68000, monthlyDebt: 4500, deposit: 250000, annualInterestRate: 11.75, termYears: 20 },
  },
  {
    label: 'Move-up buyer',
    input: { grossMonthlyIncome: 95000, monthlyDebt: 8000, deposit: 450000, annualInterestRate: 11.75, termYears: 20 },
  },
] as const;

export function HomeLoanCalculator() {
  const [input, setInput] = useState<AffordabilityInput>(presets[0].input);
  const [activePreset, setActivePreset] = useState<(typeof presets)[number]['label']>(presets[0].label);
  const estimate = useMemo(() => estimateAffordability(input), [input]);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-2xl shadow-slate-200/70">
      <div className="flex items-center gap-3 rounded-lg bg-[#1A1A2E] p-6 text-white">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
          <Calculator size={22} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-white/50">Indicative calculator</p>
          <h2 className="text-2xl font-bold tracking-[-.04em]">Affordability guide</h2>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition ${activePreset === preset.label ? 'border-[#4A3AFF] bg-[#4A3AFF] text-white' : 'border-[#E5E7EB] bg-slate-50 text-[#6B7280] hover:border-[#4A3AFF] hover:text-[#4A3AFF]'}`}
            type="button"
            onClick={() => {
              setInput(preset.input);
              setActivePreset(preset.label);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Gross monthly income" value={input.grossMonthlyIncome} onChange={(value) => setInput((current) => ({ ...current, grossMonthlyIncome: value }))} />
        <Field label="Monthly debt" value={input.monthlyDebt} onChange={(value) => setInput((current) => ({ ...current, monthlyDebt: value }))} />
        <Field label="Deposit" value={input.deposit} onChange={(value) => setInput((current) => ({ ...current, deposit: value }))} />
        <Field label="Interest rate %" value={input.annualInterestRate} onChange={(value) => setInput((current) => ({ ...current, annualInterestRate: value }))} />
        <Field label="Term years" value={input.termYears} onChange={(value) => setInput((current) => ({ ...current, termYears: value }))} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Metric label="Monthly guide" value={formatRand(estimate.maxMonthlyRepayment)} />
        <Metric label="Purchase range" value={formatRand(estimate.estimatedPurchasePrice)} />
        <Metric label="Income buffer" value={formatRand(estimate.requiredIncomeBuffer)} />
      </div>

      <div className="mt-5 rounded-lg bg-[#F7F8FA] p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A2E]">
          <ShieldCheck size={16} className="text-[#4A3AFF]" /> Indicative only
        </div>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Final affordability depends on lender rules, credit profile, purchase costs, insurance, rate changes, and verified documents.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#4A3AFF]/20 transition hover:bg-[#1A1A2E]" href="mailto:info@proppd.com?subject=Home%20loan%20readiness">
          <Mail size={15} /> Register finance interest
        </a>
        <a className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties/for-sale">
          Browse homes for sale
        </a>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-lg border border-[#E5E7EB] bg-white p-4 text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF] shadow-sm transition focus-within:border-[#4A3AFF] focus-within:ring-4 focus-within:ring-[#4A3AFF]/10">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step={label === 'Interest rate %' ? '0.05' : '1000'}
        value={value}
        onChange={(event) => onChange(Number(event.target.value || 0))}
        className="mt-2 w-full rounded-lg bg-transparent text-lg font-bold tracking-[-.03em] text-[#1A1A2E] outline-none"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#1A1A2E] p-4 text-white">
      <p className="text-[.7rem] font-bold uppercase tracking-[.14em] text-white/50">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-[-.03em]">{value}</p>
    </div>
  );
}

function SupportCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
      <h3 className="text-xl font-bold tracking-[-.03em]">{title}</h3>
      <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">{body}</p>
      {actionHref && actionLabel && (
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF]" href={actionHref}>
          {actionLabel} →
        </a>
      )}
    </article>
  );
}
