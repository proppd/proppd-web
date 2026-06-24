import type { LeadRecord } from './pipeline';

export type LeadTemplate = {
  id: string;
  label: string;
  /** When this reply is typically used in the pipeline. */
  hint: string;
  body: string;
};

/**
 * One-tap reply templates an agent can drop into WhatsApp or email. Buyers
 * contact several agents at once, so a fast, personal-looking first response
 * is what wins the deal — these remove the blank-page delay.
 *
 * Placeholders are filled by fillTemplate(): {firstName}, {listingTitle},
 * {agentName}, {agency}.
 */
export const LEAD_TEMPLATES: LeadTemplate[] = [
  {
    id: 'first-response',
    label: 'First response',
    hint: 'New enquiry',
    body: 'Hi {firstName}, thanks for your enquiry on {listingTitle}. I’m {agentName} from {agency} and I’d love to help. When would suit you for a viewing this week?',
  },
  {
    id: 'arrange-viewing',
    label: 'Arrange viewing',
    hint: 'Book the next step',
    body: 'Hi {firstName}, I can arrange a viewing of {listingTitle} for you. Would a weekday afternoon or this Saturday morning work better? Let me know and I’ll confirm a time.',
  },
  {
    id: 'send-details',
    label: 'Send more info',
    hint: 'Share details',
    body: 'Hi {firstName}, happy to send through the full details, photos and price breakdown for {listingTitle}. Is email or WhatsApp easiest for you? Any specific questions I can answer up front?',
  },
  {
    id: 'finance-check',
    label: 'Finance check',
    hint: 'Qualify the buyer',
    body: 'Hi {firstName}, to make sure {listingTitle} is the right fit, are you paying cash or would you need a bond? I can connect you with a bond originator for a free pre-qualification if that helps.',
  },
  {
    id: 'post-viewing',
    label: 'After viewing',
    hint: 'Follow up',
    body: 'Hi {firstName}, great to meet you at {listingTitle}. What did you think? Happy to answer any questions or show you a couple of similar options if it wasn’t quite right.',
  },
];

export function fillTemplate(
  body: string,
  values: { firstName: string; listingTitle: string; agentName: string; agency: string },
): string {
  return body
    .replaceAll('{firstName}', values.firstName || 'there')
    .replaceAll('{listingTitle}', values.listingTitle || 'the property')
    .replaceAll('{agentName}', values.agentName || 'your agent')
    .replaceAll('{agency}', values.agency || 'the agency');
}

export function fillTemplateForLead(template: LeadTemplate, lead: LeadRecord, agentName?: string): string {
  return fillTemplate(template.body, {
    firstName: lead.name.split(' ')[0] ?? '',
    listingTitle: lead.listingTitle,
    agentName: agentName ?? lead.agent,
    agency: lead.agency,
  });
}
