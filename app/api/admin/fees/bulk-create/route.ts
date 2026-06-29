import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { matchTemplate } from '@/lib/fee-utils';

export const dynamic = 'force-dynamic';

const MONTHS = [
    { no: 1, name: 'April' }, { no: 2, name: 'May' }, { no: 3, name: 'June' },
    { no: 4, name: 'July' }, { no: 5, name: 'August' }, { no: 6, name: 'September' },
    { no: 7, name: 'October' }, { no: 8, name: 'November' }, { no: 9, name: 'December' },
    { no: 10, name: 'January' }, { no: 11, name: 'February' }, { no: 12, name: 'March' },
];

async function ensureTablesExist(db: any) {
    await db.query(`CREATE TABLE IF NOT EXISTS academic_years (id INT AUTO_INCREMENT PRIMARY KEY, year_label VARCHAR(20) NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, status ENUM('active','closed') DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await db.query(`CREATE TABLE IF NOT EXISTS fee_templates (id INT AUTO_INCREMENT PRIMARY KEY, template_name VARCHAR(100) NOT NULL, program_type ENUM('preschool','daycare') NOT NULL, school_fees DECIMAL(10,2) DEFAULT 0, registration_amount DECIMAL(10,2) DEFAULT 0, registration_status VARCHAR(50) DEFAULT 'Unpaid', security_deposit_amount DECIMAL(10,2) DEFAULT 0, security_deposit_status VARCHAR(50) DEFAULT 'Unpaid', admission_form_fee DECIMAL(10,2) DEFAULT 0, admission_form_status VARCHAR(50) DEFAULT 'Unpaid', num_installments INT DEFAULT 1, monthly_fee DECIMAL(10,2) DEFAULT 0, hours_opted VARCHAR(50), match_keywords TEXT, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);

    // Check if student_fees has the new schema (enrollment_id column)
    // Old schema used different columns — drop dependent tables and recreate if needed
    let needRebuild = false;
    try {
        await db.query('SELECT enrollment_id FROM student_fees LIMIT 0');
    } catch {
        needRebuild = true;
    }

    if (needRebuild) {
        // Drop old dependent tables first (CASCADE won't work on FK children)
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DROP TABLE IF EXISTS fee_waivers');
        await db.query('DROP TABLE IF EXISTS fee_installments');
        await db.query('DROP TABLE IF EXISTS fee_monthly');
        await db.query('DROP TABLE IF EXISTS student_fees');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    await db.query(`CREATE TABLE IF NOT EXISTS student_fees (id INT AUTO_INCREMENT PRIMARY KEY, enrollment_id INT NOT NULL, academic_year_id INT NOT NULL, program_type ENUM('preschool','daycare') NOT NULL, registration_amount DECIMAL(10,2) DEFAULT 0, registration_status VARCHAR(50) DEFAULT 'Unpaid', security_deposit_amount DECIMAL(10,2) DEFAULT 0, security_deposit_status VARCHAR(50) DEFAULT 'Unpaid', admission_form_fee DECIMAL(10,2) DEFAULT 0, admission_form_status VARCHAR(50) DEFAULT 'Unpaid', school_fees DECIMAL(10,2) DEFAULT 0, num_installments INT DEFAULT 1, monthly_fee DECIMAL(10,2) DEFAULT 0, hours_opted VARCHAR(50), extra_hours DECIMAL(5,2) DEFAULT 0, extra_hours_amount DECIMAL(10,2) DEFAULT 0, total_amount DECIMAL(10,2) DEFAULT 0, total_paid DECIMAL(10,2) DEFAULT 0, total_due DECIMAL(10,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE, FOREIGN KEY (academic_year_id) REFERENCES academic_years(id))`);
    await db.query(`CREATE TABLE IF NOT EXISTS fee_installments (id INT AUTO_INCREMENT PRIMARY KEY, student_fee_id INT NOT NULL, installment_no INT NOT NULL, amount DECIMAL(10,2) DEFAULT 0, due_date DATE, status VARCHAR(50) DEFAULT 'Unpaid', part_payment DECIMAL(10,2) DEFAULT 0, difference DECIMAL(10,2) DEFAULT 0, paid_date DATE, FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE)`);
    await db.query(`CREATE TABLE IF NOT EXISTS fee_monthly (id INT AUTO_INCREMENT PRIMARY KEY, student_fee_id INT NOT NULL, month_number INT NOT NULL, month_name VARCHAR(20) NOT NULL, amount_due DECIMAL(10,2) DEFAULT 0, amount_paid DECIMAL(10,2) DEFAULT 0, extra_hours DECIMAL(5,2) DEFAULT 0, extra_amount DECIMAL(10,2) DEFAULT 0, paid_date DATE, FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE)`);
    await db.query(`CREATE TABLE IF NOT EXISTS fee_waivers (id INT AUTO_INCREMENT PRIMARY KEY, student_fee_id INT NOT NULL, waiver_type VARCHAR(50) NOT NULL, apply_on VARCHAR(50) DEFAULT 'total', apply_on_item VARCHAR(50), amount DECIMAL(10,2) DEFAULT 0, percentage DECIMAL(5,2) DEFAULT 0, reason TEXT, approved_by VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE)`);

    // Seed active year if missing
    const [yr]: any = await db.query('SELECT id FROM academic_years WHERE status = ? LIMIT 1', ['active']);
    if (!yr.length) await db.query(`INSERT INTO academic_years (year_label, start_date, end_date, status) VALUES ('2026-27','2026-04-01','2027-03-31','active')`);
}

// GET — preview: list all enrolled students with their matched template (dry run)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('year_id');
        if (!yearId) return NextResponse.json({ error: 'year_id required' }, { status: 400 });

        const db = await getDb();
        await ensureTablesExist(db);

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
        await ensureTablesExist(db);

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
