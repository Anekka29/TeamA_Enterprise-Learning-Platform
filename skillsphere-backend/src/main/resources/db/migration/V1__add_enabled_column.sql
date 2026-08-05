-- Add enabled column to users table
-- This migration adds account status tracking to support account disable functionality
ALTER TABLE users
ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;
