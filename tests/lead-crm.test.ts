import { describe, expect, it } from 'vitest';
import { LEAD_PIPELINE_STATUSES, formatLeadStatus, getLeadPipelineStats, groupLeadsByStatus, isLeadStatus, type LeadRecord } from '@/lib/leads/pipeline';

function lead(id: string, status: LeadRecord['status']): LeadRecord {
  return {
    id,
    name: `Lead ${id}`,
    email: `${id}@example.com`,
    phone: '+27 11',
    intent: 'viewing',
    status,
    quality: 'clean',
    listingTitle: 'Home',
    listingSlug: 'home',
    agent: 'Agent',
    agency: 'Agency',
    createdAt: '2026-06-13T00:00:00Z',
    message: 'Hi',
    flags: [],
  };
}

describe('lead pipeline statuses', () => {
  it('exposes the full CRM lifecycle in order', () => {
    expect(LEAD_PIPELINE_STATUSES).toEqual(['new', 'contacted', 'viewing_booked', 'qualified', 'converted', 'not_interested', 'fake_spam']);
  });

  it('matches the database lead_status enum (no legacy "archived")', () => {
    expect(isLeadStatus('viewing_booked')).toBe(true);
    expect(isLeadStatus('converted')).toBe(true);
    expect(isLeadStatus('fake_spam')).toBe(true);
    expect(isLeadStatus('archived')).toBe(false);
    expect(isLeadStatus('')).toBe(false);
    expect(isLeadStatus(undefined)).toBe(false);
  });

  it('formats human-friendly labels', () => {
    expect(formatLeadStatus('viewing_booked')).toBe('Viewing booked');
    expect(formatLeadStatus('not_interested')).toBe('Not interested');
    expect(formatLeadStatus('fake_spam')).toBe('Fake / spam');
    expect(formatLeadStatus('converted')).toBe('Converted');
  });
});

describe('pipeline aggregation across the full lifecycle', () => {
  const leads = [
    lead('1', 'new'),
    lead('2', 'contacted'),
    lead('3', 'viewing_booked'),
    lead('4', 'qualified'),
    lead('5', 'converted'),
    lead('6', 'not_interested'),
    lead('7', 'fake_spam'),
  ];

  it('counts each active stage', () => {
    const stats = getLeadPipelineStats(leads);
    expect(stats.total).toBe(7);
    expect(stats.newLeads).toBe(1);
    expect(stats.contacted).toBe(1);
    expect(stats.viewingBooked).toBe(1);
    expect(stats.qualified).toBe(1);
    expect(stats.converted).toBe(1);
  });

  it('groups every status bucket', () => {
    const grouped = groupLeadsByStatus(leads);
    expect(grouped.viewing_booked).toHaveLength(1);
    expect(grouped.converted).toHaveLength(1);
    expect(grouped.not_interested).toHaveLength(1);
    expect(grouped.fake_spam).toHaveLength(1);
  });
});
