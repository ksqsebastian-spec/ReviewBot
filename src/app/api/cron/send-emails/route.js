import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/*
  Automated Email Cron Job - GET /api/cron/send-emails

  This endpoint is called automatically by Vercel Cron every 5 minutes.
  It finds all subscribers with due notifications and sends their reminder emails.

  SECURITY:
  - Validates CRON_SECRET to ensure only Vercel cron can trigger this
  - Uses service role key for database access

  This is the "regular" customer flow - after signup, customers automatically
  receive their reminder emails when next_notification_at is reached.
*/

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const CRON_SECRET = process.env.CRON_SECRET;

// Create Supabase client with service role for server operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Create reusable transporter with Gmail SMTP
function getEmailTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

// Generate email HTML for review reminder
function generateReviewReminderEmail({ subscriberName, companyName, reviewUrl, language = 'de' }) {
  const texts = {
    de: {
      greeting: subscriberName ? `Hallo ${subscriberName}` : 'Hallo',
      intro: `Wir hoffen, Sie hatten eine gute Erfahrung bei ${companyName}.`,
      cta: 'Würden Sie sich einen Moment Zeit nehmen, um eine Bewertung zu hinterlassen?',
      button: 'Jetzt bewerten',
      thanks: 'Vielen Dank für Ihre Unterstützung!',
      footer: 'Sie erhalten diese E-Mail, weil Sie sich für Bewertungserinnerungen angemeldet haben.',
      unsubscribe: 'Abmelden',
    },
    en: {
      greeting: subscriberName ? `Hello ${subscriberName}` : 'Hello',
      intro: `We hope you had a great experience at ${companyName}.`,
      cta: 'Would you take a moment to share your experience with a review?',
      button: 'Write a Review',
      thanks: 'Thank you for your support!',
      footer: 'You are receiving this email because you signed up for review reminders.',
      unsubscribe: 'Unsubscribe',
    },
  };

  const t = texts[language] || texts.de;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.button}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${companyName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937;">${t.greeting},</p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563; line-height: 1.6;">${t.intro}</p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #4b5563; line-height: 1.6;">${t.cta}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${reviewUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">${t.button}</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; font-size: 16px; color: #4b5563;">${t.thanks}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">${t.footer}</p>
              <a href="#" style="font-size: 12px; color: #6b7280;">${t.unsubscribe}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Send email via Gmail SMTP
async function sendEmail({ to, subject, html }) {
  const transporter = getEmailTransporter();

  const mailOptions = {
    from: `Review Bot <${GMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };

  const result = await transporter.sendMail(mailOptions);
  return { id: result.messageId, success: true };
}

// Vercel Cron calls this endpoint automatically
export async function GET(request) {
  try {
    // Verify the request is from Vercel Cron (security)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Find all due notifications
    const { data: dueSubscriptions, error: fetchError } = await supabase
      .from('subscriber_companies')
      .select(`
        id,
        subscriber_id,
        company_id,
        subscribers (id, email, name, preferred_language, is_active, notification_interval_days, preferred_time_slot),
        companies (id, name, slug)
      `)
      .lte('next_notification_at', now)
      .is('review_completed_at', null);

    if (fetchError) throw fetchError;

    // Filter to only active subscribers
    const activeSubscriptions = (dueSubscriptions || []).filter(
      (sub) => sub.subscribers?.is_active
    );

    if (activeSubscriptions.length === 0) {
      return Response.json({
        success: true,
        message: 'No due emails',
        sent: 0,
        timestamp: now,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const results = [];

    for (const sub of activeSubscriptions) {
      try {
        const reviewUrl = `${baseUrl}/review/${sub.companies.slug}?sid=${sub.subscriber_id}`;

        const html = generateReviewReminderEmail({
          subscriberName: sub.subscribers.name,
          companyName: sub.companies.name,
          reviewUrl,
          language: sub.subscribers.preferred_language || 'de',
        });

        const emailResult = await sendEmail({
          to: sub.subscribers.email,
          subject: `Bewertungserinnerung: ${sub.companies.name}`,
          html,
        });

        // Log the notification
        await supabase.from('notifications_sent').insert({
          subscriber_id: sub.subscriber_id,
          company_id: sub.company_id,
          email_type: 'review_reminder',
          email_subject: `Bewertungserinnerung: ${sub.companies.name}`,
        });

        // Calculate next notification time
        const intervalDays = sub.subscribers.notification_interval_days || 30;
        let nextNotificationAt = null;

        if (intervalDays === 0) {
          // Instant test: reschedule to 10 seconds
          nextNotificationAt = new Date(Date.now() + 10 * 1000).toISOString();
        } else if (intervalDays < 1) {
          // Sub-day interval (test): convert to milliseconds
          const minutes = Math.round(intervalDays * 24 * 60);
          nextNotificationAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        } else {
          // Regular interval: apply variance, time slot, weekend avoidance
          const variance = Math.floor(intervalDays * 0.33);
          const randomDays = intervalDays + Math.floor(Math.random() * (variance * 2 + 1)) - variance;

          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + Math.max(1, randomDays));

          const timeSlot = sub.subscribers.preferred_time_slot || 'morning';
          let hour;
          switch (timeSlot) {
            case 'morning': hour = 8 + Math.floor(Math.random() * 4); break;
            case 'afternoon': hour = 12 + Math.floor(Math.random() * 5); break;
            case 'evening': hour = 17 + Math.floor(Math.random() * 4); break;
            default: hour = 9 + Math.floor(Math.random() * 10);
          }
          nextDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

          const dayOfWeek = nextDate.getDay();
          if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.2) {
            nextDate.setDate(nextDate.getDate() + (dayOfWeek === 0 ? 1 : -1));
          }

          nextNotificationAt = nextDate.toISOString();
        }

        // Update database
        await supabase
          .from('subscriber_companies')
          .update({
            last_notified_at: now,
            next_notification_at: nextNotificationAt,
          })
          .eq('id', sub.id);

        results.push({ success: true, email: sub.subscribers.email });
      } catch (err) {
        console.error(`Cron: Failed to send to ${sub.subscribers.email}:`, err);
        results.push({ success: false, email: sub.subscribers.email, error: err.message });

        // Log the error
        await supabase.from('notifications_sent').insert({
          subscriber_id: sub.subscriber_id,
          company_id: sub.company_id,
          email_type: 'review_reminder',
          error_message: err.message,
        });
      }
    }

    return Response.json({
      success: true,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      timestamp: now,
      results,
    });
  } catch (error) {
    console.error('Cron email error:', error);
    return Response.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    );
  }
}
