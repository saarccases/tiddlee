import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[Submit] Received payload:', body);

        const { id } = body;
        const db = await getDb();

        // List of all possible fields in the table
        const allFields = [
            'child_name', 'child_nickname', 'child_dob', 'child_age', 'child_gender', 'child_photo', 'child_residence_address',
            'emergency_contact1_name', 'emergency_contact1_phone', 'emergency_contact1_relation',
            'emergency_contact2_name', 'emergency_contact2_phone', 'emergency_contact2_relation',
            'programs_selected', 'languages_spoken', 'media_consent',
            'child_attended_school', 'prev_school_name', 'prev_school_address', 'prev_school_phone', 'prev_school_class', 'prev_school_timings_from', 'prev_school_timings_to',
            'mother_name', 'mother_residence_address', 'mother_employer', 'mother_employer_address', 'mother_work_phone', 'mother_cell_phone', 'mother_email', 'mother_relationship', 'mother_photo',
            'father_name', 'father_employer', 'father_employer_address', 'father_work_phone', 'father_cell_phone', 'father_email', 'father_relationship', 'father_photo',
            'unique_id', 'admission_date', 'mother_signature', 'mother_signature_date', 'father_signature', 'father_signature_date',
            'blood_group', 'physician_name', 'physician_phone', 'physician_address', 'backup_physician_allowed', 'allergies_reactions', 'past_illnesses', 'other_health_info',
            'immunization_records', 'current_height', 'current_weight',
            'food_allergies', 'likes', 'dislikes', 'sleep_routines', 'playtime_activities', 'is_potty_trained', 'redirection_techniques', 'additional_comments'
        ];

        // 1. If we have an ID, we perform a dynamic UPDATE
        if (id && id !== 'undefined' && id !== 'null') {
            const updateFields: string[] = [];
            const values: any[] = [];


            allFields.forEach(field => {
                if (Object.prototype.hasOwnProperty.call(body, field)) {
                    let val = body[field];

                    // Special handling for specific types
                    if ((field === 'programs_selected' || field === 'immunization_records') && (Array.isArray(val) || typeof val === 'object' && val !== null)) {
                        val = JSON.stringify(val);
                    } else if (val === '') {
                        val = null; // Save empty as null for consistency, or keep as '' if preferred
                    }

                    updateFields.push(`${field} = ?`);
                    values.push(val);
                }
            });

            // Always update submission_date to today's date
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            updateFields.push('submission_date = ?');
            values.push(today);

            if (updateFields.length > 0) {
                const query = `UPDATE admissions SET ${updateFields.join(', ')} WHERE id = ?`;
                values.push(id);
                console.log('[Submit] Running UPDATE query:', query);
                console.log('[Submit] Submission date set to:', today);
                await db.query(query, values);
            }

            return NextResponse.json({ message: 'Admission updated successfully', id, submission_date: today }, { status: 200 });
        }

        // 2. If NO ID, we perform an INSERT
        console.log('[Submit] No ID found, performing INSERT');
        const fields: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];

        allFields.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                fields.push(key);
                placeholders.push('?');
                let val = body[key];
                if ((key === 'programs_selected' || key === 'immunization_records') && (Array.isArray(val) || typeof val === 'object' && val !== null)) {
                    val = JSON.stringify(val);
                } else if (val === '') {
                    val = null;
                }
                values.push(val);
            }
        });

        // Always add submission_date for new admissions
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        fields.push('submission_date');
        placeholders.push('?');
        values.push(today);

        // Auto-set admission_date to today if not already provided
        if (!body.admission_date || body.admission_date === '') {
            fields.push('admission_date');
            placeholders.push('?');
            values.push(today);
            console.log('[Submit] Auto-setting admission_date to:', today);
        }

        const query = `INSERT INTO admissions (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        const [result] = await db.query<ResultSetHeader>(query, values);

        console.log('[Submit] INSERT successful, record ID:', result.insertId);
        console.log('[Submit] Submission date set to:', today);
        return NextResponse.json({ message: 'Admission saved successfully', id: result.insertId, submission_date: today, admission_date: body.admission_date || today }, { status: 200 });

    } catch (error) {
        console.error('[Submit] Error:', error);
        return NextResponse.json({ message: 'Error saving admission', error: (error as Error).message }, { status: 500 });
    }
}
