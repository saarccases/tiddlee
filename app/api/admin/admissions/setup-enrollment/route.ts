import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { admission_id, program_type } = await request.json();
        if (!admission_id || !program_type) {
            return NextResponse.json({ error: 'Missing admission_id or program_type' }, { status: 400 });
        }

        const db = await getDb();

        // Check if enrollment already exists for this admission
        const [existing]: any = await db.query(
            'SELECT id FROM enrollments WHERE admission_id = ?',
            [admission_id]
        );
        if (existing.length > 0) {
            return NextResponse.json({ success: true, enrollment_id: existing[0].id, existing: true });
        }

        // Fetch the admission record
        const [admissions]: any = await db.query('SELECT * FROM admissions WHERE id = ?', [admission_id]);
        if (!admissions.length) {
            return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
        }
        const a = admissions[0];

        let programs: string[] = [];
        try { programs = JSON.parse(a.programs_selected || '[]'); } catch {}
        const programName = programs.length > 0 ? programs.join(', ') : '';

        // Create enrollment record from admission data
        const [result]: any = await db.query(`
            INSERT INTO enrollments (
                admission_id, unique_id, child_name, program_type, program_name,
                new_or_existing, enrollment_date, gender, dob, age,
                mother_email, father_email, mother_phone, father_phone,
                address, blood_group, allergy, status
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            admission_id,
            a.unique_id || null,
            a.child_name,
            program_type,
            programName,
            'New',
            a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            a.child_gender || null,
            a.child_dob ? new Date(a.child_dob).toISOString().split('T')[0] : null,
            a.child_age || null,
            a.mother_email || null,
            a.father_email || null,
            a.mother_cell_phone || null,
            a.father_cell_phone || null,
            a.child_residence_address || a.mother_residence_address || null,
            a.blood_group || null,
            a.food_allergies || a.allergies_reactions || null,
            'active',
        ]);

        const enrollmentId = result.insertId;

        // Create empty fee record based on program type
        if (program_type === 'preschool') {
            await db.query(`
                INSERT INTO preschool_fees (enrollment_id, num_installments)
                VALUES (?, 1)
            `, [enrollmentId]);
        } else {
            await db.query(`
                INSERT INTO daycare_fees (enrollment_id)
                VALUES (?)
            `, [enrollmentId]);
        }

        return NextResponse.json({ success: true, enrollment_id: enrollmentId, existing: false });
    } catch (error: any) {
        console.error('Setup enrollment error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
