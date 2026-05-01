import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

function buildHtml(bugTitle: string, oldStatus: string, newStatus: string, assigneeName: string, timestamp: string): string {
  return `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc;">
      <div style="background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Issue Status Updated</h2>
        <h3 style="margin: 0 0 24px; color: #10b981; font-size: 16px;">${bugTitle}</h3>
        
        <table style="width: 100%; font-size: 14px; color: #334155; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 0; font-weight: 600;">Status Change</td>
            <td style="padding: 12px 0;">${oldStatus} &rarr; <strong>${newStatus}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 0; font-weight: 600;">Assignee</td>
            <td style="padding: 12px 0;">${assigneeName || 'Unassigned'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600;">Time</td>
            <td style="padding: 12px 0;">${timestamp || new Date().toLocaleString()}</td>
          </tr>
        </table>
        <div style="margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center;">
          Automated notification from Bug Tracker
        </div>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { to, bugTitle, oldStatus, newStatus, assigneeName, timestamp } = await req.json();

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.EMAIL_FROM || smtpUser || 'notifications@example.com';

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('[EMAIL] SMTP missing. Mock sending...');
      return NextResponse.json({ success: true, mock: true });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Bug Tracker" <${fromEmail}>`,
      to: to || fromEmail,
      subject: `[Update] ${bugTitle} is now ${newStatus}`,
      html: buildHtml(bugTitle, oldStatus, newStatus, assigneeName, timestamp),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[EMAIL ERROR]', err);
    return NextResponse.json({ success: true, error: err.message }); // Don't break app flow
  }
}
