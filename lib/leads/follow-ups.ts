import type { LeadRecord, LeadStatus } from './pipeline';

// Stages still in play that an agent should be actively working.
const OPEN_STATUSES: LeadStatus[] = ['new', 'contacted', 'viewing_booked', 'qualified'];

// Hours of silence before a lead is considered "needs follow-up", by stage.
// New leads should be answered fast; later stages get more breathing room.
const FOLLOW_UP_THRESHOLD_HOURS: Record<LeadStatus, number> = {
  new: 4,
  contacted: 48,
  viewing_booked: 72,
  qualified: 120,
  converted: Infinity,
  not_interested: Infinity,
  fake_spam: Infinity,
};

export type FollowUpUrgency = 'overdue' | 'due-soon' | 'on-track';

export type FollowUp = {
  lead: LeadRecord;
  hoursSinceActivity: number;
  thresholdHours: number;
  urgency: FollowUpUrgency;
};

export function lastActivityAt(lead: LeadRecord): string {
  return lead.latestEventAt ?? lead.createdAt;
}

export function hoursSince(timestamp: string, now: Date = new Date()): number {
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, (now.getTime() - then) / (1000 * 60 * 60));
}

export function isOpenLead(lead: LeadRecord): boolean {
  return OPEN_STATUSES.includes(lead.status);
}

export function getFollowUpUrgency(lead: LeadRecord, now: Date = new Date()): FollowUpUrgency {
  if (!isOpenLead(lead)) return 'on-track';
  const threshold = FOLLOW_UP_THRESHOLD_HOURS[lead.status];
  if (!Number.isFinite(threshold)) return 'on-track';

  const idle = hoursSince(lastActivityAt(lead), now);
  if (idle >= threshold) return 'overdue';
  if (idle >= threshold * 0.75) return 'due-soon';
  return 'on-track';
}

/**
 * Open leads that have gone quiet, most overdue first. Drives the dashboard
 * "needs follow-up" prompt so agents don't let warm leads go cold.
 */
export function getFollowUps(leads: LeadRecord[], now: Date = new Date()): FollowUp[] {
  return leads
    .filter(isOpenLead)
    .map((lead) => {
      const thresholdHours = FOLLOW_UP_THRESHOLD_HOURS[lead.status];
      return {
        lead,
        hoursSinceActivity: hoursSince(lastActivityAt(lead), now),
        thresholdHours,
        urgency: getFollowUpUrgency(lead, now),
      };
    })
    .filter((item) => item.urgency !== 'on-track')
    .sort((a, b) => b.hoursSinceActivity - a.hoursSinceActivity);
}

export function countOverdueFollowUps(leads: LeadRecord[], now: Date = new Date()): number {
  return getFollowUps(leads, now).filter((item) => item.urgency === 'overdue').length;
}

export function formatIdleDuration(hours: number): string {
  if (hours < 1) return 'under an hour';
  if (hours < 24) {
    const rounded = Math.round(hours);
    return `${rounded} hour${rounded === 1 ? '' : 's'}`;
  }
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}
