import { sendEmail, type EmailMessage } from '@/lib/notifications/email';
import type { PPRAVerificationResult } from '@/lib/ppra/verification';

const REVIEW_TO = 'info@proppd.com';

export type ManualReviewInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  agency?: string;
  area?: string;
  ffcNumber: string;
  verification: PPRAVerificationResult;
};

/**
 * Build the email body for a manual onboarding review request.
 */
export function buildManualReviewEmail(input: ManualReviewInput): EmailMessage {
  const { verification } = input;
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  const subject = `Manual agent review: ${fullName} (FFC ${input.ffcNumber})`;

  const lines = [
    'A new agent access request could not be auto-verified against the PPRA register.',
    '',
    'Agent details',
    `Name: ${fullName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || 'Not supplied'}`,
    `Agency: ${input.agency || 'Not supplied'}`,
    `Service area: ${input.area || 'Not supplied'}`,
    `FFC number: ${input.ffcNumber}`,
    '',
    'PPRA verification result',
    `Status: ${verification.status}`,
    `Reason: ${verification.reason || 'N/A'}`,
    '',
    'Action required',
    '1. Review and approve or reject from the Proppd admin console: /admin/agents',
    '2. Alternatively, verify the FFC manually at https://theppra.org.za/practitioner-search/',
  ];

  const html = lines.map((l) => `<p style="margin:0 0 4px;">${escapeHtml(l)}</p>`).join('');

  return {
    to: REVIEW_TO,
    subject,
    text: lines.join('\n'),
    html,
    replyTo: input.email,
  };
}

/**
 * Send a manual review email to info@proppd.com.
 * Returns the send result (may be skipped if no email provider configured).
 */
export async function sendManualReviewEmail(input: ManualReviewInput): Promise<void> {
  const message = buildManualReviewEmail(input);
  await sendEmail(message);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
