-- Migration Script: Add Submission Date Tracking
-- Date: 2026-02-10
-- Description: Adds submission_date column to track when forms are submitted or edited

USE tiddlee_admissions;

-- Add submission_date column
ALTER TABLE admissions 
ADD COLUMN submission_date DATE 
COMMENT 'Date when form was submitted or last edited';

-- Verify column was added
DESCRIBE admissions;

-- Check existing data
SELECT 
    id,
    child_name,
    admission_date,
    submission_date,
    created_at,
    updated_at
FROM admissions
ORDER BY id DESC
LIMIT 5;
