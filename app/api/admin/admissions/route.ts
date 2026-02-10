import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const db = await getDb();

        let query = "SELECT * FROM admissions";
        const params = [];

        if (status && status !== 'all') {
            query += " WHERE status = ?";
            params.push(status);
        }

        query += " ORDER BY created_at DESC";

        const [rows]: any = await db.query(query, params);

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
