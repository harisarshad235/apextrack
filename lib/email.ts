/**
 * Edge-compatible Resend Email Dispatcher for ApexTrack.
 * Uses native fetch to https://api.resend.com/emails with zero Node.js SDK dependencies.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'ApexTrack <notifications@harisarshad.site>';
const FALLBACK_FROM = 'ApexTrack <onboarding@resend.dev>';
const ADMIN_NOTIFICATION_EMAIL = 'harisarshad235@gmail.com';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not configured in environment.');
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  const sender = from || DEFAULT_FROM;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      // If domain verification failed on custom domain, retry once with onboarding fallback
      if (sender !== FALLBACK_FROM && (res.status === 403 || res.status === 400 || data?.message?.includes('domain'))) {
        console.warn(`[Resend] Custom sender failed (${data?.message}). Retrying with onboarding fallback...`);
        return sendEmail({ to, subject, html, from: FALLBACK_FROM });
      }

      console.error('[Resend] Failed to send email:', data);
      return { success: false, error: data?.message || `HTTP ${res.status}` };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    console.error('[Resend] Network error sending email:', err);
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Sends a password reset email containing a secure 15-minute tokenized link.
 */
export async function sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<{ success: boolean; error?: string }> {
  const subject = 'Reset your ApexTrack password';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your ApexTrack password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 40px 20px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .brand { display: flex; align-items: center; margin-bottom: 24px; }
    .brand-title { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    .badge { font-size: 10px; font-weight: 700; background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 6px; border-radius: 4px; margin-left: 8px; }
    h1 { font-size: 20px; font-weight: 600; color: #f8fafc; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 18px; }
    .btn-container { margin: 28px 0; text-align: center; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
    .btn:hover { background-color: #1d4ed8; }
    .notice { font-size: 12px; color: #64748b; background-color: #0b1120; border-left: 3px solid #3b82f6; padding: 12px; border-radius: 6px; margin-top: 24px; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 11px; color: #475569; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-title">ApexTrack</div>
      <span class="badge">SECURITY</span>
    </div>
    <h1>Password Reset Request</h1>
    <p>Hello,</p>
    <p>We received a request to reset the password for your ApexTrack account associated with <strong>${toEmail}</strong>.</p>
    <p>Click the button below to choose a new password. For security, this link will expire in <strong>15 minutes</strong>.</p>
    
    <div class="btn-container">
      <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
    </div>

    <div class="notice">
      If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged.
    </div>

    <div class="footer">
      ApexTrack Distributed Edge Agile & Architecture Platform<br>
      © 2026 ApexTrack. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: toEmail, subject, html });
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

  return sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, subject, html });
}
