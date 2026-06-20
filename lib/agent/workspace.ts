import type { Listing } from '@/lib/demo-data';
import type { LeadRecord } from '@/lib/leads/pipeline';
import { getLeadQueue } from '@/lib/leads/pipeline';

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
