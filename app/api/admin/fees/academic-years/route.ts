import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        const [rows]: any = await db.query('SELECT * FROM academic_years ORDER BY start_date DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { year_label, start_date, end_date } = await request.json();
        if (!year_label || !start_date || !end_date)
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const db = await getDb();
        // Close all other active years when creating a new active one
        await db.query(`UPDATE academic_years SET status = 'closed' WHERE status = 'active'`);
        const [result]: any = await db.query(
            `INSERT INTO academic_years (year_label, start_date, end_date, status) VALUES (?, ?, ?, 'active')`,
            [year_label, start_date, end_date]
        );
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status, year_label, start_date, end_date } = await request.json();
        const db = await getDb();
        if (status === 'active') {
            await db.query(`UPDATE academic_years SET status = 'closed' WHERE status = 'active'`);
        }
        await db.query(
            `UPDATE academic_years SET status = ?, year_label = COALESCE(?, year_label),
             start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date) WHERE id = ?`,
            [status || 'active', year_label || null, start_date || null, end_date || null, id]
        );
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
