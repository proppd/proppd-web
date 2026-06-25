type MagicLinkEmailOptions = {
  actionLink: string;
  email: string;
  origin: string;
};

export function buildMagicLinkEmailHtml({ actionLink, email, origin }: MagicLinkEmailOptions): string {
  const year = new Date().getFullYear();
  const logoUrl = `${origin}/proppd-logo-horizontal.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Sign in to Proppd</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-height:100%;background:#F3F4F6;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

        <!-- Logo header -->
        <tr>
          <td style="background:#FFFFFF;border-radius:12px 12px 0 0;padding:28px 32px;border:1px solid #E5E7EB;border-bottom:none;">
            <img src="${logoUrl}" alt="Proppd" height="30" style="display:block;height:30px;max-width:140px;">
          </td>
        </tr>

        <!-- Divider line -->
        <tr>
          <td style="background:#4A3AFF;height:3px;border-left:1px solid #4A3AFF;border-right:1px solid #4A3AFF;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#FFFFFF;padding:32px;border:1px solid #E5E7EB;border-top:none;border-bottom:none;">
            <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#1A1A2E;line-height:1.3;">
              Sign in to Proppd
            </h1>
            <p style="margin:0 0 6px;font-size:14px;color:#6B7280;line-height:1.6;">
              We received a sign-in request for <strong style="color:#374151;">${escapeHtml(email)}</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.6;">
              Click the button below to sign in. This link is valid for&nbsp;24&nbsp;hours and can only be used once.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td style="border-radius:8px;background:#4A3AFF;">
                  <a href="${actionLink}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">
                    Sign in to Proppd &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;line-height:1.5;">
              If the button doesn&rsquo;t work, copy and paste this link into your browser:
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;">
              <a href="${actionLink}" style="color:#4A3AFF;text-decoration:none;">${actionLink}</a>
            </p>
          </td>
        </tr>

        <!-- Security note -->
        <tr>
          <td style="background:#F9FAFB;padding:16px 32px;border:1px solid #E5E7EB;border-top:none;border-bottom:none;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
              If you didn&rsquo;t request this, you can safely ignore this email &mdash; your account will not be affected.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FFFFFF;padding:20px 32px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
            <p style="margin:0;font-size:12px;color:#D1D5DB;">
              &copy; ${year} Proppd &middot;
              <a href="${origin}" style="color:#D1D5DB;text-decoration:none;">proppd.com</a>
              &middot;
              <a href="mailto:info@proppd.com" style="color:#D1D5DB;text-decoration:none;">info@proppd.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function buildMagicLinkEmailText({ actionLink, email }: MagicLinkEmailOptions): string {
  return [
    'Sign in to Proppd',
    '',
    `We received a sign-in request for ${email}.`,
    '',
    `Click the link below to sign in (valid for 24 hours):`,
    actionLink,
    '',
    "If you didn't request this, you can safely ignore this email.",
    '',
    '-- Proppd | proppd.com | info@proppd.com',
  ].join('\n');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
