import { describe, expect, it } from 'vitest';
import { listings } from '@/lib/demo-data';
import { demoLeads } from '@/lib/leads/demo-leads';
import { formatAgentResponseSignal, getAgentFollowUpActions, getAgentWorkspaceStats } from '@/lib/agent/workspace';

describe('agent workspace helpers', () => {
  it('summarises one agent workspace from listings and leads', () => {
    const stats = getAgentWorkspaceStats('Lerato Mokoena', listings, demoLeads);

    expect(stats.agencyName).toBe('Proppd Verified Realty');
    expect(stats.activeListings).toBe(1);
    expect(stats.totalLeads).toBe(2);
    expect(stats.newLeads).toBe(2);
    expect(stats.flaggedLeads).toBe(1);
    expect(stats.latestLead?.name).toBe('Aiden Pillay');
    expect(stats.featuredListing?.slug).toBe('modern-3-bedroom-house-in-sandton-12345');
  });

  it('ignores inactive listings when summarising workspace stock', () => {
    const stats = getAgentWorkspaceStats('Lerato Mokoena', [
      ...listings,
      {
        ...listings[0],
        slug: 'inactive-copy',
        isActive: false,
      },
    ], demoLeads);

    expect(stats.activeListings).toBe(1);
    expect(stats.featuredListing?.slug).toBe('modern-3-bedroom-house-in-sandton-12345');
  });

  it('turns lead quality into agent follow-up actions', () => {
    const actions = getAgentFollowUpActions('Lerato Mokoena', demoLeads);

    expect(actions).toHaveLength(2);
    expect(actions[0]).toMatchObject({ label: 'Respond to new lead', priority: 'low' });
    expect(actions[1]).toMatchObject({ label: 'Review flagged enquiry', priority: 'high' });
    expect(actions.every((action) => action.href.startsWith('/property/'))).toBe(true);
  });

  it('surfaces the right plain-English response signal', () => {
    const stats = getAgentWorkspaceStats('Lerato Mokoena', listings, demoLeads);

    expect(formatAgentResponseSignal(stats)).toBe('Quality review needed before routing');
  });
});
