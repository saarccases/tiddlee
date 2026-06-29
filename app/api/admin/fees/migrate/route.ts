import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();

        await db.query(`
            CREATE TABLE IF NOT EXISTS academic_years (
                id INT AUTO_INCREMENT PRIMARY KEY,
                year_label VARCHAR(20) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // If student_fees has old schema (no enrollment_id), drop and recreate
        let sfNeedsRebuild = false;
        try { await db.query('SELECT enrollment_id FROM student_fees LIMIT 0'); }
        catch { sfNeedsRebuild = true; }
        if (sfNeedsRebuild) {
            await db.query('SET FOREIGN_KEY_CHECKS = 0');
            await db.query('DROP TABLE IF EXISTS fee_waivers');
            await db.query('DROP TABLE IF EXISTS fee_installments');
            await db.query('DROP TABLE IF EXISTS fee_monthly');
            await db.query('DROP TABLE IF EXISTS student_fees');
            await db.query('SET FOREIGN_KEY_CHECKS = 1');
        }

        await db.query(`
            CREATE TABLE IF NOT EXISTS student_fees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id INT NOT NULL,
                academic_year_id INT NOT NULL,
                program_type ENUM('preschool', 'daycare') NOT NULL,
                registration_amount DECIMAL(10,2) DEFAULT 0,
                registration_status VARCHAR(50) DEFAULT 'Unpaid',
                security_deposit_amount DECIMAL(10,2) DEFAULT 0,
                security_deposit_status VARCHAR(50) DEFAULT 'Unpaid',
                admission_form_fee DECIMAL(10,2) DEFAULT 0,
                admission_form_status VARCHAR(50) DEFAULT 'Unpaid',
                school_fees DECIMAL(10,2) DEFAULT 0,
                num_installments INT DEFAULT 1,
                monthly_fee DECIMAL(10,2) DEFAULT 0,
                hours_opted VARCHAR(50),
                extra_hours DECIMAL(5,2) DEFAULT 0,
                extra_hours_amount DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) DEFAULT 0,
                total_paid DECIMAL(10,2) DEFAULT 0,
                total_due DECIMAL(10,2) DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
                FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS fee_installments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_fee_id INT NOT NULL,
                installment_no INT NOT NULL,
                amount DECIMAL(10,2) DEFAULT 0,
                due_date DATE,
                status VARCHAR(50) DEFAULT 'Unpaid',
                part_payment DECIMAL(10,2) DEFAULT 0,
                difference DECIMAL(10,2) DEFAULT 0,
                paid_date DATE,
                FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS fee_monthly (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_fee_id INT NOT NULL,
                month_number INT NOT NULL,
                month_name VARCHAR(20) NOT NULL,
                amount_due DECIMAL(10,2) DEFAULT 0,
                amount_paid DECIMAL(10,2) DEFAULT 0,
                extra_hours DECIMAL(5,2) DEFAULT 0,
                extra_amount DECIMAL(10,2) DEFAULT 0,
                paid_date DATE,
                FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS fee_waivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_fee_id INT NOT NULL,
                waiver_type VARCHAR(50) NOT NULL,
                apply_on VARCHAR(50) DEFAULT 'total',
                apply_on_item VARCHAR(50),
                amount DECIMAL(10,2) DEFAULT 0,
                percentage DECIMAL(5,2) DEFAULT 0,
                reason TEXT,
                approved_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS fee_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                template_name VARCHAR(100) NOT NULL,
                program_type ENUM('preschool', 'daycare') NOT NULL,
                school_fees DECIMAL(10,2) DEFAULT 0,
                registration_amount DECIMAL(10,2) DEFAULT 0,
                registration_status VARCHAR(50) DEFAULT 'Unpaid',
                security_deposit_amount DECIMAL(10,2) DEFAULT 0,
                security_deposit_status VARCHAR(50) DEFAULT 'Unpaid',
                admission_form_fee DECIMAL(10,2) DEFAULT 0,
                admission_form_status VARCHAR(50) DEFAULT 'Unpaid',
                num_installments INT DEFAULT 1,
                monthly_fee DECIMAL(10,2) DEFAULT 0,
                hours_opted VARCHAR(50),
                match_keywords TEXT,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Seed default academic year if none exists
        const [years]: any = await db.query('SELECT id FROM academic_years LIMIT 1');
        if (years.length === 0) {
            await db.query(`
                INSERT INTO academic_years (year_label, start_date, end_date, status)
                VALUES ('2026-27', '2026-04-01', '2027-03-31', 'active')
            `);
        }

        // Seed default fee templates from Excel (2026-27 structure)
        const [tmpl]: any = await db.query('SELECT id FROM fee_templates LIMIT 1');
        if (tmpl.length === 0) {
            const defaultTemplates = [
                // ── Preschool ──────────────────────────────────────────────────
                {
                    template_name: 'Toddler 2-3Yrs',
                    program_type: 'preschool',
                    school_fees: 85000,
                    registration_amount: 5000, registration_status: 'Unpaid',
                    security_deposit_amount: 5000, security_deposit_status: 'Unpaid',
                    admission_form_fee: 0, admission_form_status: 'Wave Off',
                    num_installments: 2,
                    monthly_fee: 0, hours_opted: null,
                    match_keywords: JSON.stringify(['Toddler', 'Toddler 2-3', 'Toddler 2-3Yrs', 'Slot 1']),
                },
                {
                    template_name: 'Kamblee 3-4Yrs',
                    program_type: 'preschool',
                    school_fees: 85000,
                    registration_amount: 5000, registration_status: 'Unpaid',
                    security_deposit_amount: 5000, security_deposit_status: 'Unpaid',
                    admission_form_fee: 0, admission_form_status: 'Wave Off',
                    num_installments: 2,
                    monthly_fee: 0, hours_opted: null,
                    match_keywords: JSON.stringify(['Kamblee', 'Kamblee 3-4', 'Kamblee 3-4 Yrs', 'Nursery', 'Slot 2']),
                },
                // ── Daycare ────────────────────────────────────────────────────
                {
                    template_name: 'Daycare - 6 Hours',
                    program_type: 'daycare',
                    school_fees: 0,
                    registration_amount: 0, registration_status: 'Unpaid',
                    security_deposit_amount: 5000, security_deposit_status: 'Unpaid',
                    admission_form_fee: 500, admission_form_status: 'Unpaid',
                    num_installments: 1,
                    monthly_fee: 10500, hours_opted: '6',
                    match_keywords: JSON.stringify(['6', '6hrs', '6 hours', '6hr', 'Daycare 6', 'DC 6']),
                },
                {
                    template_name: 'Daycare - 9 Hours',
                    program_type: 'daycare',
                    school_fees: 0,
                    registration_amount: 0, registration_status: 'Unpaid',
                    security_deposit_amount: 5000, security_deposit_status: 'Unpaid',
                    admission_form_fee: 500, admission_form_status: 'Unpaid',
                    num_installments: 1,
                    monthly_fee: 14000, hours_opted: '9',
                    match_keywords: JSON.stringify(['9', '9hrs', '9 hours', '9hr', 'Daycare 9', 'DC 9']),
                },
            ];

            for (const t of defaultTemplates) {
                await db.query(`
                    INSERT INTO fee_templates (
                        template_name, program_type,
                        school_fees, registration_amount, registration_status,
                        security_deposit_amount, security_deposit_status,
                        admission_form_fee, admission_form_status,
                        num_installments, monthly_fee, hours_opted, match_keywords
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                `, [
                    t.template_name, t.program_type,
                    t.school_fees, t.registration_amount, t.registration_status,
                    t.security_deposit_amount, t.security_deposit_status,
                    t.admission_form_fee, t.admission_form_status,
                    t.num_installments, t.monthly_fee, t.hours_opted, t.match_keywords,
                ]);
            }
        }

        return NextResponse.json({ success: true, message: 'Fee tables created and templates seeded' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
