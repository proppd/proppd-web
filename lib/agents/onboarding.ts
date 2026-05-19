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
  city?: string;
  listingCount?: string;
};

export const launchPackages: AgencyLaunchPackage[] = [
  {
    id: 'starter',
    name: 'Launch Starter',
    price: 'R 0 during pilot',
    summary: 'A low-friction way for independent agents to test Proppd exposure and verified enquiries.',
    bestFor: 'Independent agents and small teams',
    features: ['Verified agent profile', 'Initial listing upload support', 'POPIA-aware enquiry handoff', 'Saved-search buyer requests'],
  },
  {
    id: 'growth',
    name: 'Agency Growth',
    price: 'Pilot pricing by area',
    summary: 'Designed for agencies that need multiple agents, branded visibility, and cleaner lead routing.',
    bestFor: 'Boutique and regional agencies',
    features: ['Agency directory profile', 'Multiple agent profiles', 'Priority listing onboarding', 'Lead quality review queue'],
  },
  {
    id: 'pilot',
    name: 'AgentOS Pilot',
    price: 'Invite-only setup',
    summary: 'Early access to the agent workspace, follow-up signals, seller reporting, and workflow tooling.',
    bestFor: 'Teams ready to co-design AgentOS',
    features: ['Agent workspace preview', 'Follow-up action design', 'WhatsApp-first workflow planning', 'Supabase readiness checklist'],
  },
];

export function buildAgencyApplicationSummary(input: AgencyApplicationInput): string {
  return [
    `Package: ${input.packageName}`,
    '',
    'Agency details',
    `Agency name: ${input.agencyName?.trim() || '[please add]'}`,
    `Contact name: ${input.contactName?.trim() || '[please add]'}`,
    `Primary city/area: ${input.city?.trim() || '[please add]'}`,
    `Approximate active listings: ${input.listingCount?.trim() || '[please add]'}`,
    '',
    'Launch questions',
    '1. Which suburbs or towns do you want to prioritise?',
    '2. How many agents need profiles?',
    '3. Do you need sale listings, rental listings, or both?',
    '4. Who should receive buyer/tenant enquiries?',
    '',
    'POPIA acknowledgement',
    'I understand Proppd may use these details to respond to this agency launch request and coordinate onboarding.',
  ].join('\n');
}

export function buildAgencyApplicationMailto(input: AgencyApplicationInput): string {
  const subject = `Agency launch request: ${input.packageName}`;
  const body = buildAgencyApplicationSummary(input);
  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
