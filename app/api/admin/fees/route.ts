import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MONTHS = [
    { no: 1, name: 'April' }, { no: 2, name: 'May' }, { no: 3, name: 'June' },
    { no: 4, name: 'July' }, { no: 5, name: 'August' }, { no: 6, name: 'September' },
    { no: 7, name: 'October' }, { no: 8, name: 'November' }, { no: 9, name: 'December' },
    { no: 10, name: 'January' }, { no: 11, name: 'February' }, { no: 12, name: 'March' },
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('year_id');
        const type = searchParams.get('type') || 'all';
        const db = await getDb();

        let query = `
            SELECT sf.*, e.child_name, e.unique_id, e.program_name, e.slot, e.hours_opted,
                   ay.year_label,
                   COALESCE((SELECT SUM(w.amount) FROM fee_waivers w WHERE w.student_fee_id = sf.id), 0) AS total_waiver
            FROM student_fees sf
            JOIN enrollments e ON e.id = sf.enrollment_id
            JOIN academic_years ay ON ay.id = sf.academic_year_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (yearId) { query += ' AND sf.academic_year_id = ?'; params.push(yearId); }
        if (type !== 'all') { query += ' AND sf.program_type = ?'; params.push(type); }
        query += ' ORDER BY e.child_name ASC';

        const [rows]: any = await db.query(query, params);
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            enrollment_id, academic_year_id, program_type,
            registration_amount, registration_status,
            security_deposit_amount, security_deposit_status,
            admission_form_fee, admission_form_status,
            school_fees, num_installments, installments,
            monthly_fee, hours_opted, total_amount,
        } = body;

        const db = await getDb();

        const [existing]: any = await db.query(
            'SELECT id FROM student_fees WHERE enrollment_id = ? AND academic_year_id = ? AND program_type = ?',
            [enrollment_id, academic_year_id, program_type]
        );
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Fee plan already exists for this student and year' }, { status: 409 });
        }

        const [result]: any = await db.query(`
            INSERT INTO student_fees (
                enrollment_id, academic_year_id, program_type,
                registration_amount, registration_status,
                security_deposit_amount, security_deposit_status,
                admission_form_fee, admission_form_status,
                school_fees, num_installments,
                monthly_fee, hours_opted,
                total_amount, total_paid, total_due
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?)
        `, [
            enrollment_id, academic_year_id, program_type,
            registration_amount || 0, registration_status || 'Unpaid',
            security_deposit_amount || 0, security_deposit_status || 'Unpaid',
            admission_form_fee || 0, admission_form_status || 'Unpaid',
            school_fees || 0, num_installments || 1,
            monthly_fee || 0, hours_opted || null,
            total_amount || 0, total_amount || 0,
        ]);

        const feeId = result.insertId;

        if (program_type === 'preschool' && Array.isArray(installments)) {
            for (const inst of installments) {
                await db.query(
                    `INSERT INTO fee_installments (student_fee_id, installment_no, amount, due_date, status)
                     VALUES (?, ?, ?, ?, 'Unpaid')`,
                    [feeId, inst.no, inst.amount || 0, inst.due_date || null]
                );
            }
        }

        if (program_type === 'daycare') {
            for (const m of MONTHS) {
                await db.query(
                    `INSERT INTO fee_monthly (student_fee_id, month_number, month_name, amount_due, amount_paid)
                     VALUES (?, ?, ?, ?, 0)`,
                    [feeId, m.no, m.name, monthly_fee || 0]
                );
            }
        }

        return NextResponse.json({ success: true, id: feeId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
