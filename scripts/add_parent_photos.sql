-- Migration Script: Add Parent Photo Columns
-- Date: 2026-02-10
-- Description: Adds mother_photo and father_photo columns to admissions table

USE tiddlee_admissions;

-- Add mother_photo column
ALTER TABLE admissions 
ADD COLUMN mother_photo VARCHAR(500) 
COMMENT 'Full CDN URL from Cloudinary for mother/guardian 1 photo';

-- Add father_photo column
ALTER TABLE admissions 
ADD COLUMN father_photo VARCHAR(500) 
COMMENT 'Full CDN URL from Cloudinary for father/guardian 2 photo';

-- Verify columns were added
DESCRIBE admissions;

-- Check existing data
SELECT 
    id,
    child_name,
    child_photo,
    mother_name,
    mother_photo,
    father_name,
    father_photo
FROM admissions
ORDER BY id DESC
LIMIT 5;
