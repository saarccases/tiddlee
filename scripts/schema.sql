CREATE DATABASE IF NOT EXISTS tiddlee_admissions;
USE tiddlee_admissions;

CREATE TABLE IF NOT EXISTS admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Child Information
    child_name VARCHAR(255),
    child_nickname VARCHAR(100),
    child_dob DATE,
    child_age VARCHAR(50),
    child_gender VARCHAR(20),
    child_photo VARCHAR(500), -- Full CDN URL from Cloudinary/Uploadthing/Vercel Blob
    child_residence_address TEXT,
    
    -- Emergency Contacts
    emergency_contact1_name VARCHAR(255),
    emergency_contact1_phone VARCHAR(50),
    emergency_contact1_relation VARCHAR(100),
    
    emergency_contact2_name VARCHAR(255),
    emergency_contact2_phone VARCHAR(50),
    emergency_contact2_relation VARCHAR(100),
    
    -- Program Selection
    programs_selected TEXT,
    languages_spoken TEXT,
    media_consent VARCHAR(10),

    -- Previous School Details
    child_attended_school VARCHAR(10),
    prev_school_name VARCHAR(255),
    prev_school_address TEXT,
    prev_school_phone VARCHAR(50),
    prev_school_class VARCHAR(50),
    prev_school_timings_from TIME,
    prev_school_timings_to TIME,
    
    -- Mother/Guardian 1 Information
    mother_name VARCHAR(255),
    mother_residence_address TEXT,
    mother_employer VARCHAR(255),
    mother_employer_address TEXT,
    mother_work_phone VARCHAR(50),
    mother_cell_phone VARCHAR(50),
    mother_email VARCHAR(255),
    mother_relationship VARCHAR(100),
    mother_photo VARCHAR(500), -- Full CDN URL from Cloudinary
    
    -- Father/Guardian 2 Information
    father_name VARCHAR(255),
    father_employer VARCHAR(255),
    father_employer_address TEXT,
    father_work_phone VARCHAR(50),
    father_cell_phone VARCHAR(50),
    father_email VARCHAR(255),
    father_relationship VARCHAR(100),
    father_photo VARCHAR(500), -- Full CDN URL from Cloudinary
    
    -- Meta
    unique_id VARCHAR(50) UNIQUE,
    admission_date DATE,
    submission_date DATE COMMENT 'Date when form was submitted or last edited',
    mother_signature VARCHAR(255),
    mother_signature_date DATE,
    father_signature VARCHAR(255),
    father_signature_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
