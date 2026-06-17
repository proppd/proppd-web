import { describe, expect, it } from 'vitest';
import type { LeadRecord, LeadStatus } from '@/lib/leads/pipeline';
import {
  countOverdueFollowUps,
  formatIdleDuration,
  getFollowUps,
  getFollowUpUrgency,
  hoursSince,
  isOpenLead,
} from '@/lib/leads/follow-ups';

const NOW = new Date('2026-06-16T12:00:00Z');

function lead(id: string, status: LeadStatus, latestEventAt: string): LeadRecord {
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
    latestEventAt,
    createdAt: latestEventAt,
    message: 'Hi',
    flags: [],
  };
}

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3600 * 1000).toISOString();
}

describe('isOpenLead', () => {
  it('treats active stages as open and closed outcomes as not', () => {
    expect(isOpenLead(lead('1', 'new', hoursAgo(1)))).toBe(true);
    expect(isOpenLead(lead('2', 'qualified', hoursAgo(1)))).toBe(true);
    expect(isOpenLead(lead('3', 'converted', hoursAgo(1)))).toBe(false);
    expect(isOpenLead(lead('4', 'not_interested', hoursAgo(1)))).toBe(false);
    expect(isOpenLead(lead('5', 'fake_spam', hoursAgo(1)))).toBe(false);
  });
});

describe('getFollowUpUrgency', () => {
  it('flags a new lead idle past 4h as overdue', () => {
    expect(getFollowUpUrgency(lead('1', 'new', hoursAgo(5)), NOW)).toBe('overdue');
  });

  it('marks a new lead approaching the threshold as due-soon', () => {
    expect(getFollowUpUrgency(lead('1', 'new', hoursAgo(3.2)), NOW)).toBe('due-soon');
  });

  it('keeps a fresh lead on-track', () => {
    expect(getFollowUpUrgency(lead('1', 'new', hoursAgo(1)), NOW)).toBe('on-track');
  });

  it('uses a longer threshold for later stages', () => {
    // 48h contacted threshold: 30h is still on-track, 50h overdue
    expect(getFollowUpUrgency(lead('1', 'contacted', hoursAgo(30)), NOW)).toBe('on-track');
    expect(getFollowUpUrgency(lead('1', 'contacted', hoursAgo(50)), NOW)).toBe('overdue');
  });

  it('never nags closed leads', () => {
    expect(getFollowUpUrgency(lead('1', 'converted', hoursAgo(1000)), NOW)).toBe('on-track');
  });
});

describe('getFollowUps', () => {
  const leads = [
    lead('fresh', 'new', hoursAgo(1)),
    lead('overdue-new', 'new', hoursAgo(10)),
    lead('overdue-old', 'contacted', hoursAgo(200)),
    lead('closed', 'converted', hoursAgo(500)),
  ];

  it('returns only open, non-on-track leads, most overdue first', () => {
    const result = getFollowUps(leads, NOW);
    expect(result.map((f) => f.lead.id)).toEqual(['overdue-old', 'overdue-new']);
  });

  it('counts overdue follow-ups', () => {
    expect(countOverdueFollowUps(leads, NOW)).toBe(2);
  });
});

describe('helpers', () => {
  it('computes hours since a timestamp', () => {
    expect(Math.round(hoursSince(hoursAgo(5), NOW))).toBe(5);
    expect(hoursSince('not-a-date', NOW)).toBe(0);
  });

  it('formats idle durations', () => {
    expect(formatIdleDuration(0.5)).toBe('under an hour');
    expect(formatIdleDuration(3)).toBe('3 hours');
    expect(formatIdleDuration(1)).toBe('1 hour');
    expect(formatIdleDuration(48)).toBe('2 days');
  });
});
