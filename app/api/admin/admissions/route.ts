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

async function ensureUniqueIdColumn(db: any) {
    try {
        await db.query('ALTER TABLE admissions ADD COLUMN unique_id VARCHAR(50) NULL AFTER id');
    } catch (e: any) {
        if (!e.message?.includes('Duplicate column')) throw e;
    }
}

async function generateNextUniqueId(db: any): Promise<string> {
    const year = '2026-27';

    // Get highest number used across both admissions and enrollments
    const [[admMax]]: any = await db.query(
        `SELECT MAX(CAST(SUBSTRING_INDEX(unique_id, '/', -1) AS UNSIGNED)) AS n
         FROM admissions WHERE unique_id LIKE ?`,
        [`TID/${year}/%`]
    );
    const [[enrMax]]: any = await db.query(
        `SELECT MAX(CAST(SUBSTRING_INDEX(unique_id, '/', -1) AS UNSIGNED)) AS n
         FROM enrollments WHERE unique_id LIKE ?`,
        [`TID/${year}/%`]
    );

    const next = Math.max(admMax?.n || 0, enrMax?.n || 0) + 1;
    return `TID/${year}/${next}`;
}

export async function PATCH(request: Request) {
    try {
        const { id, status, ...rest } = await request.json();
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const db = await getDb();
        await ensureUniqueIdColumn(db);

        let uniqueId: string | null = null;

        // Auto-assign unique_id when approving (only if not already assigned)
        if (status === 'approved') {
            const [[existing]]: any = await db.query(
                'SELECT unique_id FROM admissions WHERE id = ?', [id]
            );
            if (!existing?.unique_id) {
                uniqueId = await generateNextUniqueId(db);
                await db.query(
                    'UPDATE admissions SET status = ?, unique_id = ? WHERE id = ?',
                    [status, uniqueId, id]
                );
            } else {
                await db.query('UPDATE admissions SET status = ? WHERE id = ?', [status, id]);
                uniqueId = existing.unique_id;
            }
        } else if (status) {
            await db.query('UPDATE admissions SET status = ? WHERE id = ?', [status, id]);
        }

        // Allow updating other fields too (e.g. unique_id manual override)
        const extraFields = Object.keys(rest).filter(k => k !== 'id');
        if (extraFields.length > 0) {
            const setClauses = extraFields.map(k => `${k} = ?`).join(', ');
            await db.query(
                `UPDATE admissions SET ${setClauses} WHERE id = ?`,
                [...extraFields.map(k => rest[k]), id]
            );
        }

        return NextResponse.json({ success: true, unique_id: uniqueId });
    } catch (error) {
        console.error('Admission update error:', error);
        return NextResponse.json({ error: 'Failed to update admission' }, { status: 500 });
    }
}
