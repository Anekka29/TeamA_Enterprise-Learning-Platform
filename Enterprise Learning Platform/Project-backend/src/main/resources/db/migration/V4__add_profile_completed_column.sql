-- Add profileCompleted column to track whether user has completed their profile
-- This allows the dashboard to show "Complete your profile" prompt for new users
ALTER TABLE users
ADD COLUMN profileCompleted BOOLEAN NOT NULL DEFAULT FALSE;
