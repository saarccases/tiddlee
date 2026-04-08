import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Define the expected schema: [columnName, columnDefinition]
const EXPECTED_COLUMNS: [string, string][] = [
    // Child Information
    ['child_name', 'VARCHAR(255)'],
    ['child_nickname', 'VARCHAR(100)'],
    ['child_dob', 'DATE'],
    ['child_age', 'VARCHAR(50)'],
    ['child_gender', 'VARCHAR(20)'],
    ['child_photo', 'VARCHAR(500)'],
    ['child_residence_address', 'TEXT'],

    // Emergency Contacts
    ['emergency_contact_name', 'VARCHAR(255)'],
    ['emergency_contact_phone', 'VARCHAR(50)'],
    ['emergency_contact_relation', 'VARCHAR(100)'],

    // Program Selection
    ['programs_selected', 'TEXT'],
    ['daycare_time_opted', 'VARCHAR(100)'],
    ['languages_spoken', 'TEXT'],
    ['allergies', 'TEXT'],
    ['media_consent', 'VARCHAR(10)'],

    // Previous School Details
    ['child_attended_school', 'VARCHAR(10)'],
    ['prev_school_name', 'VARCHAR(255)'],
    ['prev_school_address', 'TEXT'],
    ['prev_school_phone', 'VARCHAR(50)'],
    ['prev_school_class', 'VARCHAR(50)'],
    ['prev_school_timings_from', 'TIME'],
    ['prev_school_timings_to', 'TIME'],

    // Mother/Guardian 1 Information
    ['mother_name', 'VARCHAR(255)'],
    ['mother_residence_address', 'TEXT'],
    ['mother_employer', 'VARCHAR(255)'],
    ['mother_employer_address', 'TEXT'],
    ['mother_work_phone', 'VARCHAR(50)'],
    ['mother_cell_phone', 'VARCHAR(50)'],
    ['mother_email', 'VARCHAR(255)'],
    ['mother_relationship', 'VARCHAR(100)'],
    ['mother_photo', 'VARCHAR(500)'],

    // Father/Guardian 2 Information
    ['father_name', 'VARCHAR(255)'],
    ['father_residence_address', 'TEXT'],
    ['father_employer', 'VARCHAR(255)'],
    ['father_employer_address', 'TEXT'],
    ['father_work_phone', 'VARCHAR(50)'],
    ['father_cell_phone', 'VARCHAR(50)'],
    ['father_email', 'VARCHAR(255)'],
    ['father_relationship', 'VARCHAR(100)'],
    ['father_photo', 'VARCHAR(500)'],

    // Guardian Information
    ['guardian_name', 'VARCHAR(255)'],
    ['guardian_phone', 'VARCHAR(50)'],
    ['guardian_relationship', 'VARCHAR(100)'],
    ['guardian1_name', 'VARCHAR(255)'],
    ['guardian2_name', 'VARCHAR(255)'],

    // Documents - Child Identity
    ['aadhar_front', 'VARCHAR(500)'],
    ['aadhar_back', 'VARCHAR(500)'],
    ['birth_certificate', 'VARCHAR(500)'],

    // Documents - Parent/Guardian Aadhaar
    ['father_aadhar_front', 'VARCHAR(500)'],
    ['father_aadhar_back', 'VARCHAR(500)'],
    ['mother_aadhar_front', 'VARCHAR(500)'],
    ['mother_aadhar_back', 'VARCHAR(500)'],
    ['guardian1_aadhar_front', 'VARCHAR(500)'],
    ['guardian1_aadhar_back', 'VARCHAR(500)'],
    ['guardian2_aadhar_front', 'VARCHAR(500)'],
    ['guardian2_aadhar_back', 'VARCHAR(500)'],
    ['address_proof', 'VARCHAR(500)'],

    // Health Information
    ['blood_group', 'VARCHAR(20)'],
    ['physician_name', 'VARCHAR(255)'],
    ['physician_phone', 'VARCHAR(50)'],
    ['physician_address', 'TEXT'],
    ['backup_physician_allowed', 'VARCHAR(10)'],
    ['allergies_reactions', 'TEXT'],
    ['past_illnesses', 'TEXT'],
    ['other_health_info', 'TEXT'],
    ['immunization_records', 'TEXT'],
    ['current_height', 'VARCHAR(20)'],
    ['current_weight', 'VARCHAR(20)'],

    // Child Preferences & Habits
    ['food_allergies', 'TEXT'],
    ['likes', 'TEXT'],
    ['dislikes', 'TEXT'],
    ['sleep_routines', 'TEXT'],
    ['playtime_activities', 'TEXT'],
    ['is_potty_trained', 'VARCHAR(10)'],
    ['redirection_techniques', 'TEXT'],
    ['additional_comments', 'TEXT'],

    // Meta
    ['status', "VARCHAR(20) DEFAULT 'pending'"],
    ['unique_id', 'VARCHAR(50) UNIQUE'],
    ['admission_date', 'DATE'],
    ['submission_date', 'DATE'],
    ['mother_signature', 'VARCHAR(255)'],
    ['mother_signature_date', 'DATE'],
    ['father_signature', 'VARCHAR(255)'],
    ['father_signature_date', 'DATE'],
];

export async function POST() {
    try {
        const db = getDb();

        // Create table if it doesn't exist at all
        await db.query(`
            CREATE TABLE IF NOT EXISTS admissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Get existing columns
        const [columns]: any = await db.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admissions'`
        );
        const existingColumns = new Set(columns.map((c: any) => c.COLUMN_NAME));

        // Add any missing columns
        const added: string[] = [];
        for (const [name, definition] of EXPECTED_COLUMNS) {
            if (!existingColumns.has(name)) {
                await db.query(`ALTER TABLE admissions ADD COLUMN ${name} ${definition}`);
                added.push(name);
            }
        }

        return NextResponse.json({
            message: added.length > 0
                ? `Setup complete. Added ${added.length} new column(s).`
                : 'Setup complete. Schema is already up to date.',
            added_columns: added
        }, { status: 200 });
    } catch (error) {
        console.error('[Setup DB] Error:', error);
        return NextResponse.json({ message: 'Database setup failed', error: (error as Error).message }, { status: 500 });
    }
}
