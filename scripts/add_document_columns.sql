-- Migration script to add document columns to the admissions table
-- Run this if your database was created before these columns were added

USE tiddlee_admissions;

-- Add guardian name columns if they don't exist
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian1_name VARCHAR(255);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian2_name VARCHAR(255);

-- Add child identity document columns if they don't exist
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS aadhar_front VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS aadhar_back VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS birth_certificate VARCHAR(500);

-- Add parent/guardian Aadhaar document columns if they don't exist
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS father_aadhar_front VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS father_aadhar_back VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS mother_aadhar_front VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS mother_aadhar_back VARCHAR(500);

-- Add guardian Aadhaar document columns if they don't exist
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian1_aadhar_front VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian1_aadhar_back VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian2_aadhar_front VARCHAR(500);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian2_aadhar_back VARCHAR(500);

-- Add address proof column if it doesn't exist
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS address_proof VARCHAR(500);

-- Display confirmation
SELECT 'Document columns migration completed successfully!' AS status;
