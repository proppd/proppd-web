'use client';

import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

interface MortgageCalculatorProps {
  price: number;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [deposit, setDeposit] = useState(Math.round(price * 0.1));
  const [interestRate, setInterestRate] = useState(11.75);
  const [termYears, setTermYears] = useState(20);

  const estimate = useMemo(() => {
    const loanAmount = Math.max(0, price - deposit);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;

    if (monthlyRate === 0) {
      return {
        monthlyPayment: numPayments > 0 ? loanAmount / numPayments : 0,
        totalInterest: 0,
        totalCost: loanAmount,
      };
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalCost = monthlyPayment * numPayments;
    const totalInterest = totalCost - loanAmount;

    return { monthlyPayment, totalInterest, totalCost };
  }, [price, deposit, interestRate, termYears]);

  const fmt = (value: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Calculator size={18} className="text-[#4A3AFF]" />
        <h3 className="text-base font-bold text-[#1A1A2E]">Mortgage calculator</h3>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          Deposit
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={price}
            step={10000}
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
            Interest rate %
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
            Term (years)
            <input
              type="number"
              min={1}
              max={30}
              step={1}
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value) || 1)}
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[#1A1A2E] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/50">Estimated monthly payment</p>
        <p className="mt-1 text-2xl font-bold text-white">{fmt(estimate.monthlyPayment)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-white/50">Total interest</p>
            <p className="mt-0.5 font-bold text-white/80">{fmt(estimate.totalInterest)}</p>
          </div>
          <div>
            <p className="text-white/50">Total cost</p>
            <p className="mt-0.5 font-bold text-white/80">{fmt(estimate.totalCost)}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[#9CA3AF]">
        Indicative only. Actual rates depend on lender, credit profile, and deposit size.
      </p>
    </div>
  );
}
