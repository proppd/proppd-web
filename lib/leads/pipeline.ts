export type LeadStatus = 'new' | 'contacted' | 'viewing_booked' | 'qualified' | 'converted' | 'not_interested' | 'fake_spam';
export type LeadQuality = 'clean' | 'duplicate' | 'flagged';
export type LeadIntent = 'viewing' | 'more_info' | 'valuation' | 'finance';
export type LeadSourceGroup = 'all' | 'launch' | 'property' | 'valuation' | 'agent' | 'portal' | 'general';

// Ordered agent CRM pipeline (active stages first, then closed outcomes).
export const LEAD_PIPELINE_STATUSES: LeadStatus[] = ['new', 'contacted', 'viewing_booked', 'qualified', 'converted', 'not_interested', 'fake_spam'];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_PIPELINE_STATUSES as string[]).includes(value);
}

export function formatLeadStatus(status: LeadStatus): string {
  const labels: Record<LeadStatus, string> = {
    new: 'New',
    contacted: 'Contacted',
    viewing_booked: 'Viewing booked',
    qualified: 'Qualified',
    converted: 'Converted',
    not_interested: 'Not interested',
    fake_spam: 'Fake / spam',
  };
  return labels[status];
}

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
  sourcePage?: string;
  latestEventType?: string;
  latestEventAt?: string;
  latestEventNote?: string;
  latestEventCount?: number;
  createdAt: string;
  message: string;
  flags: string[];
};

export type LeadPipelineStats = {
  total: number;
  newLeads: number;
  contacted: number;
  viewingBooked: number;
  qualified: number;
  converted: number;
  flagged: number;
};

export type LeadSourceStats = {
  launch: number;
  property: number;
  valuation: number;
  agent: number;
  portal: number;
  general: number;
};

export type LeadFilters = {
  query?: string;
  status?: LeadStatus | 'all';
  quality?: LeadQuality | 'all';
  source?: LeadSourceGroup | 'all';
};

export function getLeadPipelineStats(leads: LeadRecord[]): LeadPipelineStats {
  return {
    total: leads.length,
    newLeads: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    viewingBooked: leads.filter((lead) => lead.status === 'viewing_booked').length,
    qualified: leads.filter((lead) => lead.status === 'qualified').length,
    converted: leads.filter((lead) => lead.status === 'converted').length,
    flagged: leads.filter((lead) => lead.quality === 'flagged').length,
  };
}

export function getLeadSourceStats(leads: LeadRecord[]): LeadSourceStats {
  return leads.reduce<LeadSourceStats>(
    (stats, lead) => {
      const source = getLeadSourceGroup(lead.sourcePage);
      stats[source] += 1;
      return stats;
    },
    { launch: 0, property: 0, valuation: 0, agent: 0, portal: 0, general: 0 },
  );
}

export function getLeadQueue(leads: LeadRecord[]): LeadRecord[] {
  return [...leads].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function buildLeadFilterHref(filters: LeadFilters = {}): string {
  const params = new URLSearchParams();

  const query = filters.query?.trim();
  if (query) params.set('q', query);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.quality && filters.quality !== 'all') params.set('quality', filters.quality);
  if (filters.source && filters.source !== 'all') params.set('source', filters.source);

  const search = params.toString();
  return search ? `/admin?${search}` : '/admin';
}

export function hasLeadFilters(filters: LeadFilters = {}): boolean {
  return Boolean(filters.query?.trim() || (filters.status && filters.status !== 'all') || (filters.quality && filters.quality !== 'all') || (filters.source && filters.source !== 'all'));
}

export function filterLeads(leads: LeadRecord[], filters: LeadFilters = {}): LeadRecord[] {
  const query = filters.query?.trim().toLowerCase();

  return leads.filter((lead) => {
    const statusMatches = !filters.status || filters.status === 'all' || lead.status === filters.status;
    const qualityMatches = !filters.quality || filters.quality === 'all' || lead.quality === filters.quality;
    const sourceMatches = !filters.source || filters.source === 'all' || getLeadSourceGroup(lead.sourcePage) === filters.source;
    const queryMatches = !query
      ? true
      : [lead.name, lead.email, lead.phone, lead.listingTitle, lead.agent, lead.agency, lead.message, lead.id, formatLeadIntent(lead.intent), lead.sourcePage ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query);

    return statusMatches && qualityMatches && sourceMatches && queryMatches;
  });
}

export function groupLeadsByStatus(leads: LeadRecord[]): Record<LeadStatus, LeadRecord[]> {
  return {
    new: leads.filter((lead) => lead.status === 'new'),
    contacted: leads.filter((lead) => lead.status === 'contacted'),
    viewing_booked: leads.filter((lead) => lead.status === 'viewing_booked'),
    qualified: leads.filter((lead) => lead.status === 'qualified'),
    converted: leads.filter((lead) => lead.status === 'converted'),
    not_interested: leads.filter((lead) => lead.status === 'not_interested'),
    fake_spam: leads.filter((lead) => lead.status === 'fake_spam'),
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

export function getLeadSourceLabel(sourcePage?: string): string {
  const page = sourcePage?.trim();
  if (!page) return 'General enquiry';

  if (page === '/list-with-us' || page.startsWith('/list-with-us#')) {
    return 'Launch application';
  }

  if (page.startsWith('/property/')) {
    return 'Property enquiry';
  }

  if (page.startsWith('/valuation')) {
    return 'Valuation request';
  }

  if (page.startsWith('/agents')) {
    return 'Agent directory';
  }

  return 'Portal enquiry';
}

export function getLeadActivityLabel(eventType?: string): string {
  const type = eventType?.trim();
  if (!type) return 'No recent activity';

  const labels: Record<string, string> = {
    lead_created: 'Lead created',
    workflow_updated: 'Workflow updated',
    status_updated: 'Status updated',
    quality_updated: 'Quality updated',
    note_added: 'Note added',
  };

  return labels[type] ?? 'Activity recorded';
}

export function getLeadSourceGroup(sourcePage?: string): Exclude<LeadSourceGroup, 'all'> {
  const page = sourcePage?.trim();
  if (!page) return 'general';

  if (page === '/list-with-us' || page.startsWith('/list-with-us#')) {
    return 'launch';
  }

  if (page.startsWith('/property/')) {
    return 'property';
  }

  if (page.startsWith('/valuation')) {
    return 'valuation';
  }

  if (page.startsWith('/agents')) {
    return 'agent';
  }

  return 'portal';
}
