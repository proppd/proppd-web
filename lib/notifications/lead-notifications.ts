import { sendEmail, type EmailSendResult } from './email';
import { buildLeadAgentEmail } from './templates/lead-agent';
import { buildLeadUserEmail } from './templates/lead-user';

export type LeadQuality = 'valid' | 'suspicious' | 'duplicate' | 'spam';

export type LeadNotificationInput = {
  quality: LeadQuality;
  agentName?: string | null;
  agentEmail?: string | null;
  listingTitle?: string | null;
  listingSlug?: string | null;
  leadName: string;
  leadSurname: string;
  leadEmail: string;
  leadPhone: string;
  message: string;
  intent: string;
  appUrl?: string;
};

export type LeadNotificationSummary = {
  agent: 'sent' | 'skipped' | 'failed' | 'no-recipient';
  user: 'sent' | 'skipped' | 'failed';
};

/**
 * Only real, actionable enquiries trigger emails. Spam never notifies anyone;
 * duplicates are suppressed because the agent and user were already contacted
 * on the original enquiry within the dedupe window.
 */
export function shouldNotifyAgent(quality: LeadQuality): boolean {
  return quality === 'valid' || quality === 'suspicious';
}

export function shouldConfirmToUser(quality: LeadQuality): boolean {
  return quality === 'valid' || quality === 'suspicious';
}

export async function notifyOnNewLead(
  input: LeadNotificationInput,
  env: Record<string, string | undefined> = process.env,
): Promise<LeadNotificationSummary> {
  const summary: LeadNotificationSummary = { agent: 'skipped', user: 'skipped' };
  const appUrl = input.appUrl || env.NEXT_PUBLIC_APP_URL || 'https://proppd.com';

  if (shouldNotifyAgent(input.quality)) {
    if (!input.agentEmail) {
      summary.agent = 'no-recipient';
    } else {
      const result = await sendEmail(
        buildLeadAgentEmail({
          agentName: input.agentName,
          agentEmail: input.agentEmail,
          listingTitle: input.listingTitle,
          listingSlug: input.listingSlug,
          leadName: input.leadName,
          leadSurname: input.leadSurname,
          leadEmail: input.leadEmail,
          leadPhone: input.leadPhone,
          message: input.message,
          intent: input.intent,
          quality: input.quality,
          appUrl,
        }),
        env,
      );
      summary.agent = resultToStatus(result);
    }
  }

  if (shouldConfirmToUser(input.quality)) {
    const result = await sendEmail(
      buildLeadUserEmail({
        leadName: input.leadName,
        leadEmail: input.leadEmail,
        listingTitle: input.listingTitle,
        listingSlug: input.listingSlug,
        agentName: input.agentName,
        appUrl,
      }),
      env,
    );
    summary.user = resultToStatus(result);
  }

  return summary;
}

function resultToStatus(result: EmailSendResult): 'sent' | 'skipped' | 'failed' {
  if (result.delivered) return 'sent';
  if (result.skipped) return 'skipped';
  return 'failed';
}
