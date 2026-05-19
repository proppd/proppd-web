import { describe, expect, it } from 'vitest';
import { buildValuationRequestMailto, buildValuationRequestSummary, formatValuationReason, valuationReadinessSteps } from '@/lib/valuation/request';

describe('valuation request helpers', () => {
  it('defines valuation readiness steps for seller handoff', () => {
    expect(valuationReadinessSteps).toHaveLength(3);
    expect(valuationReadinessSteps.map((step) => step.title)).toEqual(['Property basics', 'Comparable evidence', 'Verified routing']);
  });

  it('builds a POPIA-aware valuation request summary', () => {
    const summary = buildValuationRequestSummary({
      reason: 'selling',
      propertyType: 'Townhouse',
      suburb: 'Umhlanga',
      city: 'Durban',
      bedrooms: '3',
      timeframe: 'Next 3 months',
      ownerName: 'Aiden Naidoo',
      contactEmail: 'OWNER@Example.com',
      contactPhone: '+27 82 555 0101',
    });

    expect(summary).toContain('Reason: I may sell');
    expect(summary).toContain('Property type: Townhouse');
    expect(summary).toContain('Email: owner@example.com');
    expect(summary).toContain('POPIA acknowledgement');
  });

  it('builds an encoded valuation mailto with location context', () => {
    const mailto = buildValuationRequestMailto({ reason: 'market_check', suburb: 'Sea Point', city: 'Cape Town' });

    expect(mailto).toContain('mailto:info@proppd.com');
    expect(mailto).toContain(encodeURIComponent('Valuation request: Sea Point, Cape Town'));
    expect(mailto).toContain(encodeURIComponent('Reason: I want a market check'));
  });

  it('formats valuation reasons for UI labels', () => {
    expect(formatValuationReason('renting')).toBe('I may rent it out');
    expect(formatValuationReason('agent_appraisal')).toBe('I need an agent appraisal');
  });
});
