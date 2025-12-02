-- Migration: Fix user_id to use TEXT instead of UUID for Clerk IDs
-- Clerk user IDs are strings like "user_36IAoOrvCH6oMhrKzk8nHS9pqpq", not UUIDs
-- Run this in your Supabase SQL Editor
-- Drop foreign key constraints first
ALTER TABLE cvs
DROP CONSTRAINT IF EXISTS cvs_user_id_fkey;

ALTER TABLE usage_tracking
DROP CONSTRAINT IF EXISTS usage_tracking_user_id_fkey;

ALTER TABLE subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Change users.id from UUID to TEXT
ALTER TABLE users
ALTER COLUMN id TYPE TEXT;

-- Change all user_id columns from UUID to TEXT
ALTER TABLE cvs
ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE usage_tracking
ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE subscriptions
ALTER COLUMN user_id TYPE TEXT;

-- Re-add foreign key constraints
ALTER TABLE cvs ADD CONSTRAINT cvs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE usage_tracking ADD CONSTRAINT usage_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;