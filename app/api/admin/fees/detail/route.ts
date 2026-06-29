import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const db = await getDb();

        const [fees]: any = await db.query(`
            SELECT sf.*, e.child_name, e.unique_id, e.program_name, e.slot, e.hours_opted,
                   e.mother_phone, e.father_phone, e.gender, e.dob,
                   ay.year_label, ay.start_date, ay.end_date
            FROM student_fees sf
            JOIN enrollments e ON e.id = sf.enrollment_id
            JOIN academic_years ay ON ay.id = sf.academic_year_id
            WHERE sf.id = ?
        `, [id]);

        if (!fees.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const fee = fees[0];

        const [installments]: any = await db.query(
            'SELECT * FROM fee_installments WHERE student_fee_id = ? ORDER BY installment_no',
            [id]
        );
        const [monthly]: any = await db.query(
            'SELECT * FROM fee_monthly WHERE student_fee_id = ? ORDER BY month_number',
            [id]
        );
        const [waivers]: any = await db.query(
            'SELECT * FROM fee_waivers WHERE student_fee_id = ? ORDER BY created_at DESC',
            [id]
        );

        return NextResponse.json({ ...fee, installments, monthly, waivers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, fee, installments, monthly } = body;
        const db = await getDb();

        if (fee && Object.keys(fee).length > 0) {
            const fields = Object.keys(fee).map(k => `${k} = ?`).join(', ');
            await db.query(`UPDATE student_fees SET ${fields} WHERE id = ?`, [...Object.values(fee), id]);
        }

        if (Array.isArray(installments)) {
            for (const inst of installments) {
                await db.query(
                    `UPDATE fee_installments SET amount = ?, status = ?, due_date = ?,
                     part_payment = ?, difference = ?, paid_date = ? WHERE id = ?`,
                    [inst.amount, inst.status, inst.due_date || null,
                     inst.part_payment || 0, inst.difference || 0, inst.paid_date || null, inst.id]
                );
            }
        }

        if (Array.isArray(monthly)) {
            for (const m of monthly) {
                await db.query(
                    `UPDATE fee_monthly SET amount_paid = ?, extra_hours = ?, extra_amount = ?, paid_date = ? WHERE id = ?`,
                    [m.amount_paid || 0, m.extra_hours || 0, m.extra_amount || 0, m.paid_date || null, m.id]
                );
            }
        }

        // Recalculate totals
        const [inst]: any = await db.query(
            `SELECT COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE part_payment END), 0) as paid
             FROM fee_installments WHERE student_fee_id = ?`, [id]
        );
        const [mon]: any = await db.query(
            `SELECT COALESCE(SUM(amount_paid), 0) as paid FROM fee_monthly WHERE student_fee_id = ?`, [id]
        );
        const [sf]: any = await db.query('SELECT * FROM student_fees WHERE id = ?', [id]);
        if (sf.length) {
            const s = sf[0];
            const onetime =
                (s.registration_status === 'Paid' ? parseFloat(s.registration_amount) : 0) +
                (s.security_deposit_status === 'Paid' ? parseFloat(s.security_deposit_amount) : 0) +
                (s.admission_form_status === 'Paid' ? parseFloat(s.admission_form_fee) : 0);
            const programPaid = parseFloat(inst[0].paid) + parseFloat(mon[0].paid);
            const totalPaid = onetime + programPaid;
            const totalDue = parseFloat(s.total_amount) - totalPaid;
            await db.query(
                'UPDATE student_fees SET total_paid = ?, total_due = ? WHERE id = ?',
                [totalPaid, totalDue < 0 ? 0 : totalDue, id]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
