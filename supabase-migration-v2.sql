-- ============================================
-- REVIEW BOT - DATABASE MIGRATION V2
-- ============================================
-- Enhanced Email Subscriber System
-- Run this AFTER the initial schema
-- ============================================

-- ============================================
-- TABLE: SUBSCRIBERS (Person-Centric)
-- ============================================
-- One record per person (email), can subscribe to multiple companies
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  preferred_language TEXT DEFAULT 'de',  -- 'de' = German, 'en' = English
  notification_interval_days INTEGER DEFAULT 30,  -- Base interval
  preferred_time_slot TEXT DEFAULT 'morning',  -- 'morning', 'afternoon', 'evening'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE  -- Global unsubscribe flag
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
-- Index for active subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLE: SUBSCRIBER_COMPANIES (Many-to-Many)
-- ============================================
-- Links subscribers to companies they want reminders for
-- Once review_completed_at is set, no more reminders for that company
CREATE TABLE IF NOT EXISTS subscriber_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_notification_at TIMESTAMP WITH TIME ZONE,  -- Pre-calculated with randomness
  last_notified_at TIMESTAMP WITH TIME ZONE,
  review_completed_at TIMESTAMP WITH TIME ZONE,  -- Set when user submits a review (DONE!)

  -- Prevent duplicate subscriptions
  UNIQUE(subscriber_id, company_id)
);

-- Index for finding subscriptions by subscriber
CREATE INDEX IF NOT EXISTS idx_subcomp_subscriber ON subscriber_companies(subscriber_id);
-- Index for finding subscriptions by company
CREATE INDEX IF NOT EXISTS idx_subcomp_company ON subscriber_companies(company_id);
-- Index for finding due notifications (only for incomplete reviews)
CREATE INDEX IF NOT EXISTS idx_subcomp_next_notification ON subscriber_companies(next_notification_at)
  WHERE next_notification_at IS NOT NULL AND review_completed_at IS NULL;
-- Index for completed reviews
CREATE INDEX IF NOT EXISTS idx_subcomp_completed ON subscriber_companies(review_completed_at)
  WHERE review_completed_at IS NOT NULL;

-- ============================================
-- TABLE: NOTIFICATIONS_SENT (Logging)
-- ============================================
-- Tracks all emails sent for analytics and debugging
CREATE TABLE IF NOT EXISTS notifications_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,  -- Keep logs even if company deleted
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_type TEXT DEFAULT 'review_reminder',  -- 'review_reminder', 'welcome', 'unsubscribe_confirm'
  email_subject TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  -- For debugging
  error_message TEXT
);

-- Index for subscriber history
CREATE INDEX IF NOT EXISTS idx_notif_subscriber ON notifications_sent(subscriber_id);
-- Index for company analytics
CREATE INDEX IF NOT EXISTS idx_notif_company ON notifications_sent(company_id);
-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_notif_sent_at ON notifications_sent(sent_at);

-- ============================================
-- TABLE: APP_SETTINGS (Global Config)
-- ============================================
-- Stores app-wide settings (single row table)
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Ensures single row
  default_language TEXT DEFAULT 'de',
  default_notification_interval_days INTEGER DEFAULT 30,
  min_days_between_emails INTEGER DEFAULT 3,  -- Anti-spam: minimum gap
  email_from_name TEXT DEFAULT 'Review Bot',
  email_from_address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (update when adding auth)
CREATE POLICY "Allow all for subscribers_new" ON subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for subscriber_companies" ON subscriber_companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for notifications_sent" ON notifications_sent FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- HELPER FUNCTION: Calculate Next Notification
-- ============================================
-- This function calculates the next notification date with randomness
CREATE OR REPLACE FUNCTION calculate_next_notification(
  base_interval_days INTEGER,
  last_sent TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  variance INTEGER;
  random_days INTEGER;
  random_hour INTEGER;
  random_minutes INTEGER;
  next_date TIMESTAMP WITH TIME ZONE;
  day_of_week INTEGER;
BEGIN
  -- 1. Calculate variance (±33% of base interval)
  variance := GREATEST(1, (base_interval_days * 33) / 100);
  random_days := base_interval_days + (FLOOR(RANDOM() * (variance * 2 + 1)) - variance)::INTEGER;

  -- 2. Random hour (70% business hours 9-18, 30% evening 18-21)
  IF RANDOM() < 0.7 THEN
    random_hour := 9 + FLOOR(RANDOM() * 9)::INTEGER;  -- 9-17
  ELSE
    random_hour := 18 + FLOOR(RANDOM() * 3)::INTEGER;  -- 18-20
  END IF;

  -- 3. Random minutes (3-57, avoid exact hours)
  random_minutes := 3 + FLOOR(RANDOM() * 54)::INTEGER;

  -- 4. Calculate next date
  next_date := last_sent + (random_days || ' days')::INTERVAL;
  next_date := DATE_TRUNC('day', next_date) + (random_hour || ' hours')::INTERVAL + (random_minutes || ' minutes')::INTERVAL;

  -- 5. Weekend avoidance (80% prefer weekdays)
  day_of_week := EXTRACT(DOW FROM next_date)::INTEGER;
  IF day_of_week = 0 AND RANDOM() > 0.2 THEN  -- Sunday
    next_date := next_date + INTERVAL '1 day';  -- Move to Monday
  ELSIF day_of_week = 6 AND RANDOM() > 0.2 THEN  -- Saturday
    next_date := next_date - INTERVAL '1 day';  -- Move to Friday
  END IF;

  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADD COLUMN IF TABLE EXISTS (for existing installations)
-- ============================================
-- Safe to run multiple times
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriber_companies' AND column_name = 'review_completed_at'
  ) THEN
    ALTER TABLE subscriber_companies ADD COLUMN review_completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- New tables created:
-- - subscribers (person-centric, with global preferences)
-- - subscriber_companies (many-to-many, tracks review completion)
-- - notifications_sent (logging)
-- - app_settings (global config)
--
-- Key design: Once review_completed_at is set for a company,
-- subscriber is DONE with that company - no more reminders.
--
-- The old email_subscribers table is kept for backward compatibility
-- but new signups will use the new structure.
-- ============================================
