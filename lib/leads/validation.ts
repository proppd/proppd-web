import { z } from 'zod';

export const leadIntentSchema = z.enum(['viewing', 'more_info', 'valuation', 'finance']);

export const leadInputSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  surname: z.string().trim().min(2, 'Surname is required'),
  email: z.string().trim().email('Valid email is required').transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(8, 'Valid phone number is required')
    .refine((value) => normalisePhone(value).length >= 10, 'Valid phone number is required'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
  intent: leadIntentSchema,
  popiaConsent: z.boolean().refine((value) => value === true, 'POPIA consent is required'),
});

export type LeadInput = z.input<typeof leadInputSchema>;
export type ValidLeadInput = z.output<typeof leadInputSchema>;
export type LeadFlag = 'spam-keyword' | 'duplicate-enquiry' | 'suspicious-short-message';

export type ExistingLeadFingerprint = {
  email: string;
  phone: string;
  listingId: string;
  createdAt: string;
};

const SPAM_KEYWORDS = ['crypto', 'guaranteed seo', 'investment', 'forex', 'casino', 'loan offer'];
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

export function validateLeadInput(input: LeadInput):
  | { success: true; data: ValidLeadInput }
  | { success: false; errors: string[] } {
  const parsed = leadInputSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  return {
    success: false,
    errors: parsed.error.issues.map((issue) => issue.message),
  };
}

export function detectLeadFlags(
  lead: { email: string; phone: string; message: string; listingId: string },
  existingLeads: ExistingLeadFingerprint[] = [],
  now: Date = new Date(),
): LeadFlag[] {
  const flags = new Set<LeadFlag>();
  const message = lead.message.toLowerCase();

  if (SPAM_KEYWORDS.some((keyword) => message.includes(keyword))) {
    flags.add('spam-keyword');
  }

  if (lead.message.trim().length < 20) {
    flags.add('suspicious-short-message');
  }

  const email = lead.email.trim().toLowerCase();
  const phone = normalisePhone(lead.phone);
  const duplicate = existingLeads.some((existing) => {
    const createdAt = new Date(existing.createdAt).getTime();
    if (!Number.isFinite(createdAt)) return false;

    const withinWindow = now.getTime() - createdAt <= DUPLICATE_WINDOW_MS;
    const sameListing = existing.listingId === lead.listingId;
    const samePerson = existing.email.trim().toLowerCase() === email || normalisePhone(existing.phone) === phone;

    return withinWindow && sameListing && samePerson;
  });

  if (duplicate) {
    flags.add('duplicate-enquiry');
  }

  return Array.from(flags);
}

export function normalisePhone(value: string): string {
  return value.replace(/[^0-9+]/g, '').replace(/^\+/, '');
}
