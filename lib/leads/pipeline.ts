export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'archived';
export type LeadQuality = 'clean' | 'duplicate' | 'flagged';
export type LeadIntent = 'viewing' | 'more_info' | 'valuation' | 'finance';

export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  intent: LeadIntent;
  status: LeadStatus;
  quality: LeadQuality;
  listingTitle: string;
  listingSlug: string;
  agent: string;
  agency: string;
  createdAt: string;
  message: string;
  flags: string[];
};

export type LeadPipelineStats = {
  total: number;
  newLeads: number;
  contacted: number;
  qualified: number;
  flagged: number;
};

export type LeadFilters = {
  query?: string;
  status?: LeadStatus | 'all';
  quality?: LeadQuality | 'all';
};

export function getLeadPipelineStats(leads: LeadRecord[]): LeadPipelineStats {
  return {
    total: leads.length,
    newLeads: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    qualified: leads.filter((lead) => lead.status === 'qualified').length,
    flagged: leads.filter((lead) => lead.quality === 'flagged').length,
  };
}

export function getLeadQueue(leads: LeadRecord[]): LeadRecord[] {
  return [...leads].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function filterLeads(leads: LeadRecord[], filters: LeadFilters = {}): LeadRecord[] {
  const query = filters.query?.trim().toLowerCase();

  return leads.filter((lead) => {
    const statusMatches = !filters.status || filters.status === 'all' || lead.status === filters.status;
    const qualityMatches = !filters.quality || filters.quality === 'all' || lead.quality === filters.quality;
    const queryMatches = !query
      ? true
      : [lead.name, lead.email, lead.phone, lead.listingTitle, lead.agent, lead.agency, lead.message, lead.id, formatLeadIntent(lead.intent)]
          .join(' ')
          .toLowerCase()
          .includes(query);

    return statusMatches && qualityMatches && queryMatches;
  });
}

export function groupLeadsByStatus(leads: LeadRecord[]): Record<LeadStatus, LeadRecord[]> {
  return {
    new: leads.filter((lead) => lead.status === 'new'),
    contacted: leads.filter((lead) => lead.status === 'contacted'),
    qualified: leads.filter((lead) => lead.status === 'qualified'),
    archived: leads.filter((lead) => lead.status === 'archived'),
  };
}

export function formatLeadIntent(intent: LeadIntent): string {
  const labels: Record<LeadIntent, string> = {
    viewing: 'Viewing',
    more_info: 'More info',
    valuation: 'Valuation',
    finance: 'Finance',
  };
  return labels[intent];
}
