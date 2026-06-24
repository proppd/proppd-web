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
  viewingAt?: string;
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

export type LeadCrmStats = {
  active: number;
  needsFirstResponse: number;
  viewingBooked: number;
  qualified: number;
  closed: number;
  flagged: number;
};

export type LeadNextAction = {
  label: string;
  detail: string;
  tone: 'urgent' | 'active' | 'positive' | 'muted' | 'danger';
};

export type LeadStageSuggestion = {
  status: LeadStatus;
  label: string;
  note: string;
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

export function getLeadCrmStats(leads: LeadRecord[]): LeadCrmStats {
  return {
    active: leads.filter((lead) => ['new', 'contacted', 'viewing_booked', 'qualified'].includes(lead.status)).length,
    needsFirstResponse: leads.filter((lead) => lead.status === 'new').length,
    viewingBooked: leads.filter((lead) => lead.status === 'viewing_booked').length,
    qualified: leads.filter((lead) => lead.status === 'qualified').length,
    closed: leads.filter((lead) => lead.status === 'converted' || lead.status === 'not_interested' || lead.status === 'fake_spam').length,
    flagged: leads.filter((lead) => lead.quality === 'flagged').length,
  };
}

export function getLeadNextAction(lead: LeadRecord): LeadNextAction {
  if (lead.quality === 'flagged') {
    return {
      label: 'Review quality before routing',
      detail: 'Check flags and source context before an agent spends time on this lead.',
      tone: 'danger',
    };
  }

  const actions: Record<LeadStatus, LeadNextAction> = {
    new: {
      label: 'Send first response',
      detail: 'Reply from the agency inbox and move the lead to contacted after handoff.',
      tone: 'urgent',
    },
    contacted: {
      label: 'Book the next step',
      detail: 'Confirm viewing intent, finance readiness, or whether the enquiry needs more qualification.',
      tone: 'active',
    },
    viewing_booked: {
      label: 'Confirm viewing outcome',
      detail: 'After the appointment, mark the lead qualified, converted, or not interested.',
      tone: 'active',
    },
    qualified: {
      label: 'Prepare close handoff',
      detail: 'Send shortlist, finance/valuation context, and next appointment details.',
      tone: 'positive',
    },
    converted: {
      label: 'Keep as won lead',
      detail: 'Preserve the timeline for reporting and future agency performance reviews.',
      tone: 'positive',
    },
    not_interested: {
      label: 'No active follow-up',
      detail: 'Keep visible for audit, but do not route into the active agent queue.',
      tone: 'muted',
    },
    fake_spam: {
      label: 'Suppress from handoff',
      detail: 'Keep the record for quality review and spam-pattern tuning.',
      tone: 'danger',
    },
  };

  return actions[lead.status];
}

export function getLeadStageSuggestion(lead: LeadRecord): LeadStageSuggestion | null {
  if (lead.quality === 'flagged') return null;

  const suggestions: Partial<Record<LeadStatus, LeadStageSuggestion>> = {
    new: {
      status: 'contacted',
      label: 'Mark contacted',
      note: 'First response sent to the lead.',
    },
    contacted: {
      status: 'viewing_booked',
      label: 'Book viewing',
      note: 'Viewing or next appointment booked with the lead.',
    },
    viewing_booked: {
      status: 'qualified',
      label: 'Mark qualified',
      note: 'Viewing outcome confirmed and the lead is qualified for follow-up.',
    },
    qualified: {
      status: 'converted',
      label: 'Mark converted',
      note: 'Lead converted after agent follow-up.',
    },
  };

  return suggestions[lead.status] ?? null;
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

export function buildLeadFilterHref(filters: LeadFilters = {}, basePath = '/admin'): string {
  const params = new URLSearchParams();

  const query = filters.query?.trim();
  if (query) params.set('q', query);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.quality && filters.quality !== 'all') params.set('quality', filters.quality);
  if (filters.source && filters.source !== 'all') params.set('source', filters.source);

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
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

export function buildWhatsAppHref(phone: string, leadName?: string): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return null;
  // Normalise SA numbers: 0XX → 2727XX; international +XX already stripped of +
  const normalised = digits.startsWith('27') ? digits : digits.startsWith('0') ? `27${digits.slice(1)}` : digits;
  const greeting = leadName ? `Hi ${leadName.split(' ')[0]}, ` : '';
  return `https://wa.me/${normalised}?text=${encodeURIComponent(greeting)}`;
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
