import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        const [rows]: any = await db.query(
            'SELECT * FROM fee_templates ORDER BY program_type, template_name'
        );
        return NextResponse.json(rows.map((r: any) => ({
            ...r,
            match_keywords: (() => { try { return JSON.parse(r.match_keywords || '[]'); } catch { return []; } })(),
        })));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            template_name, program_type,
            school_fees, registration_amount, registration_status,
            security_deposit_amount, security_deposit_status,
            admission_form_fee, admission_form_status,
            num_installments, monthly_fee, hours_opted,
            match_keywords,
        } = body;

        if (!template_name || !program_type)
            return NextResponse.json({ error: 'template_name and program_type required' }, { status: 400 });

        const db = await getDb();
        const keywords = Array.isArray(match_keywords) ? JSON.stringify(match_keywords) : match_keywords || '[]';

        const [result]: any = await db.query(`
            INSERT INTO fee_templates (
                template_name, program_type,
                school_fees, registration_amount, registration_status,
                security_deposit_amount, security_deposit_status,
                admission_form_fee, admission_form_status,
                num_installments, monthly_fee, hours_opted, match_keywords
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            template_name, program_type,
            school_fees || 0, registration_amount || 0, registration_status || 'Unpaid',
            security_deposit_amount || 0, security_deposit_status || 'Unpaid',
            admission_form_fee || 0, admission_form_status || 'Unpaid',
            num_installments || 1, monthly_fee || 0, hours_opted || null, keywords,
        ]);

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...fields } = body;
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        if (Array.isArray(fields.match_keywords)) {
            fields.match_keywords = JSON.stringify(fields.match_keywords);
        }

        const db = await getDb();
        const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        await db.query(
            `UPDATE fee_templates SET ${setClauses} WHERE id = ?`,
            [...Object.values(fields), id]
        );
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const db = await getDb();
        await db.query('DELETE FROM fee_templates WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
