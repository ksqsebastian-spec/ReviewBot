-- ============================================
-- REVIEW BOT - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this SQL in your Supabase SQL Editor:
-- 1. Go to supabase.com → Your Project
-- 2. Click "SQL Editor" in the sidebar
-- 3. Paste this entire file
-- 4. Click "Run"
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: COMPANIES
-- ============================================
-- Stores information about businesses being reviewed
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,           -- URL-friendly name (e.g., "sunrise-dental")
  google_review_link TEXT NOT NULL,    -- Direct link to Google review page
  logo_url TEXT,                       -- Optional company logo
  description TEXT,                    -- Brief company description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster slug lookups (used in URLs)
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- ============================================
-- TABLE 2: DESCRIPTOR CATEGORIES
-- ============================================
-- Groups descriptors into categories (e.g., "Service Quality", "Staff")
CREATE TABLE IF NOT EXISTS descriptor_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                  -- Category name
  sort_order INTEGER DEFAULT 0,        -- Display order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching categories by company
CREATE INDEX IF NOT EXISTS idx_categories_company ON descriptor_categories(company_id);

-- ============================================
-- TABLE 3: DESCRIPTORS
-- ============================================
-- Individual phrases customers can select for reviews
CREATE TABLE IF NOT EXISTS descriptors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES descriptor_categories(id) ON DELETE CASCADE,
  text TEXT NOT NULL,                  -- The descriptor phrase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching descriptors by category
CREATE INDEX IF NOT EXISTS idx_descriptors_category ON descriptors(category_id);

-- ============================================
-- TABLE 4: EMAIL SUBSCRIBERS
-- ============================================
-- Customers who signed up for review reminders
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,                           -- Optional name
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_notified_at TIMESTAMP WITH TIME ZONE,  -- When last reminder was sent
  is_active BOOLEAN DEFAULT TRUE,      -- Soft delete flag

  -- Prevent duplicate emails per company
  UNIQUE(company_id, email)
);

-- Index for fetching subscribers by company
CREATE INDEX IF NOT EXISTS idx_subscribers_company ON email_subscribers(company_id);
-- Index for filtering active subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON email_subscribers(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLE 5: GENERATED REVIEWS
-- ============================================
-- Tracks reviews created through the tool (for analytics)
CREATE TABLE IF NOT EXISTS generated_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,           -- The generated review content
  copied BOOLEAN DEFAULT FALSE,        -- Whether user clicked "Copy"
  link_clicked BOOLEAN DEFAULT FALSE,  -- Whether user clicked Google link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries by company
CREATE INDEX IF NOT EXISTS idx_reviews_company ON generated_reviews(company_id);
-- Index for time-based analytics
CREATE INDEX IF NOT EXISTS idx_reviews_created ON generated_reviews(created_at);

-- ============================================
-- TABLE 6: REVIEW NOTIFICATIONS (Optional)
-- ============================================
-- Tracks email notifications sent (for future automated reminders)
CREATE TABLE IF NOT EXISTS review_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES email_subscribers(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE
);

-- Index for tracking notification history
CREATE INDEX IF NOT EXISTS idx_notifications_subscriber ON review_notifications(subscriber_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- For now, we allow all operations since there's no auth.
-- When you add authentication later, update these policies.

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE descriptor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notifications ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (update when adding auth)
CREATE POLICY "Allow all for companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for categories" ON descriptor_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for descriptors" ON descriptors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for subscribers" ON email_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for reviews" ON generated_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for notifications" ON review_notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DONE!
-- ============================================
-- Your database is now set up. You can:
-- 1. Go to "Table Editor" to see your tables
-- 2. Start adding companies through the dashboard
-- 3. The app will work with these tables automatically
-- ============================================
