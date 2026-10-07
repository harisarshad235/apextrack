import { getCloudflareContext } from '@opennextjs/cloudflare';

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'ApexTrack <notifications@harisarshad.site>';
const FALLBACK_FROM = 'ApexTrack <onboarding@resend.dev>';
const ADMIN_NOTIFICATION_EMAIL = 'harisarshad235@gmail.com';

function getEnvVar(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    if ((env as any)?.[key]) return (env as any)[key];
  } catch (e) {}
  return process.env[key];
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, from, replyTo }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = getEnvVar('RESEND_API_KEY');
  const defaultSender = getEnvVar('RESEND_FROM_EMAIL') || DEFAULT_FROM;
  const replyAddress = replyTo || getEnvVar('RESEND_REPLY_TO') || 'harisarshad235@gmail.com';

  if (!apiKey) {
    console.warn('\n======================================================');
    console.warn('[Resend] RESEND_API_KEY is not configured in .dev.vars or .env.local.');
    console.warn(`[Resend] To send real emails, set RESEND_API_KEY="re_..." in .dev.vars / .env.local`);
    console.warn('======================================================\n');
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  const sender = from || defaultSender;

  try {
    const payload: Record<string, any> = {
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyAddress,
      headers: {
        'X-Entity-Ref-ID': `apextrack-${Date.now()}`,
      },
    };

    if (text) {
      payload.text = text;
    }

    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      // If custom domain verification failed in Resend, retry once with onboarding fallback
      if (sender !== FALLBACK_FROM && (res.status === 403 || res.status === 400 || data?.message?.includes('domain') || data?.message?.includes('verified'))) {
        console.warn(`[Resend] Custom domain sender failed (${data?.message}). Retrying with onboarding fallback...`);
        return sendEmail({ to, subject, html, text, from: FALLBACK_FROM, replyTo: replyAddress });
      }

      console.error('[Resend] Failed to send email via Resend API:', data);
      return { success: false, error: data?.message || `HTTP ${res.status}` };
    }

    console.log('[Resend] Email sent successfully. Message ID:', data.id);
    return { success: true, id: data.id };
  } catch (err: unknown) {
    console.error('[Resend] Network error sending email:', err);
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Sends a password reset email containing a secure 15-minute tokenized link.
 * Includes both HTML and plain-text (RFC 2046 multipart/alternative) to maximize inbox deliverability.
 */
export async function sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<{ success: boolean; error?: string }> {
  const subject = 'Reset your ApexTrack password';
  
  const text = `Hello,

We received a request to reset your password for your ApexTrack account (${toEmail}).

To choose a new password, click the link below or copy and paste it into your browser:
${resetLink}

This link is valid for 15 minutes.

If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged.

Best regards,
ApexTrack Team
https://apex.harisarshad.site
Support: harisarshad235@gmail.com`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset your ApexTrack password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 32px 16px; }
    .container { max-width: 520px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 14px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); }
    .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .brand-title { font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px; }
    .brand-sub { font-size: 11px; font-family: monospace; color: #3b82f6; background-color: rgba(59, 130, 246, 0.12); padding: 2px 6px; border-radius: 4px; }
    h1 { font-size: 19px; font-weight: 600; color: #f8fafc; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px; }
    .btn-container { margin: 26px 0; text-align: center; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
    .fallback { font-size: 12px; color: #64748b; line-height: 1.5; word-break: break-all; margin-top: 18px; padding-top: 14px; border-top: 1px solid #1e293b; }
    .fallback a { color: #3b82f6; text-decoration: underline; }
    .notice { font-size: 12px; color: #94a3b8; background-color: #0d1322; border-left: 3px solid #3b82f6; padding: 12px 14px; border-radius: 6px; margin-top: 20px; }
    .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #1e293b; font-size: 11px; color: #475569; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-title">ApexTrack</div>
      <span class="brand-sub">ACCOUNT RECOVERY</span>
    </div>
    <h1>Password Reset Request</h1>
    <p>Hello,</p>
    <p>We received a request to reset the password for your ApexTrack account associated with <strong>${toEmail}</strong>.</p>
    <p>Click the button below to choose a new password. This link will expire in <strong>15 minutes</strong> for security.</p>
    
    <div class="btn-container">
      <a href="${resetLink}" class="btn" target="_blank" rel="noopener noreferrer">Reset Password</a>
    </div>

    <div class="fallback">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
    </div>

    <div class="notice">
      If you did not request this password reset, no action is needed. Your existing password remains secure.
    </div>

    <div class="footer">
      ApexTrack Agile & Architecture Platform<br>
      © 2026 ApexTrack. Need help? Reply to this email or contact support.
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: toEmail, subject, html, text });
}

/**
 * Sends an email alert to the workspace administrator when a new user self-registers.
 */
export async function sendAdminNewUserAlert(
  newUserEmail: string,
  newUserName?: string,
  department?: string
): Promise<{ success: boolean; error?: string }> {
  const subject = `[ApexTrack Alert] New user pending approval: ${newUserEmail}`;
  const name = newUserName || 'A new user';
  const dept = department || 'General';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New User Pending Approval</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 40px 20px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 36px; }
    .brand-title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 20px; }
    h1 { font-size: 18px; color: #f8fafc; margin-bottom: 14px; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
    .card { background-color: #1e293b; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .row { margin-bottom: 8px; font-size: 13px; }
    .label { color: #64748b; font-weight: 600; width: 90px; display: inline-block; }
    .val { color: #f1f5f9; font-weight: 500; }
    .badge { background-color: rgba(234, 179, 8, 0.2); color: #facc15; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .footer { margin-top: 24px; font-size: 11px; color: #475569; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand-title">ApexTrack Access Control</div>
    <h1>New Account Registration Awaiting Approval</h1>
    <p>A new user has registered and is currently in the <strong>PENDING</strong> holding queue.</p>
    
    <div class="card">
      <div class="row"><span class="label">Name:</span> <span class="val">${name}</span></div>
      <div class="row"><span class="label">Email:</span> <span class="val">${newUserEmail}</span></div>
      <div class="row"><span class="label">Department:</span> <span class="val">${dept}</span></div>
      <div class="row"><span class="label">Status:</span> <span class="badge">PENDING APPROVAL</span></div>
    </div>

    <p>You can approve or adjust role privileges from the <strong>Team & Access</strong> control center inside ApexTrack.</p>

    <div class="footer">
      ApexTrack Workspace Admin Alerts
    </div>
  </div>
</body>
</html>
  `;

  const text = `ApexTrack Admin Alert

New user pending approval:
Name: ${name}
Email: ${newUserEmail}
Department: ${dept}
Status: PENDING APPROVAL

Review and approve this user in the Team & Access control center:
https://apex.harisarshad.site`;

  return sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, subject, html, text });
}
