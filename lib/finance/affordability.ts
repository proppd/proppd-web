export type AffordabilityInput = {
  grossMonthlyIncome: number;
  monthlyDebt: number;
  deposit: number;
  annualInterestRate: number;
  termYears: number;
};

export type AffordabilityEstimate = {
  maxMonthlyRepayment: number;
  estimatedLoanAmount: number;
  estimatedPurchasePrice: number;
  requiredIncomeBuffer: number;
};

const DEFAULT_REPAYMENT_RATIO = 0.3;

export function estimateAffordability(input: AffordabilityInput): AffordabilityEstimate {
  const grossMonthlyIncome = positive(input.grossMonthlyIncome);
  const monthlyDebt = positive(input.monthlyDebt);
  const deposit = positive(input.deposit);
  const annualInterestRate = positive(input.annualInterestRate);
  const termYears = positive(input.termYears);

  const maxRepaymentFromIncome = grossMonthlyIncome * DEFAULT_REPAYMENT_RATIO;
  const maxMonthlyRepayment = Math.max(0, maxRepaymentFromIncome - monthlyDebt);
  const monthlyRate = annualInterestRate / 100 / 12;
  const months = Math.max(1, Math.round(termYears * 12));
  const estimatedLoanAmount = monthlyPaymentToPrincipal(maxMonthlyRepayment, monthlyRate, months);

  return {
    maxMonthlyRepayment: roundCurrency(maxMonthlyRepayment),
    estimatedLoanAmount: roundCurrency(estimatedLoanAmount),
    estimatedPurchasePrice: roundCurrency(estimatedLoanAmount + deposit),
    requiredIncomeBuffer: roundCurrency(Math.max(0, grossMonthlyIncome - monthlyDebt - maxMonthlyRepayment)),
  };
}

export function formatRand(value: number): string {
  return `R ${Math.round(value).toLocaleString('en-ZA')}`;
}

function monthlyPaymentToPrincipal(payment: number, monthlyRate: number, months: number): number {
  if (payment <= 0) return 0;
  if (monthlyRate === 0) return payment * months;
  return payment * ((1 - (1 + monthlyRate) ** -months) / monthlyRate);
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function roundCurrency(value: number): number {
  return Math.round(value);
}
