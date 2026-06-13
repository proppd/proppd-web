export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type EmailSendResult =
  | { delivered: true; provider: 'resend'; id?: string }
  | { delivered: false; skipped: true; reason: string }
  | { delivered: false; skipped: false; error: string };

type EmailEnv = Record<string, string | undefined>;

const DEFAULT_FROM = 'Proppd <noreply@proppd.com>';

export function getEmailFrom(env: EmailEnv = process.env): string {
  return env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

export function isEmailConfigured(env: EmailEnv = process.env): boolean {
  return Boolean(env.RESEND_API_KEY?.trim());
}

/**
 * Provider-neutral email send. Uses Resend when RESEND_API_KEY is set,
 * otherwise logs the message and reports it as skipped so callers can degrade
 * gracefully (the prepared mailto enquiry remains the fallback handoff).
 */
export async function sendEmail(message: EmailMessage, env: EmailEnv = process.env): Promise<EmailSendResult> {
  const apiKey = env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.info('[email] skipped (no provider configured):', message.subject, '→', message.to);
    return { delivered: false, skipped: true, reason: 'No email provider configured.' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailFrom(env),
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { delivered: false, skipped: false, error: `Resend responded ${response.status}: ${detail.slice(0, 200)}` };
    }

    const payload = (await response.json().catch(() => ({}))) as { id?: string };
    return { delivered: true, provider: 'resend', id: payload.id };
  } catch (error) {
    return { delivered: false, skipped: false, error: error instanceof Error ? error.message : 'Unknown email error' };
  }
}
