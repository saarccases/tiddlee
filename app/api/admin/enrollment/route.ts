import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const id = searchParams.get('id');
        const db = await getDb();

        // Single enrollment with fees
        if (id) {
            const [rows]: any = await db.query('SELECT * FROM enrollments WHERE id = ?', [id]);
            if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            const enrollment = rows[0];

            if (enrollment.program_type === 'preschool') {
                const [fees]: any = await db.query('SELECT * FROM preschool_fees WHERE enrollment_id = ?', [id]);
                return NextResponse.json({ ...enrollment, fees: fees[0] || null });
            } else {
                const [fees]: any = await db.query('SELECT * FROM daycare_fees WHERE enrollment_id = ?', [id]);
                return NextResponse.json({ ...enrollment, fees: fees[0] || null });
            }
        }

        // List all
        let query = 'SELECT e.*, ';
        if (type === 'preschool') {
            query += 'pf.fees_due, pf.total_amount, pf.school_fees, pf.num_installments FROM enrollments e LEFT JOIN preschool_fees pf ON e.id = pf.enrollment_id WHERE e.program_type = "preschool"';
        } else if (type === 'daycare') {
            query += 'df.fees_per_month, df.total_amount_payable FROM enrollments e LEFT JOIN daycare_fees df ON e.id = df.enrollment_id WHERE e.program_type = "daycare"';
        } else {
            query += 'NULL as fees_due FROM enrollments e WHERE 1=1';
        }
        query += ' ORDER BY e.created_at DESC';

        const [rows]: any = await db.query(query);
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, type, enrollment, fees } = body;
        const db = await getDb();

        if (enrollment) {
            const fields = Object.keys(enrollment).map(k => `${k} = ?`).join(', ');
            await db.query(`UPDATE enrollments SET ${fields} WHERE id = ?`, [...Object.values(enrollment), id]);
        }

        if (fees) {
            if (type === 'preschool') {
                const fields = Object.keys(fees).map(k => `${k} = ?`).join(', ');
                await db.query(`UPDATE preschool_fees SET ${fields} WHERE enrollment_id = ?`, [...Object.values(fees), id]);
            } else if (type === 'daycare') {
                const fields = Object.keys(fees).map(k => `${k} = ?`).join(', ');
                await db.query(`UPDATE daycare_fees SET ${fields} WHERE enrollment_id = ?`, [...Object.values(fees), id]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { enrollment, fees } = body;
        const db = await getDb();

        const fields = Object.keys(enrollment).join(', ');
        const placeholders = Object.keys(enrollment).map(() => '?').join(', ');
        const [result]: any = await db.query(
            `INSERT INTO enrollments (${fields}) VALUES (${placeholders})`,
            Object.values(enrollment)
        );
        const enrollmentId = result.insertId;

        if (fees) {
            const feeFields = Object.keys(fees).join(', ');
            const feePlaceholders = Object.keys(fees).map(() => '?').join(', ');
            const table = enrollment.program_type === 'preschool' ? 'preschool_fees' : 'daycare_fees';
            await db.query(
                `INSERT INTO ${table} (enrollment_id, ${feeFields}) VALUES (?, ${feePlaceholders})`,
                [enrollmentId, ...Object.values(fees)]
            );
        }

        return NextResponse.json({ success: true, id: enrollmentId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
