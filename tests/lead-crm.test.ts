import { describe, expect, it } from 'vitest';
import { LEAD_PIPELINE_STATUSES, formatLeadStatus, getLeadCrmStats, getLeadNextAction, getLeadPipelineStats, getLeadStageSuggestion, groupLeadsByStatus, isLeadStatus, type LeadRecord } from '@/lib/leads/pipeline';

function lead(id: string, status: LeadRecord['status'], quality: LeadRecord['quality'] = 'clean'): LeadRecord {
  return {
    id,
    name: `Lead ${id}`,
    email: `${id}@example.com`,
    phone: '+27 11',
    intent: 'viewing',
    status,
    quality,
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

describe('agent CRM action planning', () => {
  it('summarises active, closed, and flagged workload for dashboard CRM cards', () => {
    const stats = getLeadCrmStats([
      lead('1', 'new'),
      lead('2', 'contacted'),
      lead('3', 'viewing_booked'),
      lead('4', 'qualified', 'flagged'),
      lead('5', 'converted'),
      lead('6', 'fake_spam', 'flagged'),
    ]);

    expect(stats).toEqual({
      active: 4,
      needsFirstResponse: 1,
      viewingBooked: 1,
      qualified: 1,
      closed: 2,
      flagged: 2,
    });
  });

  it('returns operational next-best actions by status and quality', () => {
    expect(getLeadNextAction(lead('1', 'new')).label).toBe('Send first response');
    expect(getLeadNextAction(lead('2', 'contacted')).label).toBe('Book the next step');
    expect(getLeadNextAction(lead('3', 'viewing_booked')).label).toBe('Confirm viewing outcome');
    expect(getLeadNextAction(lead('4', 'qualified')).label).toBe('Prepare close handoff');
    expect(getLeadNextAction(lead('5', 'converted')).tone).toBe('positive');
    expect(getLeadNextAction(lead('6', 'fake_spam')).label).toBe('Suppress from handoff');
  });

  it('prioritises quality review before normal pipeline actions', () => {
    const action = getLeadNextAction(lead('7', 'new', 'flagged'));

    expect(action.label).toBe('Review quality before routing');
    expect(action.tone).toBe('danger');
  });

  it('suggests safe one-click stage progressions for active clean leads', () => {
    expect(getLeadStageSuggestion(lead('1', 'new'))).toMatchObject({ status: 'contacted', label: 'Mark contacted' });
    expect(getLeadStageSuggestion(lead('2', 'contacted'))).toMatchObject({ status: 'viewing_booked', label: 'Book viewing' });
    expect(getLeadStageSuggestion(lead('3', 'viewing_booked'))).toMatchObject({ status: 'qualified', label: 'Mark qualified' });
    expect(getLeadStageSuggestion(lead('4', 'qualified'))).toMatchObject({ status: 'converted', label: 'Mark converted' });
  });

  it('does not suggest one-click progression for flagged or closed leads', () => {
    expect(getLeadStageSuggestion(lead('1', 'new', 'flagged'))).toBeNull();
    expect(getLeadStageSuggestion(lead('2', 'converted'))).toBeNull();
    expect(getLeadStageSuggestion(lead('3', 'not_interested'))).toBeNull();
    expect(getLeadStageSuggestion(lead('4', 'fake_spam'))).toBeNull();
  });
});
