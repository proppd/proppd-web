export type AgencyLaunchPackage = {
  id: 'starter' | 'growth' | 'pilot';
  name: string;
  price: string;
  summary: string;
  bestFor: string;
  features: string[];
};

export type AgencyApplicationInput = {
  packageName: string;
  agencyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  listingCount?: string;
  notes?: string;
};

export function splitContactName(value?: string): { name: string; surname: string } {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return { name: '[please add]', surname: '[please add]' };

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { name: parts[0], surname: 'Team' };

  return { name: parts[0], surname: parts.slice(1).join(' ') };
}

export const launchPackages: AgencyLaunchPackage[] = [
  {
    id: 'starter',
    name: 'Launch Starter',
    price: 'R 0 during pilot',
    summary: 'Test Proppd exposure with verified enquiries.',
    bestFor: 'Independent agents and small teams',
    features: ['Verified agent profile', 'Initial listing upload support', 'POPIA-aware enquiry handoff', 'Launch check-in call'],
  },
  {
    id: 'growth',
    name: 'Agency Growth',
    price: 'Pilot pricing by area',
    summary: 'For agencies that need multiple agents and cleaner lead routing.',
    bestFor: 'Boutique and regional agencies',
    features: ['Agency directory profile', 'Multiple agent profiles', 'Priority listing onboarding', 'Routing setup support'],
  },
  {
    id: 'pilot',
    name: 'AgentOS Pilot',
    price: 'Invite-only setup',
    summary: 'Invite-only access to the agent workspace and workflow layer.',
    bestFor: 'Teams ready to co-design AgentOS',
    features: ['Agent workspace preview', 'Follow-up action design', 'WhatsApp-first workflow planning', 'Pilot roadmap workshop'],
  },
];

export function buildAgencyApplicationSummary(input: AgencyApplicationInput): string {
  return [
    `Package: ${input.packageName}`,
    '',
    'Agency details',
    `Agency name: ${input.agencyName?.trim() || '[please add]'}`,
    `Contact name: ${input.contactName?.trim() || '[please add]'}`,
    `Contact email: ${input.contactEmail?.trim() || '[please add]'}`,
    `Contact phone: ${input.contactPhone?.trim() || '[please add]'}`,
    `Primary city/area: ${input.city?.trim() || '[please add]'}`,
    `Approximate active listings: ${input.listingCount?.trim() || '[please add]'}`,
    input.notes?.trim() ? `Notes: ${input.notes.trim()}` : null,
    '',
    'Launch questions',
    '1. Which suburbs or towns do you want to prioritise?',
    '2. How many agents need profiles?',
    '3. Do you need sale listings, rental listings, or both?',
    '4. Who should receive buyer/tenant enquiries?',
    '',
    'POPIA acknowledgement',
    'I understand Proppd may use these details to respond to this agency launch request and coordinate onboarding.',
  ].filter((line) => line !== null).join('\n');
}

export function buildAgencyApplicationMailto(input: AgencyApplicationInput): string {
  const subject = `Agency launch request: ${input.packageName}`;
  const body = buildAgencyApplicationSummary(input);
  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
