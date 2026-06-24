import type { Listing } from '@/lib/demo-data';
import type { LeadRecord } from '@/lib/leads/pipeline';
import { getLeadQueue } from '@/lib/leads/pipeline';
import { countOverdueFollowUps, hoursSince } from '@/lib/leads/follow-ups';

export type AgentWorkspaceStats = {
  agentName: string;
  agencyName: string;
  activeListings: number;
  newLeads: number;
  qualifiedLeads: number;
  flaggedLeads: number;
  totalLeads: number;
  latestLead?: LeadRecord;
  featuredListing?: Listing;
};

export type AgentFollowUpAction = {
  leadId: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
  detail: string;
  href: string;
};

export type AgentToolCard = {
  label: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  tone: 'priority' | 'quality' | 'listing';
};

export function getAgentWorkspaceStats(agentName: string, listings: Listing[], leads: LeadRecord[]): AgentWorkspaceStats {
  const agentListings = listings.filter((listing) => listing.agent === agentName && listing.isActive !== false);
  const agentLeads = leads.filter((lead) => lead.agent === agentName);
  const queue = getLeadQueue(agentLeads);

  return {
    agentName,
    agencyName: agentListings[0]?.agency ?? agentLeads[0]?.agency ?? 'Independent agent',
    activeListings: agentListings.length,
    newLeads: agentLeads.filter((lead) => lead.status === 'new').length,
    qualifiedLeads: agentLeads.filter((lead) => lead.status === 'qualified').length,
    flaggedLeads: agentLeads.filter((lead) => lead.quality === 'flagged').length,
    totalLeads: agentLeads.length,
    latestLead: queue[0],
    featuredListing: agentListings.find((listing) => listing.featured) ?? agentListings[0],
  };
}

export type AgentResponseStats = {
  needsResponse: number;
  overdueFollowUps: number;
  oldestWaitingHours: number | null;
  health: 'clear' | 'watch' | 'urgent';
};

/**
 * Speed-to-lead snapshot. The first agent to respond wins the deal, so this
 * surfaces how long the oldest unanswered enquiry has been waiting and how
 * many open leads have gone past their follow-up threshold.
 */
export function getAgentResponseStats(agentName: string, leads: LeadRecord[], now: Date = new Date()): AgentResponseStats {
  const agentLeads = leads.filter((lead) => lead.agent === agentName);
  const newLeads = agentLeads.filter((lead) => lead.status === 'new');
  const oldestWaitingHours = newLeads.length > 0
    ? Math.max(...newLeads.map((lead) => hoursSince(lead.createdAt, now)))
    : null;
  const overdueFollowUps = countOverdueFollowUps(agentLeads, now);

  const health: AgentResponseStats['health'] =
    overdueFollowUps > 0 || (oldestWaitingHours !== null && oldestWaitingHours >= 4)
      ? 'urgent'
      : newLeads.length > 0
        ? 'watch'
        : 'clear';

  return { needsResponse: newLeads.length, overdueFollowUps, oldestWaitingHours, health };
}

export function getAgentFollowUpActions(agentName: string, leads: LeadRecord[]): AgentFollowUpAction[] {
  return getLeadQueue(leads.filter((lead) => lead.agent === agentName))
    .filter((lead) => lead.status === 'new' || lead.quality !== 'clean')
    .map((lead) => {
      const href = `/dashboard/leads/${lead.id}`;

      if (lead.quality === 'flagged') {
        return {
          leadId: lead.id,
          label: 'Review flagged enquiry',
          priority: 'high',
          detail: `${lead.name} triggered ${lead.flags.join(', ') || 'quality'} checks before routing.`,
          href,
        };
      }

      if (lead.quality === 'duplicate') {
        return {
          leadId: lead.id,
          label: 'Check duplicate before reply',
          priority: 'medium',
          detail: `${lead.name} may already be in conversation about ${lead.listingTitle}.`,
          href,
        };
      }

      return {
        leadId: lead.id,
        label: 'Respond to new lead',
        priority: 'low',
        detail: `${lead.name} is waiting for a first response on ${lead.listingTitle}.`,
        href,
      };
    });
}

export function formatAgentResponseSignal(stats: AgentWorkspaceStats): string {
  if (stats.flaggedLeads > 0) {
    return 'Quality review needed before routing';
  }

  if (stats.newLeads > 0) {
    return 'New buyer or tenant enquiries waiting';
  }

  if (stats.qualifiedLeads > 0) {
    return 'Qualified opportunities ready for follow-up';
  }

  return 'Workspace clear';
}

export function getAgentToolCards(stats: AgentWorkspaceStats): AgentToolCard[] {
  const firstResponseCount = Math.max(stats.newLeads - stats.flaggedLeads, 0);

  return [
    {
      label: 'Reply tool',
      title: firstResponseCount > 0 ? 'Work first responses' : 'Inbox ready',
      detail: firstResponseCount > 0
        ? `${firstResponseCount} clean lead${firstResponseCount === 1 ? '' : 's'} should get a fast, personal reply.`
        : 'No clean first-response leads waiting. Keep the queue warm for the next enquiry.',
      href: '/dashboard/leads',
      cta: firstResponseCount > 0 ? 'Open reply queue' : 'View CRM queue',
      tone: 'priority',
    },
    {
      label: 'Quality gate',
      title: stats.flaggedLeads > 0 ? 'Review before routing' : 'Quality clear',
      detail: stats.flaggedLeads > 0
        ? `${stats.flaggedLeads} flagged lead${stats.flaggedLeads === 1 ? '' : 's'} need source and message checks first.`
        : 'Flagged enquiries are clear, so agents can focus on real buyer and tenant conversations.',
      href: '/dashboard/leads',
      cta: stats.flaggedLeads > 0 ? 'Review flagged leads' : 'Check queue health',
      tone: 'quality',
    },
    {
      label: 'Stock tool',
      title: stats.activeListings > 0 ? 'Keep listings fresh' : 'Add your first listing',
      detail: stats.activeListings > 0
        ? `${stats.activeListings} active listing${stats.activeListings === 1 ? '' : 's'} can generate better leads with fresh photos and price notes.`
        : 'Publish a verified listing so the CRM has live stock to route enquiries against.',
      href: stats.activeListings > 0 ? '/dashboard/listings' : '/dashboard/listings/new',
      cta: stats.activeListings > 0 ? 'Manage stock' : 'Create listing',
      tone: 'listing',
    },
  ];
}
