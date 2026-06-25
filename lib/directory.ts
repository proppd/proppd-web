import type { Listing } from './demo-data';

export type DirectoryAgent = {
  name: string;
  agency: string;
  area: string;
  listings: number;
  isActive?: boolean;
  /** Passed PPRA / Fidelity Fund validation (agents.is_verified). */
  isVerified?: boolean;
  /** Normalised Fidelity Fund Certificate number from the PPRA register. */
  ffcNumber?: string;
  /** ISO timestamp of when the FFC was last validated against the PPRA register. */
  ffcVerifiedAt?: string;
};

export type DirectoryAgency = {
  name: string;
  city: string;
  agents: number;
  listings: number;
  isActive?: boolean;
};

export function slugifyDirectoryName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findAgentBySlug<T extends DirectoryAgent>(items: T[], slug: string): T | undefined {
  return items.find((agent) => slugifyDirectoryName(agent.name) === slug);
}

export function findAgencyBySlug<T extends DirectoryAgency>(items: T[], slug: string): T | undefined {
  return items.find((agency) => slugifyDirectoryName(agency.name) === slug);
}

export function getAgentListings(items: Listing[], agentName: string): Listing[] {
  return items.filter((listing) => listing.agent === agentName && listing.isActive !== false);
}

export function getAgencyListings(items: Listing[], agencyName: string): Listing[] {
  return items.filter((listing) => listing.agency === agencyName && listing.isActive !== false);
}

export function getAgencyAgents<T extends DirectoryAgent>(items: T[], agencyName: string): T[] {
  return items.filter((agent) => agent.agency === agencyName && agent.isActive !== false);
}

export function filterAgents<T extends DirectoryAgent>(items: T[], query?: string): T[] {
  const term = normaliseDirectorySearch(query);
  if (!term) return items.filter((agent) => agent.isActive !== false);

  return items.filter((agent) => agent.isActive !== false && [agent.name, agent.agency, agent.area, String(agent.listings)].some((value) => normaliseDirectorySearch(value).includes(term)));
}

export function filterAgencies<T extends DirectoryAgency>(items: T[], query?: string): T[] {
  const term = normaliseDirectorySearch(query);
  if (!term) return items.filter((agency) => agency.isActive !== false);

  return items.filter((agency) => agency.isActive !== false && [agency.name, agency.city, String(agency.agents), String(agency.listings)].some((value) => normaliseDirectorySearch(value).includes(term)));
}

export function parseDirectoryQuery(params: URLSearchParams): string | undefined {
  const query = params.get('q')?.trim();
  return query || undefined;
}

export function formatDirectorySearchSummary(count: number, noun: 'agent' | 'agency', query?: string): string {
  const countLabel = formatDirectoryCount(count, noun, noun === 'agency' ? 'agencies' : `${noun}s`);
  return query ? `${countLabel} matching “${query}”` : `${countLabel} available`;
}

export function formatDirectoryCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function normaliseDirectorySearch(value?: string): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
