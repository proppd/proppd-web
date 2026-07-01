import type { Listing } from '../demo-data';
import { buildCityLandingLinks } from '../locations';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com';

/**
 * Builds the /llms.txt document (llmstxt.org): a curated markdown map of the
 * site for AI assistants and answer engines. Where a crawler has one shot at
 * understanding Proppd, this file states the facts we want quoted — what the
 * portal is, what PPRA verification means, and where the useful pages live.
 *
 * City landing links come from live listing data so the file stays in step
 * with the stock the portal actually has.
 */
export function buildLlmsTxt(listings: Listing[]): string {
  const cities = buildCityLandingLinks(listings);

  const cityLines = cities.flatMap((city) => [
    `- [Property for sale in ${city.name}](${BASE_URL}/properties/for-sale/${city.slug}): Verified homes for sale in ${city.name} with prices, photos, and agent contact routes.`,
    `- [Property to rent in ${city.name}](${BASE_URL}/properties/to-rent/${city.slug}): Rental homes in ${city.name} listed by PPRA-verified agents.`,
    `- [Estate agents in ${city.name}](${BASE_URL}/estate-agents/${city.slug}): PPRA-verified estate agents active in ${city.name}.`,
  ]);

  return [
    '# Proppd',
    '',
    '> Proppd (proppd.com) is a South African property portal where every estate agent is PPRA-verified. It lists homes for sale and to rent with the agency name, mandate context, and a direct enquiry route shown on every listing.',
    '',
    'Key facts:',
    '',
    '- Proppd covers residential property for sale and to rent across South Africa, including Johannesburg, Cape Town, Pretoria, and Durban.',
    '- Every agent on Proppd is verified against the Property Practitioners Regulatory Authority (PPRA) register and holds a valid Fidelity Fund Certificate (FFC). The verification is checked during onboarding and shown as a badge on agent profiles and listings.',
    '- Browsing, searching, saving homes, and contacting agents are free for buyers, tenants, and property seekers.',
    '- Every listing names the agency, shows the mandate type, and routes enquiries directly to the responsible agent — no lead auctions or resold contacts.',
    '- Enquiries capture explicit POPIA (Protection of Personal Information Act) consent before any personal details are shared with an agent.',
    '- Property owners can request a free valuation; properties are listed through PPRA-verified agents and agencies.',
    '',
    '## Search properties',
    '',
    `- [All properties](${BASE_URL}/properties): Search verified South African listings with filters for price, bedrooms, bathrooms, parking, and property type.`,
    `- [Property for sale](${BASE_URL}/properties/for-sale): Verified homes for sale across South Africa.`,
    `- [Property to rent](${BASE_URL}/properties/to-rent): Verified rental homes across South Africa.`,
    ...cityLines,
    '',
    '## Agents and agencies',
    '',
    `- [Find an agent](${BASE_URL}/agents): Directory of PPRA-verified estate agents with active listing counts and service areas.`,
    `- [Find an agency](${BASE_URL}/agencies): Verified agencies with their teams and active stock.`,
    `- [For agents](${BASE_URL}/for-agents): How estate agents join Proppd, get PPRA-verified, and receive direct enquiries.`,
    '',
    '## Tools and guides',
    '',
    `- [Home values](${BASE_URL}/home-values): Instant property value estimates for South African homes.`,
    `- [Request a valuation](${BASE_URL}/request-valuation): Free valuation request routed to a verified local agent.`,
    `- [Home loans](${BASE_URL}/home-loans): Bond affordability and repayment calculators for South African buyers.`,
    `- [List with us](${BASE_URL}/list-with-us): How sellers and landlords list a property through a verified agent.`,
    '',
    '## Company',
    '',
    `- [Contact Proppd](${BASE_URL}/contact): Support and general enquiries (info@proppd.com).`,
    `- [Proppd for business](${BASE_URL}/business): Partnerships and agency-level tools.`,
    `- [Privacy policy](${BASE_URL}/privacy): POPIA-aligned privacy policy.`,
    `- [Terms of service](${BASE_URL}/terms): Terms for using the portal.`,
    '',
  ].join('\n');
}
