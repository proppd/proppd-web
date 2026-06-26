import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadPortalUserAccess, approveAgentReviewRequest, rejectAgentReviewRequest } from '@/lib/proppd/backend';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendEmail, isEmailConfigured } from '@/lib/notifications/email';
import { buildMagicLinkEmailHtml, buildMagicLinkEmailText } from '@/lib/email/templates/magic-link';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access || access.role !== 'super_admin') return err('Forbidden', 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = typeof body?.action === 'string' ? body.action : '';

  if (action === 'approve') {
    const result = await approveAgentReviewRequest(id, access);
    if (!result.ok) return err(result.error, 400);

    // Send the approved applicant a magic link so they can onboard immediately.
    await sendApprovalLink(result.email, result.firstName, new URL(request.url).origin);
    return NextResponse.json({ ok: true, action: 'approved', email: result.email });
  }

  if (action === 'reject') {
    const result = await rejectAgentReviewRequest(id, access);
    if (!result.ok) return err(result.error, 400);

    await sendRejectionEmail(result.email, result.firstName, new URL(request.url).origin);
    return NextResponse.json({ ok: true, action: 'rejected', email: result.email });
  }

  return err('Invalid action. Use "approve" or "reject".', 400);
}

async function sendApprovalLink(email: string, firstName: string, origin: string): Promise<void> {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient || !isEmailConfigured()) return;

  try {
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${origin}/dashboard`,
        data: { ppra_verified: 'true', ppra_verified_at: new Date().toISOString() },
      },
    });
    if (error || !data?.properties?.action_link) return;

    await sendEmail({
      to: email,
      subject: 'Your Proppd agent access has been approved',
      html: buildApprovalEmailHtml({ actionLink: data.properties.action_link, firstName, origin }),
      text: buildApprovalEmailText({ actionLink: data.properties.action_link, firstName, origin }),
    });
  } catch {
    // Non-fatal — admin has approved in the DB; link can be resent manually.
  }
}

async function sendRejectionEmail(email: string, firstName: string, origin: string): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    await sendEmail({
      to: email,
      subject: 'Update on your Proppd agent application',
      html: buildRejectionEmailHtml({ firstName, origin }),
      text: buildRejectionEmailText({ firstName, origin }),
    });
  } catch {
    // Non-fatal.
  }
}

function buildApprovalEmailHtml({ actionLink, firstName, origin }: { actionLink: string; firstName: string; origin: string }): string {
  const year = new Date().getFullYear();
  const logoUrl = `${origin}/proppd-logo-horizontal.png`;
  const safeFirst = esc(firstName);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Welcome to Proppd</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-height:100%;background:#F3F4F6;">
<tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
<tr><td style="background:#FFFFFF;border-radius:12px 12px 0 0;padding:28px 32px;border:1px solid #E5E7EB;border-bottom:none;">
<img src="${logoUrl}" alt="Proppd" height="30" style="display:block;height:30px;max-width:140px;"></td></tr>
<tr><td style="background:#4A3AFF;height:3px;border-left:1px solid #4A3AFF;border-right:1px solid #4A3AFF;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="background:#FFFFFF;padding:32px;border:1px solid #E5E7EB;border-top:none;border-bottom:none;">
<h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#1A1A2E;">Welcome to Proppd, ${safeFirst}!</h1>
<p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6;">Your agent application has been reviewed and approved. Click below to sign in and set up your agent profile.</p>
<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;"><tr>
<td style="border-radius:8px;background:#4A3AFF;">
<a href="${actionLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;">Sign in to Proppd &rarr;</a>
</td></tr></table>
<p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;line-height:1.5;">If the button doesn&rsquo;t work, copy and paste this link into your browser:</p>
<p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;"><a href="${actionLink}" style="color:#4A3AFF;text-decoration:none;">${actionLink}</a></p>
</td></tr>
<tr><td style="background:#FFFFFF;padding:20px 32px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
<p style="margin:0;font-size:12px;color:#D1D5DB;">&copy; ${year} Proppd &middot; <a href="${origin}" style="color:#D1D5DB;text-decoration:none;">proppd.com</a> &middot; <a href="mailto:info@proppd.com" style="color:#D1D5DB;text-decoration:none;">info@proppd.com</a></p>
</td></tr></table></td></tr></table></body></html>`;
}

function buildApprovalEmailText({ actionLink, firstName, origin }: { actionLink: string; firstName: string; origin: string }): string {
  return [
    `Welcome to Proppd, ${firstName}!`,
    '',
    'Your agent application has been reviewed and approved.',
    'Click the link below to sign in and set up your profile:',
    actionLink,
    '',
    `-- Proppd | ${origin} | info@proppd.com`,
  ].join('\n');
}

function buildRejectionEmailHtml({ firstName, origin }: { firstName: string; origin: string }): string {
  const year = new Date().getFullYear();
  const logoUrl = `${origin}/proppd-logo-horizontal.png`;
  const safeFirst = esc(firstName);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Proppd application update</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-height:100%;background:#F3F4F6;">
<tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
<tr><td style="background:#FFFFFF;border-radius:12px 12px 0 0;padding:28px 32px;border:1px solid #E5E7EB;border-bottom:none;">
<img src="${logoUrl}" alt="Proppd" height="30" style="display:block;height:30px;max-width:140px;"></td></tr>
<tr><td style="background:#4A3AFF;height:3px;border-left:1px solid #4A3AFF;border-right:1px solid #4A3AFF;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="background:#FFFFFF;padding:32px;border:1px solid #E5E7EB;border-top:none;border-bottom:none;">
<h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#1A1A2E;">Hi ${safeFirst},</h1>
<p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6;">Thank you for applying to join Proppd as an agent. After reviewing your application, we were unable to verify your FFC registration against the PPRA register at this time.</p>
<p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6;">If you believe this is an error, or your PPRA registration has since been updated, please email us at <a href="mailto:info@proppd.com" style="color:#4A3AFF;">info@proppd.com</a> with your FFC number and we will review it again.</p>
</td></tr>
<tr><td style="background:#FFFFFF;padding:20px 32px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
<p style="margin:0;font-size:12px;color:#D1D5DB;">&copy; ${year} Proppd &middot; <a href="${origin}" style="color:#D1D5DB;text-decoration:none;">proppd.com</a> &middot; <a href="mailto:info@proppd.com" style="color:#D1D5DB;text-decoration:none;">info@proppd.com</a></p>
</td></tr></table></td></tr></table></body></html>`;
}

function buildRejectionEmailText({ firstName, origin }: { firstName: string; origin: string }): string {
  return [
    `Hi ${firstName},`,
    '',
    'Thank you for applying to join Proppd as an agent.',
    'After reviewing your application, we were unable to verify your FFC registration against the PPRA register at this time.',
    '',
    'If you believe this is an error, or your PPRA registration has since been updated, please email us at info@proppd.com with your FFC number and we will review it again.',
    '',
    `-- Proppd | ${origin} | info@proppd.com`,
  ].join('\n');
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
