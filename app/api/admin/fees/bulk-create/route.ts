import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MONTHS = [
    { no: 1, name: 'April' }, { no: 2, name: 'May' }, { no: 3, name: 'June' },
    { no: 4, name: 'July' }, { no: 5, name: 'August' }, { no: 6, name: 'September' },
    { no: 7, name: 'October' }, { no: 8, name: 'November' }, { no: 9, name: 'December' },
    { no: 10, name: 'January' }, { no: 11, name: 'February' }, { no: 12, name: 'March' },
];

function matchTemplate(templates: any[], programStr: string): any | null {
    if (!programStr) return null;
    const name = programStr.toLowerCase().trim();
    for (const t of templates) {
        try {
            const keywords: string[] = JSON.parse(t.match_keywords || '[]');
            if (keywords.some(k => name.includes(k.toLowerCase().trim()) || k.toLowerCase().trim().includes(name))) return t;
        } catch {}
    }
    return null;
}

// GET — preview: list all enrolled students with their matched template (dry run)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('year_id');
        if (!yearId) return NextResponse.json({ error: 'year_id required' }, { status: 400 });

        const db = await getDb();

        const [templates]: any = await db.query('SELECT * FROM fee_templates WHERE is_active = 1');
        const [enrollments]: any = await db.query(`
            SELECT e.id, e.child_name, e.unique_id, e.program_type,
                   e.program_name, e.slot, e.hours_opted,
                   sf.id AS existing_fee_id
            FROM enrollments e
            LEFT JOIN student_fees sf ON sf.enrollment_id = e.id AND sf.academic_year_id = ?
            ORDER BY e.program_type, e.child_name
        `, [yearId]);

        const preview = enrollments.map((e: any) => {
            const programStr = e.program_name || e.slot || e.hours_opted || e.program_type || '';
            const template = matchTemplate(templates, programStr);
            return {
                enrollment_id: e.id,
                child_name: e.child_name,
                unique_id: e.unique_id,
                program_type: e.program_type,
                program_str: programStr,
                template_id: template?.id || null,
                template_name: template?.template_name || null,
                matched: !!template,
                already_exists: !!e.existing_fee_id,
                existing_fee_id: e.existing_fee_id || null,
            };
        });

        return NextResponse.json({
            total: preview.length,
            matched: preview.filter((p: any) => p.matched && !p.already_exists).length,
            unmatched: preview.filter((p: any) => !p.matched && !p.already_exists).length,
            already_exists: preview.filter((p: any) => p.already_exists).length,
            students: preview,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — actually create fee plans for all matched students
export async function POST(request: Request) {
    try {
        const { year_id, skip_unmatched } = await request.json();
        if (!year_id) return NextResponse.json({ error: 'year_id required' }, { status: 400 });

        const db = await getDb();

        const [templates]: any = await db.query('SELECT * FROM fee_templates WHERE is_active = 1');
        const [enrollments]: any = await db.query(`
            SELECT e.id, e.child_name, e.unique_id, e.program_type,
                   e.program_name, e.slot, e.hours_opted,
                   sf.id AS existing_fee_id
            FROM enrollments e
            LEFT JOIN student_fees sf ON sf.enrollment_id = e.id AND sf.academic_year_id = ?
        `, [year_id]);

        const created: any[] = [];
        const skipped: any[] = [];
        const errors: any[] = [];

        for (const enr of enrollments) {
            if (enr.existing_fee_id) {
                skipped.push({ child_name: enr.child_name, reason: 'Already exists' });
                continue;
            }

            const programStr = enr.program_name || enr.slot || enr.hours_opted || enr.program_type || '';
            const t = matchTemplate(templates, programStr);

            if (!t && skip_unmatched) {
                skipped.push({ child_name: enr.child_name, reason: 'No template matched' });
                continue;
            }

            try {
                const programType = t?.program_type || enr.program_type || 'preschool';
                const schoolFees = parseFloat(t?.school_fees || 0);
                const monthlyFee = parseFloat(t?.monthly_fee || 0);
                const totalAmount = programType === 'preschool' ? schoolFees : monthlyFee * 12;

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
                    enr.id, year_id, programType,
                    t?.registration_amount || 0, t?.registration_status || 'Unpaid',
                    t?.security_deposit_amount || 0, t?.security_deposit_status || 'Unpaid',
                    t?.admission_form_fee || 0, t?.admission_form_status || 'Unpaid',
                    schoolFees, t?.num_installments || 1,
                    monthlyFee, t?.hours_opted || enr.hours_opted || null,
                    totalAmount, totalAmount,
                ]);

                const feeId = result.insertId;

                if (programType === 'preschool') {
                    const count = parseInt(t?.num_installments || 1);
                    const instAmt = count > 0 ? Math.round(schoolFees / count) : schoolFees;
                    for (let i = 1; i <= count; i++) {
                        await db.query(
                            `INSERT INTO fee_installments (student_fee_id, installment_no, amount, status) VALUES (?,?,?,'Unpaid')`,
                            [feeId, i, instAmt]
                        );
                    }
                }

                if (programType === 'daycare') {
                    for (const m of MONTHS) {
                        await db.query(
                            `INSERT INTO fee_monthly (student_fee_id, month_number, month_name, amount_due, amount_paid) VALUES (?,?,?,?,0)`,
                            [feeId, m.no, m.name, monthlyFee]
                        );
                    }
                }

                created.push({ child_name: enr.child_name, fee_id: feeId, template: t?.template_name || 'No template' });
            } catch (e: any) {
                errors.push({ child_name: enr.child_name, error: e.message });
            }
        }

        return NextResponse.json({ success: true, created: created.length, skipped: skipped.length, errors: errors.length, details: { created, skipped, errors } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
