import { detectLeadFlags, type ExistingLeadFingerprint, type LeadFlag, type LeadInput, validateLeadInput } from './validation';

export type LeadPersistenceContext = {
  listingId?: string;
  agentId?: string;
  agencyId?: string;
  sourcePage?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type PreparedLeadInsert = {
  listing_id?: string;
  agent_id?: string;
  agency_id?: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  message: string;
  intent: LeadInput['intent'];
  status: 'new';
  quality: 'valid' | 'suspicious' | 'duplicate' | 'spam';
  flags: LeadFlag[];
  source_page?: string;
  ip_address?: string;
  user_agent?: string;
  popia_consent: true;
};

export function prepareLeadInsert(input: LeadInput, context: LeadPersistenceContext = {}, existingLeads: ExistingLeadFingerprint[] = [], now: Date = new Date()):
  | { success: true; data: PreparedLeadInsert }
  | { success: false; errors: string[] } {
  const parsed = validateLeadInput(input);
  if (parsed.success === false) {
    return parsed;
  }

  const data = parsed.data;
  const listingId = context.listingId ?? '';
  const flags = listingId
    ? detectLeadFlags({ email: data.email, phone: data.phone, message: data.message, listingId }, existingLeads, now)
    : detectLeadFlags({ email: data.email, phone: data.phone, message: data.message, listingId: 'unassigned' }, [], now);

  return {
    success: true,
    data: {
      listing_id: context.listingId,
      agent_id: context.agentId,
      agency_id: context.agencyId,
      name: data.name,
      surname: data.surname,
      email: data.email,
      phone: data.phone,
      message: data.message,
      intent: data.intent,
      status: 'new',
      quality: qualityFromFlags(flags),
      flags,
      source_page: context.sourcePage,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      popia_consent: true,
    },
  };
}

export function qualityFromFlags(flags: LeadFlag[]): PreparedLeadInsert['quality'] {
  if (flags.includes('spam-keyword')) return 'spam';
  if (flags.includes('duplicate-enquiry')) return 'duplicate';
  if (flags.includes('suspicious-short-message')) return 'suspicious';
  return 'valid';
}

export function stripUndefinedFields<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as Partial<T>;
}
