import type { EmailMessage } from '../email';

export type LeadUserTemplateInput = {
  leadName: string;
  leadEmail: string;
  listingTitle?: string | null;
  listingSlug?: string | null;
  agentName?: string | null;
  appUrl?: string;
};

export function buildLeadUserEmail(input: LeadUserTemplateInput): EmailMessage {
  const appUrl = (input.appUrl || 'https://proppd.com').replace(/\/$/, '');
  const listingTitle = input.listingTitle || 'the property you enquired about';
  const listingUrl = input.listingSlug ? `${appUrl}/property/${input.listingSlug}` : null;
  const agentLine = input.agentName ? `${input.agentName} ` : 'The agent ';

  const subject = `We've sent your Proppd enquiry${input.listingTitle ? ` about ${input.listingTitle}` : ''}`;

  const text = [
    `Hi ${input.leadName},`,
    '',
    `Thanks for your enquiry on Proppd. We've passed your details to the listing agent for ${listingTitle}.`,
    `${agentLine}will be in touch with you directly. Most agents respond within a few hours during business times.`,
    '',
    listingUrl ? `Listing: ${listingUrl}` : '',
    `Browse more verified listings: ${appUrl}/properties`,
    '',
    'If you did not make this enquiry, you can ignore this email.',
    '',
    '— The Proppd team',
  ].filter(Boolean).join('\n');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1A1A2E">
    <p style="font-size:16px">Hi ${escapeHtml(input.leadName)},</p>
    <p style="font-size:16px">Thanks for your enquiry on Proppd. We've passed your details to the listing agent for <strong>${escapeHtml(listingTitle)}</strong>.</p>
    <p style="font-size:15px;color:#6B7280">${escapeHtml(agentLine)}will be in touch with you directly. Most agents respond within a few hours during business times.</p>
    <p style="margin-top:20px">
      ${listingUrl ? `<a href="${escapeHtml(listingUrl)}" style="color:#4A3AFF;font-weight:bold">View the listing</a> &nbsp;·&nbsp; ` : ''}
      <a href="${escapeHtml(appUrl)}/properties" style="color:#4A3AFF;font-weight:bold">Browse more listings</a>
    </p>
    <p style="font-size:13px;color:#9CA3AF;margin-top:24px">If you did not make this enquiry, you can safely ignore this email.</p>
    <p style="font-size:13px;color:#9CA3AF">— The Proppd team</p>
  </div>`.trim();

  return { to: input.leadEmail, subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
