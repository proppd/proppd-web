import { describe, expect, it } from 'vitest';
import { demoLeads } from '@/lib/leads/demo-leads';
import { getLeadPipelineStats, getLeadQueue, groupLeadsByStatus } from '@/lib/leads/pipeline';

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

  it('groups leads into status buckets for admin dashboards', () => {
    const grouped = groupLeadsByStatus(demoLeads);

    expect(grouped.new).toHaveLength(2);
    expect(grouped.contacted).toHaveLength(1);
    expect(grouped.qualified).toHaveLength(1);
    expect(grouped.archived).toHaveLength(0);
  });
});
