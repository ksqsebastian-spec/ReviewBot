import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/*
  Email Sending API - POST /api/email/send

  Sends review reminder emails to subscribers.
  Uses Gmail SMTP via Nodemailer for delivery.

  MODES:
  - "test": Send to a specific email immediately
  - "due": Send to all subscribers with due notifications
  - "subscriber": Send to a specific subscriber for a specific company

  SECURITY:
  - Uses service role key (server-side only)
  - Rate limited by Gmail (500/day)
  - Validates all inputs

  ENV VARS REQUIRED:
  - GMAIL_USER: Your Gmail address
  - GMAIL_APP_PASSWORD: App password from Google Account
*/

// Gmail SMTP configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Create reusable transporter with Gmail SMTP
function getEmailTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

// Create Supabase client with service role for server operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Send email via Gmail SMTP
async function sendEmail({ to, subject, html, from }) {
  const transporter = getEmailTransporter();

  const mailOptions = {
    from: from || `Review Bot <${GMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };

  const result = await transporter.sendMail(mailOptions);
  return { id: result.messageId, success: true };
}

// Generate email HTML for review reminder
function generateReviewReminderEmail({ subscriberName, companyName, reviewUrl, language = 'de' }) {
  const texts = {
    de: {
      greeting: subscriberName ? `Hallo ${subscriberName}` : 'Hallo',
      intro: `Wir hoffen, Sie hatten eine gute Erfahrung bei ${companyName}.`,
      cta: 'Wuerden Sie sich einen Moment Zeit nehmen, um eine Bewertung zu hinterlassen?',
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
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${companyName}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937;">${t.greeting},</p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563; line-height: 1.6;">${t.intro}</p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #4b5563; line-height: 1.6;">${t.cta}</p>
              <!-- CTA Button -->
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
          <!-- Footer -->
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, email, subscriberId, companyId } = body;

    const supabase = getSupabaseAdmin();

    // MODE: Test - send immediately to a specific email
    if (mode === 'test') {
      if (!email) {
        return Response.json({ error: 'Email required for test mode' }, { status: 400 });
      }

      // Get a company to use for the test
      const { data: company } = await supabase
        .from('companies')
        .select('id, name, slug, google_review_url')
        .limit(1)
        .single();

      if (!company) {
        return Response.json({ error: 'No company found for test' }, { status: 400 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const reviewUrl = `${baseUrl}/review/${company.slug}`;

      const html = generateReviewReminderEmail({
        subscriberName: 'Test User',
        companyName: company.name,
        reviewUrl,
        language: 'de',
      });

      const result = await sendEmail({
        to: email,
        subject: `Bewertungserinnerung: ${company.name}`,
        html,
      });

      return Response.json({
        success: true,
        message: `Test email sent to ${email}`,
        emailId: result.id,
      });
    }

    // MODE: Due - send to all subscribers with due notifications
    if (mode === 'due') {
      const now = new Date().toISOString();

      // Find all due notifications (not completed, notification time passed)
      const { data: dueSubscriptions, error: fetchError } = await supabase
        .from('subscriber_companies')
        .select(`
          id,
          subscriber_id,
          company_id,
          subscribers (id, email, name, preferred_language, is_active),
          companies (id, name, slug, google_review_url)
        `)
        .lte('next_notification_at', now)
        .is('review_completed_at', null);

      if (fetchError) throw fetchError;

      // Filter to only active subscribers
      const activeSubscriptions = (dueSubscriptions || []).filter(
        (sub) => sub.subscribers?.is_active
      );

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

          // Update last_notified_at (don't schedule next - they only need to review once)
          await supabase
            .from('subscriber_companies')
            .update({
              last_notified_at: now,
              next_notification_at: null, // Don't schedule another - wait for review completion
            })
            .eq('id', sub.id);

          results.push({ success: true, email: sub.subscribers.email, emailId: emailResult.id });
        } catch (err) {
          console.error(`Failed to send to ${sub.subscribers.email}:`, err);
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
        results,
      });
    }

    // MODE: Single subscriber - send to specific subscriber for specific company
    if (mode === 'subscriber') {
      if (!subscriberId || !companyId) {
        return Response.json(
          { error: 'subscriberId and companyId required' },
          { status: 400 }
        );
      }

      // Fetch subscriber and company
      const { data: subscription, error: subError } = await supabase
        .from('subscriber_companies')
        .select(`
          id,
          review_completed_at,
          subscribers (id, email, name, preferred_language, is_active),
          companies (id, name, slug, google_review_url)
        `)
        .eq('subscriber_id', subscriberId)
        .eq('company_id', companyId)
        .single();

      if (subError || !subscription) {
        return Response.json({ error: 'Subscription not found' }, { status: 404 });
      }

      if (subscription.review_completed_at) {
        return Response.json(
          { error: 'Review already completed for this company' },
          { status: 400 }
        );
      }

      if (!subscription.subscribers.is_active) {
        return Response.json({ error: 'Subscriber is inactive' }, { status: 400 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const reviewUrl = `${baseUrl}/review/${subscription.companies.slug}?sid=${subscriberId}`;

      const html = generateReviewReminderEmail({
        subscriberName: subscription.subscribers.name,
        companyName: subscription.companies.name,
        reviewUrl,
        language: subscription.subscribers.preferred_language || 'de',
      });

      const result = await sendEmail({
        to: subscription.subscribers.email,
        subject: `Bewertungserinnerung: ${subscription.companies.name}`,
        html,
      });

      // Log the notification
      await supabase.from('notifications_sent').insert({
        subscriber_id: subscriberId,
        company_id: companyId,
        email_type: 'review_reminder',
        email_subject: `Bewertungserinnerung: ${subscription.companies.name}`,
      });

      // Update last_notified_at
      await supabase
        .from('subscriber_companies')
        .update({ last_notified_at: new Date().toISOString() })
        .eq('id', subscription.id);

      return Response.json({
        success: true,
        message: `Email sent to ${subscription.subscribers.email}`,
        emailId: result.id,
      });
    }

    return Response.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('Email API error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
