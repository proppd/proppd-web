export type ValuationReason = 'selling' | 'renting' | 'market_check' | 'agent_appraisal';

export type ValuationRequestInput = {
  reason: ValuationReason;
  propertyType?: string;
  suburb?: string;
  city?: string;
  bedrooms?: string;
  timeframe?: string;
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type ValuationReadinessStep = {
  title: string;
  detail: string;
};

const reasonLabels: Record<ValuationReason, string> = {
  selling: 'I may sell',
  renting: 'I may rent it out',
  market_check: 'I want a market check',
  agent_appraisal: 'I need an agent appraisal',
};

export const valuationReadinessSteps: ValuationReadinessStep[] = [
  {
    title: 'Property basics',
    detail: 'Suburb, property type, bedroom count, parking, condition, and any recent improvements.',
  },
  {
    title: 'Comparable evidence',
    detail: 'Recent nearby listings, sold-price indicators where available, and rental demand signals.',
  },
  {
    title: 'Verified routing',
    detail: 'Route the request to suitable agents only after the owner has shared contact consent.',
  },
];

export function buildValuationRequestSummary(input: ValuationRequestInput): string {
  return [
    `Reason: ${reasonLabels[input.reason]}`,
    '',
    'Property details',
    `Property type: ${input.propertyType?.trim() || '[please add]'}`,
    `Suburb: ${input.suburb?.trim() || '[please add]'}`,
    `City: ${input.city?.trim() || '[please add]'}`,
    `Bedrooms: ${input.bedrooms?.trim() || '[please add]'}`,
    `Timeframe: ${input.timeframe?.trim() || '[please add]'}`,
    '',
    'Owner / landlord contact',
    `Name: ${input.ownerName?.trim() || '[please add]'}`,
    `Email: ${normaliseOptionalEmail(input.contactEmail)}`,
    `Phone: ${input.contactPhone?.trim() || '[please add]'}`,
    '',
    'Valuation notes',
    'Please help me understand an indicative market range and whether Proppd can route this to a suitable launch partner agent.',
    '',
    'POPIA acknowledgement',
    'I understand Proppd may use these details to respond to this valuation request and coordinate a suitable agent handoff.',
  ].join('\n');
}

export function buildValuationRequestMailto(input: ValuationRequestInput): string {
  const location = [input.suburb, input.city].map((value) => value?.trim()).filter(Boolean).join(', ') || 'property';
  const subject = `Valuation request: ${location}`;
  const body = buildValuationRequestSummary(input);
  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatValuationReason(reason: ValuationReason): string {
  return reasonLabels[reason];
}

function normaliseOptionalEmail(value?: string): string {
  const email = value?.trim().toLowerCase();
  return email || '[please add]';
}
