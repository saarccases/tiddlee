USE tiddlee_admissions;

ALTER TABLE admissions ADD COLUMN allergies TEXT;
ALTER TABLE admissions ADD COLUMN guardian_name VARCHAR(255);
ALTER TABLE admissions ADD COLUMN guardian_phone VARCHAR(50);
ALTER TABLE admissions ADD COLUMN guardian_relationship VARCHAR(100);
ALTER TABLE admissions ADD COLUMN daycare_time_opted VARCHAR(100);
ALTER TABLE admissions ADD COLUMN emergency_contact_name VARCHAR(255);
ALTER TABLE admissions ADD COLUMN emergency_contact_phone VARCHAR(50);
ALTER TABLE admissions ADD COLUMN emergency_contact_relation VARCHAR(100);
