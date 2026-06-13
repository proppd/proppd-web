import { describe, expect, it } from 'vitest';
import { notifyOnNewLead, shouldConfirmToUser, shouldNotifyAgent } from '@/lib/notifications/lead-notifications';
import { buildLeadAgentEmail } from '@/lib/notifications/templates/lead-agent';
import { buildLeadUserEmail } from '@/lib/notifications/templates/lead-user';
import { getEmailFrom, isEmailConfigured } from '@/lib/notifications/email';

describe('notification decision rules', () => {
  it('notifies agent and user only for valid and suspicious leads', () => {
    expect(shouldNotifyAgent('valid')).toBe(true);
    expect(shouldNotifyAgent('suspicious')).toBe(true);
    expect(shouldNotifyAgent('duplicate')).toBe(false);
    expect(shouldNotifyAgent('spam')).toBe(false);

    expect(shouldConfirmToUser('valid')).toBe(true);
    expect(shouldConfirmToUser('spam')).toBe(false);
    expect(shouldConfirmToUser('duplicate')).toBe(false);
  });
});

describe('buildLeadAgentEmail', () => {
  const base = {
    agentName: 'Lerato Mokoena',
    agentEmail: 'lerato@seeff.co.za',
    listingTitle: 'Modern 3-bed in Sandton',
    listingSlug: 'modern-3-bed-in-sandton-123',
    leadName: 'Sipho',
    leadSurname: 'Dlamini',
    leadEmail: 'sipho@example.com',
    leadPhone: '+27 82 000 0000',
    message: 'Is this still available for viewing this weekend?',
    intent: 'viewing',
    quality: 'valid' as const,
    appUrl: 'https://proppd.com',
  };

  it('addresses the agent, sets reply-to the lead, and includes contact details', () => {
    const email = buildLeadAgentEmail(base);
    expect(email.to).toBe('lerato@seeff.co.za');
    expect(email.replyTo).toBe('sipho@example.com');
    expect(email.subject).toContain('Modern 3-bed in Sandton');
    expect(email.text).toContain('Sipho Dlamini');
    expect(email.text).toContain('+27 82 000 0000');
    expect(email.html).toContain('https://proppd.com/property/modern-3-bed-in-sandton-123');
  });

  it('adds a review warning for suspicious leads', () => {
    const email = buildLeadAgentEmail({ ...base, quality: 'suspicious' });
    expect(email.text).toContain('flagged this enquiry for review');
  });

  it('escapes HTML in user-supplied fields', () => {
    const email = buildLeadAgentEmail({ ...base, message: '<script>alert(1)</script>' });
    expect(email.html).not.toContain('<script>alert(1)</script>');
    expect(email.html).toContain('&lt;script&gt;');
  });
});

describe('buildLeadUserEmail', () => {
  it('confirms to the enquirer and references the listing and agent', () => {
    const email = buildLeadUserEmail({
      leadName: 'Sipho',
      leadEmail: 'sipho@example.com',
      listingTitle: 'Modern 3-bed in Sandton',
      listingSlug: 'modern-3-bed-in-sandton-123',
      agentName: 'Lerato Mokoena',
      appUrl: 'https://proppd.com',
    });
    expect(email.to).toBe('sipho@example.com');
    expect(email.subject).toContain('Modern 3-bed in Sandton');
    expect(email.text).toContain('Lerato Mokoena');
    expect(email.html).toContain('https://proppd.com/property/modern-3-bed-in-sandton-123');
  });
});

describe('email provider configuration', () => {
  it('reports configured only when an API key is present', () => {
    expect(isEmailConfigured({})).toBe(false);
    expect(isEmailConfigured({ RESEND_API_KEY: 'key' })).toBe(true);
  });

  it('uses a default from address unless overridden', () => {
    expect(getEmailFrom({})).toContain('proppd.com');
    expect(getEmailFrom({ EMAIL_FROM: 'Test <t@x.com>' })).toBe('Test <t@x.com>');
  });
});

describe('notifyOnNewLead', () => {
  it('skips all sends in log-only mode and reports statuses', async () => {
    const summary = await notifyOnNewLead(
      {
        quality: 'valid',
        agentName: 'Lerato',
        agentEmail: 'lerato@seeff.co.za',
        listingTitle: 'Home',
        listingSlug: 'home-1',
        leadName: 'Sipho',
        leadSurname: 'Dlamini',
        leadEmail: 'sipho@example.com',
        leadPhone: '+27 82',
        message: 'Hello there, is this available?',
        intent: 'viewing',
      },
      {}, // no RESEND_API_KEY → skipped
    );
    expect(summary.agent).toBe('skipped');
    expect(summary.user).toBe('skipped');
  });

  it('reports no-recipient when the agent has no email', async () => {
    const summary = await notifyOnNewLead(
      {
        quality: 'valid',
        agentEmail: null,
        leadName: 'Sipho',
        leadSurname: 'Dlamini',
        leadEmail: 'sipho@example.com',
        leadPhone: '+27 82',
        message: 'Hello there, is this available?',
        intent: 'viewing',
      },
      {},
    );
    expect(summary.agent).toBe('no-recipient');
  });

  it('does not notify for spam leads', async () => {
    const summary = await notifyOnNewLead(
      {
        quality: 'spam',
        agentEmail: 'lerato@seeff.co.za',
        leadName: 'Spammer',
        leadSurname: 'X',
        leadEmail: 'spam@example.com',
        leadPhone: '+27 00',
        message: 'buy cheap stuff now',
        intent: 'more_info',
      },
      {},
    );
    expect(summary.agent).toBe('skipped');
    expect(summary.user).toBe('skipped');
  });
});
