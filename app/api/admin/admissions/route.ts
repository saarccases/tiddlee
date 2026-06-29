import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const db = await getDb();

        const params: any[] = [];
        let whereClause = '';
        if (status && status !== 'all') {
            whereClause = ' WHERE a.status = ?';
            params.push(status);
        }

        let rows: any[];
        try {
            // Try with enrollment join (requires admission_id column — added by Setup DB)
            const [result]: any = await db.query(`
                SELECT a.*, e.id AS enrollment_id
                FROM admissions a
                LEFT JOIN enrollments e ON e.admission_id = a.id
                ${whereClause}
                ORDER BY a.created_at DESC
            `, params);
            rows = result;
        } catch {
            // Fallback: admission_id column not yet added — run Setup DB in Enrollment page
            const [result]: any = await db.query(
                `SELECT * FROM admissions${whereClause.replace('a.status', 'status')} ORDER BY created_at DESC`,
                params
            );
            rows = result.map((r: any) => ({ ...r, enrollment_id: null }));
        }

        return NextResponse.json(rows.map((row: any) => ({
            ...row,
            programs_selected: row.programs_selected ? JSON.parse(row.programs_selected) : [],
            immunization_records: row.immunization_records ? (typeof row.immunization_records === 'string' ? JSON.parse(row.immunization_records) : row.immunization_records) : {}
        })));
    } catch (error) {
        console.error('Admissions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const db = await getDb();
        await db.query("UPDATE admissions SET status = ? WHERE id = ?", [status, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admission update error:', error);
        return NextResponse.json({ error: 'Failed to update admission' }, { status: 500 });
    }
}
