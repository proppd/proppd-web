import { describe, expect, it } from 'vitest';
import { estimateAffordability, formatRand } from '@/lib/finance/affordability';

describe('estimateAffordability', () => {
  it('estimates a conservative purchase price from income, debt, deposit, rate, and term', () => {
    const estimate = estimateAffordability({
      grossMonthlyIncome: 60000,
      monthlyDebt: 3000,
      deposit: 250000,
      annualInterestRate: 11.75,
      termYears: 20,
    });

    expect(estimate.maxMonthlyRepayment).toBe(15000);
    expect(estimate.estimatedLoanAmount).toBeGreaterThan(1300000);
    expect(estimate.estimatedLoanAmount).toBeLessThan(1500000);
    expect(estimate.estimatedPurchasePrice).toBe(estimate.estimatedLoanAmount + 250000);
    expect(estimate.requiredIncomeBuffer).toBe(42000);
  });

  it('never returns negative affordability when debt exceeds the repayment guideline', () => {
    const estimate = estimateAffordability({
      grossMonthlyIncome: 20000,
      monthlyDebt: 10000,
      deposit: 0,
      annualInterestRate: 11.75,
      termYears: 20,
    });

    expect(estimate.maxMonthlyRepayment).toBe(0);
    expect(estimate.estimatedLoanAmount).toBe(0);
    expect(estimate.estimatedPurchasePrice).toBe(0);
  });
});

describe('formatRand', () => {
  it('formats rounded South African rand values', () => {
    expect(formatRand(1234567.89)).toBe('R 1 234 568');
  });
});
