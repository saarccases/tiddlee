import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || id === 'undefined' || id === 'null') {
            return NextResponse.json({ message: 'Valid ID is required' }, { status: 400 });
        }

        const db = await getDb();
        const [rows] = await db.query('SELECT * FROM admissions WHERE id = ?', [id]);
        const admission = (rows as any[])[0];

        if (!admission) {
            console.warn(`[Get] Admission with ID ${id} not found in database.`);
            return NextResponse.json({ message: 'Admission not found' }, { status: 404 });
        }

        console.log(`[Get] Found admission record for ID ${id}:`, admission);

        // 1. Handle JSON parsing for programs_selected and immunization_records
        const jsonFields = ['programs_selected', 'immunization_records'];
        jsonFields.forEach(field => {
            if (admission[field]) {
                try {
                    if (typeof admission[field] === 'string') {
                        admission[field] = JSON.parse(admission[field]);
                    }
                } catch (e) {
                    console.error(`[Get] Error parsing ${field}:`, e);
                    admission[field] = field === 'programs_selected' ? [] : {};
                }
            } else {
                admission[field] = field === 'programs_selected' ? [] : {};
            }
        });

        // 2. Format DATE fields for HTML inputs (YYYY-MM-DD)
        const formatDate = (val: any) => {
            if (!val) return '';
            const d = new Date(val);
            if (isNaN(d.getTime())) return '';

            // Extract local components to avoid timezone shifts
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const dateFields = ['child_dob', 'admission_date', 'mother_signature_date', 'father_signature_date'];
        dateFields.forEach(field => {
            admission[field] = formatDate(admission[field]);
        });

        // 3. Format TIME fields for HTML inputs (HH:MM)
        const formatTime = (val: any) => {
            if (!val) return '';
            if (typeof val === 'string' && val.includes(':')) {
                return val.split(':').slice(0, 2).join(':');
            }
            return '';
        };

        const timeFields = ['prev_school_timings_from', 'prev_school_timings_to'];
        timeFields.forEach(field => {
            admission[field] = formatTime(admission[field]);
        });

        // 4. Ensure all null values are return as empty strings for React compatibility
        Object.keys(admission).forEach(key => {
            if (admission[key] === null) {
                admission[key] = '';
            }
        });

        return NextResponse.json(admission, { status: 200 });
    } catch (error) {
        console.error('[Get] Database error:', error);
        return NextResponse.json({ message: 'Error fetching admission', error: (error as Error).message }, { status: 500 });
    }
}
