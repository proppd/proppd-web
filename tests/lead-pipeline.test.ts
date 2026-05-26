import { describe, expect, it } from 'vitest';
import { demoLeads } from '@/lib/leads/demo-leads';
import { buildLeadFilterHref, filterLeads, getLeadActivityLabel, getLeadPipelineStats, getLeadQueue, getLeadSourceGroup, getLeadSourceLabel, getLeadSourceStats, groupLeadsByStatus, hasLeadFilters } from '@/lib/leads/pipeline';

describe('lead pipeline helpers', () => {
  it('summarises new, contacted, qualified, and flagged leads', () => {
    const stats = getLeadPipelineStats(demoLeads);

    expect(stats.total).toBe(demoLeads.length);
    expect(stats.newLeads).toBe(2);
    expect(stats.contacted).toBe(1);
    expect(stats.qualified).toBe(1);
    expect(stats.flagged).toBe(1);
  });

  it('sorts the queue by newest lead first and keeps urgent flagged leads visible', () => {
    const queue = getLeadQueue(demoLeads);

    expect(queue[0].name).toBe('Aiden Pillay');
    expect(queue.map((lead) => lead.quality)).toContain('flagged');
  });

  it('filters the queue by status and search text for admin triage', () => {
    const filtered = filterLeads(demoLeads, { status: 'new', query: 'Sandton' });

    expect(filtered).toHaveLength(2);
    expect(filtered.every((lead) => lead.status === 'new')).toBe(true);
    expect(filtered.some((lead) => lead.name === 'Aiden Pillay')).toBe(true);
  });

  it('can narrow to flagged leads for review', () => {
    const flagged = filterLeads(demoLeads, { quality: 'flagged' });

    expect(flagged).toHaveLength(1);
    expect(flagged[0].name).toBe('SEO Partner');
  });

  it('groups leads into status buckets for admin dashboards', () => {
    const grouped = groupLeadsByStatus(demoLeads);

    expect(grouped.new).toHaveLength(2);
    expect(grouped.contacted).toHaveLength(1);
    expect(grouped.qualified).toHaveLength(1);
    expect(grouped.archived).toHaveLength(0);
  });

  it('labels agency launch requests and property enquiries from their source pages', () => {
    expect(getLeadSourceLabel('/list-with-us')).toBe('Launch application');
    expect(getLeadSourceLabel('/property/modern-3-bedroom-house-in-sandton-12345')).toBe('Property enquiry');
    expect(getLeadSourceLabel('/valuation')).toBe('Valuation request');
    expect(getLeadSourceLabel()).toBe('General enquiry');
  });

  it('groups lead sources so admins can filter launch applications from property enquiries', () => {
    const launchApplications = filterLeads(demoLeads, { source: 'launch' });

    expect(launchApplications).toHaveLength(1);
    expect(launchApplications[0].sourcePage).toBe('/list-with-us');
    expect(getLeadSourceGroup('/list-with-us')).toBe('launch');
    expect(getLeadSourceGroup('/property/modern-3-bedroom-house-in-sandton-12345')).toBe('property');
    expect(getLeadSourceGroup('/agents')).toBe('agent');
  });

  it('counts lead sources for the admin queue snapshot', () => {
    const sourceStats = getLeadSourceStats([
      ...demoLeads,
      {
        ...demoLeads[0],
        id: 'lead-extra-valuation',
        sourcePage: '/valuation',
      },
      {
        ...demoLeads[0],
        id: 'lead-extra-agent',
        sourcePage: '/agents',
      },
      {
        ...demoLeads[0],
        id: 'lead-extra-general',
        sourcePage: undefined,
      },
      {
        ...demoLeads[0],
        id: 'lead-extra-portal',
        sourcePage: '/something-else',
      },
    ]);

    expect(sourceStats.launch).toBe(1);
    expect(sourceStats.property).toBe(3);
    expect(sourceStats.valuation).toBe(1);
    expect(sourceStats.agent).toBe(1);
    expect(sourceStats.general).toBe(1);
    expect(sourceStats.portal).toBe(1);
  });

  it('treats source filters as active queue filters', () => {
    expect(hasLeadFilters({ source: 'launch' })).toBe(true);
    expect(hasLeadFilters({ source: 'all' })).toBe(false);
    expect(hasLeadFilters({ query: 'sandton' })).toBe(true);
  });

  it('builds admin filter hrefs without losing current search controls', () => {
    expect(buildLeadFilterHref({ source: 'launch' })).toBe('/admin?source=launch');
    expect(buildLeadFilterHref({ query: 'sandton', status: 'new', quality: 'flagged', source: 'property' })).toBe('/admin?q=sandton&status=new&quality=flagged&source=property');
    expect(buildLeadFilterHref({ source: 'all' })).toBe('/admin');
  });

  it('labels recent lead activity for queue rows and follow-up tracking', () => {
    expect(getLeadActivityLabel('lead_created')).toBe('Lead created');
    expect(getLeadActivityLabel('workflow_updated')).toBe('Workflow updated');
    expect(getLeadActivityLabel('status_updated')).toBe('Status updated');
    expect(getLeadActivityLabel()).toBe('No recent activity');
  });
});
