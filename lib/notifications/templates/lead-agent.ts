import type { EmailMessage } from '../email';

export type LeadAgentTemplateInput = {
  agentName?: string | null;
  agentEmail: string;
  listingTitle?: string | null;
  listingSlug?: string | null;
  leadName: string;
  leadSurname: string;
  leadEmail: string;
  leadPhone: string;
  message: string;
  intent: string;
  quality: 'valid' | 'suspicious' | 'duplicate' | 'spam';
  appUrl?: string;
};

const INTENT_LABELS: Record<string, string> = {
  viewing: 'Viewing request',
  more_info: 'More information',
  valuation: 'Valuation request',
  finance: 'Finance assistance',
};

export function buildLeadAgentEmail(input: LeadAgentTemplateInput): EmailMessage {
  const appUrl = (input.appUrl || 'https://proppd.com').replace(/\/$/, '');
  const intentLabel = INTENT_LABELS[input.intent] ?? input.intent;
  const fullName = `${input.leadName} ${input.leadSurname}`.trim();
  const listingTitle = input.listingTitle || 'your listing';
  const listingUrl = input.listingSlug ? `${appUrl}/property/${input.listingSlug}` : null;
  const reviewNote = input.quality === 'suspicious'
    ? 'Heads up: Proppd flagged this enquiry for review — verify the contact details before spending time on it.'
    : null;

  const subject = `New ${intentLabel.toLowerCase()} for ${listingTitle}`;

  const text = [
    `Hi ${input.agentName || 'there'},`,
    '',
    `You have a new enquiry on Proppd${input.listingTitle ? ` for "${input.listingTitle}"` : ''}.`,
    reviewNote ? `\n${reviewNote}\n` : '',
    `Enquiry type: ${intentLabel}`,
    '',
    'Contact details',
    `Name: ${fullName}`,
    `Email: ${input.leadEmail}`,
    `Phone: ${input.leadPhone}`,
    '',
    'Message',
    input.message,
    '',
    listingUrl ? `Listing: ${listingUrl}` : '',
    `Manage your leads: ${appUrl}/dashboard/leads`,
    '',
    'Reply to this email to respond directly to the buyer or tenant.',
  ].filter(Boolean).join('\n');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1A1A2E">
    <p style="font-size:16px">Hi ${escapeHtml(input.agentName || 'there')},</p>
    <p style="font-size:16px">You have a <strong>new enquiry</strong> on Proppd${input.listingTitle ? ` for <strong>${escapeHtml(input.listingTitle)}</strong>` : ''}.</p>
    ${reviewNote ? `<p style="background:#FEF3C7;color:#92400E;padding:12px 14px;border-radius:8px;font-size:14px">${escapeHtml(reviewNote)}</p>` : ''}
    <p style="display:inline-block;background:#4A3AFF;color:#fff;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:bold">${escapeHtml(intentLabel)}</p>
    <h3 style="margin:20px 0 8px">Contact details</h3>
    <table style="font-size:15px;line-height:1.6">
      <tr><td style="color:#6B7280;padding-right:12px">Name</td><td><strong>${escapeHtml(fullName)}</strong></td></tr>
      <tr><td style="color:#6B7280;padding-right:12px">Email</td><td><a href="mailto:${escapeHtml(input.leadEmail)}">${escapeHtml(input.leadEmail)}</a></td></tr>
      <tr><td style="color:#6B7280;padding-right:12px">Phone</td><td><a href="tel:${escapeHtml(input.leadPhone)}">${escapeHtml(input.leadPhone)}</a></td></tr>
    </table>
    <h3 style="margin:20px 0 8px">Message</h3>
    <p style="font-size:15px;background:#F7F8FA;padding:14px;border-radius:8px;white-space:pre-wrap">${escapeHtml(input.message)}</p>
    <p style="margin-top:24px">
      ${listingUrl ? `<a href="${escapeHtml(listingUrl)}" style="color:#4A3AFF;font-weight:bold">View listing</a> &nbsp;·&nbsp; ` : ''}
      <a href="${escapeHtml(appUrl)}/dashboard/leads" style="color:#4A3AFF;font-weight:bold">Manage your leads</a>
    </p>
    <p style="font-size:13px;color:#9CA3AF;margin-top:20px">Reply to this email to respond directly to the buyer or tenant.</p>
  </div>`.trim();

  return { to: input.agentEmail, subject, html, text, replyTo: input.leadEmail };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
