import { describe, expect, it } from 'vitest';
import { agencies, agents, listings } from '@/lib/demo-data';
import { filterAgencies, filterAgents, findAgencyBySlug, findAgentBySlug, formatDirectoryCount, formatDirectorySearchSummary, getAgencyAgents, getAgencyListings, getAgentListings, parseDirectoryQuery, slugifyDirectoryName } from '@/lib/directory';

describe('directory helpers', () => {
  it('creates stable profile slugs from agency and agent names', () => {
    expect(slugifyDirectoryName('Atlantic Property Co.')).toBe('atlantic-property-co');
    expect(slugifyDirectoryName('Lerato Mokoena')).toBe('lerato-mokoena');
  });

  it('finds agents and agencies by their profile slugs', () => {
    expect(findAgentBySlug(agents, 'mia-jacobs')?.name).toBe('Mia Jacobs');
    expect(findAgencyBySlug(agencies, 'coastal-living')?.name).toBe('Coastal Living');
  });

  it('connects agency profiles to their agents and listings', () => {
    const agency = findAgencyBySlug(agencies, 'atlantic-property-co');

    expect(agency).toBeDefined();
    expect(getAgencyAgents(agents, agency!.name).map((agent) => agent.name)).toEqual(['Mia Jacobs']);
    expect(getAgencyListings(listings, agency!.name).map((listing) => listing.slug)).toEqual(['sea-point-apartment-with-parking-20401']);
  });

  it('connects agent profiles to active listings', () => {
    const agent = findAgentBySlug(agents, 'aiden-naidoo');

    expect(agent).toBeDefined();
    expect(getAgentListings(listings, agent!.name).map((listing) => listing.slug)).toEqual(['family-townhouse-in-umhlanga-77120']);
  });

  it('formats singular and plural directory counts clearly', () => {
    expect(formatDirectoryCount(1, 'listing')).toBe('1 listing');
    expect(formatDirectoryCount(11, 'listing')).toBe('11 listings');
    expect(formatDirectoryCount(1, 'agent')).toBe('1 agent');
    expect(formatDirectoryCount(5, 'agent')).toBe('5 agents');
  });

  it('filters agent directory results by agent, agency, and area', () => {
    expect(filterAgents(agents, 'atlantic').map((agent) => agent.name)).toEqual(['Mia Jacobs']);
    expect(filterAgents(agents, 'Durban North').map((agent) => agent.name)).toEqual(['Aiden Naidoo']);
    expect(filterAgents(agents, 'missing')).toEqual([]);
  });

  it('filters agency directory results by agency and city', () => {
    expect(filterAgencies(agencies, 'cape town').map((agency) => agency.name)).toEqual(['Atlantic Property Co.']);
    expect(filterAgencies(agencies, 'Coastal').map((agency) => agency.name)).toEqual(['Coastal Living']);
    expect(filterAgencies(agencies, 'missing')).toEqual([]);
  });

  it('parses and formats directory search state', () => {
    expect(parseDirectoryQuery(new URLSearchParams('q= Sandton '))).toBe('Sandton');
    expect(parseDirectoryQuery(new URLSearchParams('q=   '))).toBeUndefined();
    expect(formatDirectorySearchSummary(1, 'agency', 'Cape Town')).toBe('1 agency matching “Cape Town”');
    expect(formatDirectorySearchSummary(3, 'agent')).toBe('3 agents available');
  });
});
