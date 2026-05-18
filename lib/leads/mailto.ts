import { type LeadInput, validateLeadInput } from './validation';

export type ListingLeadContext = {
  id: string;
  slug: string;
  title: string;
  price: string;
  agent: string;
  agency: string;
};

export type LeadMailtoInput = {
  listing: ListingLeadContext;
  lead: LeadInput;
  sourcePath: string;
};

const intentLabels: Record<LeadInput['intent'], string> = {
  viewing: 'Viewing request',
  more_info: 'More information',
  valuation: 'Valuation request',
  finance: 'Finance assistance',
};

export function buildLeadSummary(input: LeadMailtoInput): string {
  const parsed = validateLeadInput(input.lead);
  if (parsed.success === false) {
    throw new Error(parsed.errors.join('; '));
  }

  const lead = parsed.data;
  const url = buildListingUrl(input.listing.slug);

  return [
    `Intent: ${intentLabels[lead.intent]}`,
    '',
    `Listing: ${input.listing.title}`,
    `Price: ${input.listing.price}`,
    `Agent: ${input.listing.agent}`,
    `Agency: ${input.listing.agency}`,
    `Listing URL: ${url}`,
    `Source path: ${input.sourcePath}`,
    '',
    'Buyer / tenant details',
    `Name: ${lead.name} ${lead.surname}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `POPIA consent: ${lead.popiaConsent ? 'Yes' : 'No'}`,
    '',
    'Message',
    lead.message,
  ].join('\n');
}

export function buildLeadMailto(input: LeadMailtoInput): string {
  const subject = `Lead: ${input.listing.title}`;
  const body = buildLeadSummary(input);
  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildListingUrl(slug: string): string {
  return `https://proppd.com/property/${slug}`;
}
