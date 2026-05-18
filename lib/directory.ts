import type { Listing } from '@/lib/demo-data';

export type DirectoryAgent = {
  name: string;
  agency: string;
  area: string;
  listings: number;
};

export type DirectoryAgency = {
  name: string;
  city: string;
  agents: number;
  listings: number;
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
  return items.filter((listing) => listing.agent === agentName);
}

export function getAgencyListings(items: Listing[], agencyName: string): Listing[] {
  return items.filter((listing) => listing.agency === agencyName);
}

export function getAgencyAgents<T extends DirectoryAgent>(items: T[], agencyName: string): T[] {
  return items.filter((agent) => agent.agency === agencyName);
}

export function formatDirectoryCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
