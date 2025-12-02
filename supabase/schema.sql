-- CV Engine Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Clerk user IDs)
-- NOTE: Clerk user IDs are strings like "user_36IAoOrvCH6oMhrKzk8nHS9pqpq", not UUIDs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID (string, not UUID)
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  job_title TEXT,
  job_description TEXT,
  pdf_path TEXT NOT NULL, -- Supabase Storage path
  image_path TEXT NOT NULL, -- Supabase Storage path
  feedback JSONB, -- Analysis results from OpenAI
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'succeeded', 'failed')), -- Status of CV analysis
  analysis_error TEXT, -- Error details when analysis fails
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for CVs table
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_created_at ON cvs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cvs_analysis_status ON cvs(analysis_status);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scans_this_month INTEGER DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for usage tracking
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage_tracking(user_id);

-- Subscriptions table (for future Stripe integration)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due'
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Row Level Security (RLS) Policies
-- 
-- NOTE: Since we're using Clerk for authentication (not Supabase Auth),
-- RLS policies using auth.uid() won't work. Security is handled in
-- application code in lib/supabase/db.ts by checking user_id in queries.
--
-- For now, we'll disable RLS and rely on application-level security.
-- Alternatively, you can enable RLS and use service role key for all operations
-- (which is what we're doing in the server-side code).

-- Disable RLS for now (security handled in application code)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cvs DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- If you want to enable RLS later with service role operations:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
-- etc.

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at
  BEFORE UPDATE ON cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

