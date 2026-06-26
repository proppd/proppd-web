import { describe, expect, it } from 'vitest';
import { agencies, agents, listings } from '@/lib/demo-data';
import { filterAgencies, filterAgents, findAgencyBySlug, findAgentBySlug, formatDirectoryCount, formatDirectorySearchSummary, getAgencyAgents, getAgencyListings, getAgentListings, parseDirectoryQuery, slugifyDirectoryName } from '@/lib/directory';

describe('directory helpers', () => {
  it('creates stable profile slugs from agency and agent names', () => {
    expect(slugifyDirectoryName('Sakstons (Pty) Ltd')).toBe('sakstons-pty-ltd');
    expect(slugifyDirectoryName('Marc Chait')).toBe('marc-chait');
  });

  it('finds agents and agencies by their profile slugs', () => {
    expect(findAgentBySlug(agents, 'lize-marx')?.name).toBe('Lize Marx');
    expect(findAgencyBySlug(agencies, 'sakstons')?.name).toBe('Sakstons');
  });

  it('connects agency profiles to their agents and listings', () => {
    const agency = findAgencyBySlug(agencies, 'sakstons');

    expect(agency).toBeDefined();
    expect(getAgencyAgents(agents, agency!.name).map((agent) => agent.name)).toEqual(['Graham Donald', 'Hamez Saks', 'Lize Marx', 'Marc Chait']);
    expect(getAgencyListings(listings, agency!.name).length).toBe(38);
  });

  it('includes Sakstons as the live agency in active directory results', () => {
    const agency = findAgencyBySlug(agencies, 'sakstons');
    const team = getAgencyAgents(agents, 'Sakstons');
    const stock = getAgencyListings(listings, 'Sakstons');

    expect(agency).toMatchObject({ name: 'Sakstons', city: 'Sandton', agents: 4, listings: 38, isActive: true });
    expect(team.map((agent) => agent.name)).toEqual(['Graham Donald', 'Hamez Saks', 'Lize Marx', 'Marc Chait']);
    expect(stock.length).toBeGreaterThan(0);
  });

  it('connects agent profiles to active listings', () => {
    const agent = findAgentBySlug(agents, 'graham-donald');

    expect(agent).toBeDefined();
    expect(getAgentListings(listings, agent!.name).length).toBe(6);
    expect(getAgentListings(listings, agent!.name).every((listing) => listing.agency === 'Sakstons')).toBe(true);
  });

  it('formats singular and plural directory counts clearly', () => {
    expect(formatDirectoryCount(1, 'listing')).toBe('1 listing');
    expect(formatDirectoryCount(11, 'listing')).toBe('11 listings');
    expect(formatDirectoryCount(1, 'agent')).toBe('1 agent');
    expect(formatDirectoryCount(5, 'agent')).toBe('5 agents');
  });

  it('filters agent directory results by agent, agency, and area', () => {
    expect(filterAgents(agents, 'liz').map((agent) => agent.name)).toEqual(['Lize Marx']);
    expect(filterAgents(agents, 'sakstons').map((agent) => agent.name)).toEqual(['Graham Donald', 'Hamez Saks', 'Lize Marx', 'Marc Chait']);
    expect(filterAgents(agents, 'missing')).toEqual([]);
  });

  it('filters agency directory results by agency and city', () => {
    expect(filterAgencies(agencies, 'sandton').map((agency) => agency.name)).toEqual(['Sakstons']);
    expect(filterAgencies(agencies, 'sakstons').map((agency) => agency.name)).toEqual(['Sakstons']);
    expect(filterAgencies(agencies, 'missing')).toEqual([]);
  });

  it('parses and formats directory search state', () => {
    expect(parseDirectoryQuery(new URLSearchParams('q= Sandton '))).toBe('Sandton');
    expect(parseDirectoryQuery(new URLSearchParams('q=   '))).toBeUndefined();
    expect(formatDirectorySearchSummary(1, 'agency', 'Cape Town')).toBe('1 agency matching “Cape Town”');
    expect(formatDirectorySearchSummary(3, 'agent')).toBe('3 agents available');
  });
});
