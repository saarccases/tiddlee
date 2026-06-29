import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { student_fee_id, waiver_type, apply_on, apply_on_item, amount, percentage, reason, approved_by } = await request.json();
        if (!student_fee_id || !waiver_type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const db = await getDb();

        // Calculate actual waiver amount if percentage given
        let finalAmount = parseFloat(amount) || 0;
        if (percentage && parseFloat(percentage) > 0 && !finalAmount) {
            const [sf]: any = await db.query('SELECT total_amount FROM student_fees WHERE id = ?', [student_fee_id]);
            if (sf.length) finalAmount = (parseFloat(sf[0].total_amount) * parseFloat(percentage)) / 100;
        }

        const [result]: any = await db.query(`
            INSERT INTO fee_waivers (student_fee_id, waiver_type, apply_on, apply_on_item, amount, percentage, reason, approved_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [student_fee_id, waiver_type, apply_on || 'total', apply_on_item || null,
            finalAmount, parseFloat(percentage) || 0, reason || null, approved_by || null]);

        // Adjust total_due
        await db.query(
            'UPDATE student_fees SET total_due = GREATEST(0, total_due - ?) WHERE id = ?',
            [finalAmount, student_fee_id]
        );

        return NextResponse.json({ success: true, id: result.insertId, amount: finalAmount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const student_fee_id = searchParams.get('student_fee_id');
        if (!id || !student_fee_id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

        const db = await getDb();
        const [waiver]: any = await db.query('SELECT amount FROM fee_waivers WHERE id = ?', [id]);
        if (!waiver.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await db.query('DELETE FROM fee_waivers WHERE id = ?', [id]);
        // Restore the waiver amount to total_due
        await db.query(
            'UPDATE student_fees SET total_due = total_due + ? WHERE id = ?',
            [waiver[0].amount, student_fee_id]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
