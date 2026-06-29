import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

function parseCurrency(val: any): number {
    if (!val) return 0;
    const str = String(val).replace(/[₹,\s]/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

function parseDate(val: any): string | null {
    if (!val) return null;
    const str = String(val).trim();
    // DD-MM-YYYY
    const match = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    // Excel serial number
    if (/^\d+$/.test(str)) {
        const date = XLSX.SSF.parse_date_code(parseInt(str));
        if (date) return `${date.y}-${String(date.m).padStart(2,'0')}-${String(date.d).padStart(2,'0')}`;
    }
    return null;
}

function clean(val: any): string {
    if (!val) return '';
    return String(val).trim();
}

async function importPreschool(db: any, rows: any[][]): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0, skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const childName = clean(r[2]);
        if (!childName) continue;

        const uniqueId = clean(r[1]);

        try {
            // Check duplicate
            const [existing]: any = await db.query('SELECT id FROM enrollments WHERE unique_id = ?', [uniqueId]);
            if (existing.length > 0) { skipped++; continue; }

            // Insert enrollment
            const [result]: any = await db.query(`
                INSERT INTO enrollments (unique_id, child_name, program_type, program_name, new_or_existing,
                    enrollment_date, gender, dob, age, mother_email, father_email,
                    mother_phone, father_phone, guardian_phone, address, blood_group,
                    allergy, kit_handover, photographs, enrollment_form_signed, slot)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `, [
                uniqueId, childName, 'preschool', clean(r[3]), clean(r[4]),
                parseDate(r[5]), clean(r[6]), parseDate(r[7]), clean(r[8]),
                clean(r[9]), clean(r[10]), clean(r[11]), clean(r[12]), clean(r[13]),
                clean(r[14]), clean(r[15]), clean(r[18]), clean(r[16]), clean(r[17]),
                clean(r[19]), clean(r[46])
            ]);

            const enrollmentId = result.insertId;

            // Insert preschool fees
            await db.query(`
                INSERT INTO preschool_fees (
                    enrollment_id, unique_id, school_fees, amount_paid,
                    registration_amount, registration_status,
                    security_deposit_amount, security_deposit_status,
                    admission_form_fee, admission_form_status,
                    total_amount, fees_due, num_installments,
                    inst1_amount, inst1_status, inst1_part_payment, inst1_difference,
                    inst2_amount, inst2_status, inst2_part_payment,
                    inst3_amount, inst3_status,
                    inst4_amount, inst4_status,
                    wave_off_type
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `, [
                enrollmentId, uniqueId,
                parseCurrency(r[20]), parseCurrency(r[21]),
                parseCurrency(r[22]), clean(r[24]) || 'Unpaid',
                parseCurrency(r[23]), clean(r[24]) || 'Unpaid',
                parseCurrency(r[25]), clean(r[26]) === 'Wave OFF' ? 'Wave OFF' : (clean(r[26]) || 'Unpaid'),
                parseCurrency(r[28]), parseCurrency(r[29]),
                parseInt(clean(r[30])) || 1,
                parseCurrency(r[32]), clean(r[33]) || 'Unpaid', parseCurrency(r[34]), parseCurrency(r[35]),
                parseCurrency(r[37]), clean(r[38]) || 'Unpaid', parseCurrency(r[40]),
                parseCurrency(r[42]), clean(r[43]) || 'Unpaid',
                parseCurrency(r[45]), clean(r[45]) ? 'Unpaid' : 'Unpaid',
                clean(r[26]) === 'Wave OFF' ? 'manual' : null
            ]);

            imported++;
        } catch (err: any) {
            errors.push(`Row ${i + 1} (${childName}): ${err.message}`);
        }
    }

    return { imported, skipped, errors };
}

async function importDaycare(db: any, rows: any[][]): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0, skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const childName = clean(r[2]);
        if (!childName) continue;

        const uniqueId = clean(r[1]);

        try {
            const [existing]: any = await db.query('SELECT id FROM enrollments WHERE unique_id = ?', [uniqueId]);
            if (existing.length > 0) { skipped++; continue; }

            const [result]: any = await db.query(`
                INSERT INTO enrollments (unique_id, child_name, program_type, new_or_existing,
                    enrollment_date, gender, dob, age,
                    mother_email, father_email, mother_phone, father_phone, guardian_phone,
                    address, blood_group, allergy, kit_handover, photographs, enrollment_form_signed,
                    hours_opted, referred_by)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `, [
                uniqueId, childName, 'daycare', clean(r[3]),
                parseDate(r[4]), clean(r[5]), parseDate(r[6]), clean(r[7]),
                clean(r[25]), clean(r[26]), clean(r[27]), clean(r[28]), clean(r[29]),
                clean(r[30]), clean(r[31]), clean(r[35]), clean(r[40]), clean(r[33]),
                clean(r[34]), clean(r[8]), clean(r[32])
            ]);

            const enrollmentId = result.insertId;

            const monthStatuses = [
                'april', 'may', 'june', 'july', 'august', 'september',
                'october', 'november', 'december', 'january', 'february', 'march'
            ];

            const monthValues: any[] = [enrollmentId, uniqueId, parseCurrency(r[9])];
            monthValues.push(parseCurrency(r[36]), clean(r[37]) || 'Unpaid');
            monthValues.push(parseCurrency(r[38]), clean(r[39]) || 'Unpaid');
            monthValues.push(clean(r[41]));
            monthValues.push(parseCurrency(r[24]));

            // Monthly statuses (cols 10-21)
            for (let m = 0; m < 12; m++) {
                monthValues.push(clean(r[10 + m]) || 'Unpaid');
                monthValues.push(0); // extra_amount default
            }

            await db.query(`
                INSERT INTO daycare_fees (
                    enrollment_id, unique_id, fees_per_month,
                    security_deposit_amount, security_deposit_status,
                    admission_form_fee, admission_form_status,
                    one_time_waiver, total_amount_payable,
                    april_status, april_extra_amount,
                    may_status, may_extra_amount,
                    june_status, june_extra_amount,
                    july_status, july_extra_amount,
                    august_status, august_extra_amount,
                    september_status, september_extra_amount,
                    october_status, october_extra_amount,
                    november_status, november_extra_amount,
                    december_status, december_extra_amount,
                    january_status, january_extra_amount,
                    february_status, february_extra_amount,
                    march_status, march_extra_amount
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `, monthValues);

            imported++;
        } catch (err: any) {
            errors.push(`Row ${i + 1} (${childName}): ${err.message}`);
        }
    }

    return { imported, skipped, errors };
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer', cellText: true, cellDates: false });

        const db = await getDb();

        // Auto-create tables if not yet migrated
        await db.query(`CREATE TABLE IF NOT EXISTS enrollments (
            id INT AUTO_INCREMENT PRIMARY KEY, admission_id INT NULL, unique_id VARCHAR(50) UNIQUE, child_name VARCHAR(255) NOT NULL,
            program_type ENUM('preschool','daycare') NOT NULL, program_name VARCHAR(255),
            new_or_existing VARCHAR(20) DEFAULT 'New', enrollment_date DATE, gender VARCHAR(20), dob DATE,
            age VARCHAR(50), mother_email VARCHAR(255), father_email VARCHAR(255), mother_phone VARCHAR(50),
            father_phone VARCHAR(50), guardian_phone VARCHAR(50), address TEXT, blood_group VARCHAR(20),
            allergy TEXT, kit_handover VARCHAR(10), photographs VARCHAR(10), enrollment_form_signed VARCHAR(10),
            slot VARCHAR(50), hours_opted VARCHAR(100), referred_by VARCHAR(255), status VARCHAR(20) DEFAULT 'active',
            notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);
        await db.query(`CREATE TABLE IF NOT EXISTS preschool_fees (
            id INT AUTO_INCREMENT PRIMARY KEY, enrollment_id INT NOT NULL, unique_id VARCHAR(50),
            school_fees DECIMAL(10,2) DEFAULT 0, amount_paid DECIMAL(10,2) DEFAULT 0,
            registration_amount DECIMAL(10,2) DEFAULT 0, registration_status VARCHAR(50) DEFAULT 'Unpaid',
            security_deposit_amount DECIMAL(10,2) DEFAULT 0, security_deposit_status VARCHAR(50) DEFAULT 'Unpaid',
            admission_form_fee DECIMAL(10,2) DEFAULT 0, admission_form_status VARCHAR(50) DEFAULT 'Unpaid',
            total_amount DECIMAL(10,2) DEFAULT 0, fees_due DECIMAL(10,2) DEFAULT 0, num_installments INT DEFAULT 1,
            inst1_amount DECIMAL(10,2) DEFAULT 0, inst1_status VARCHAR(50) DEFAULT 'Unpaid', inst1_part_payment DECIMAL(10,2) DEFAULT 0, inst1_difference DECIMAL(10,2) DEFAULT 0,
            inst2_amount DECIMAL(10,2) DEFAULT 0, inst2_status VARCHAR(50) DEFAULT 'Unpaid', inst2_part_payment DECIMAL(10,2) DEFAULT 0, inst2_difference DECIMAL(10,2) DEFAULT 0,
            inst3_amount DECIMAL(10,2) DEFAULT 0, inst3_status VARCHAR(50) DEFAULT 'Unpaid', inst3_part_payment DECIMAL(10,2) DEFAULT 0, inst3_difference DECIMAL(10,2) DEFAULT 0,
            inst4_amount DECIMAL(10,2) DEFAULT 0, inst4_status VARCHAR(50) DEFAULT 'Unpaid', inst4_part_payment DECIMAL(10,2) DEFAULT 0, inst4_difference DECIMAL(10,2) DEFAULT 0,
            wave_off_type VARCHAR(50), wave_off_reason TEXT,
            FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);
        await db.query(`CREATE TABLE IF NOT EXISTS daycare_fees (
            id INT AUTO_INCREMENT PRIMARY KEY, enrollment_id INT NOT NULL, unique_id VARCHAR(50),
            fees_per_month DECIMAL(10,2) DEFAULT 0, security_deposit_amount DECIMAL(10,2) DEFAULT 0,
            security_deposit_status VARCHAR(50) DEFAULT 'Unpaid', admission_form_fee DECIMAL(10,2) DEFAULT 0,
            admission_form_status VARCHAR(50) DEFAULT 'Unpaid', one_time_waiver VARCHAR(255),
            total_amount_payable DECIMAL(10,2) DEFAULT 0,
            april_status VARCHAR(50) DEFAULT 'Unpaid', april_extra_amount DECIMAL(10,2) DEFAULT 0,
            may_status VARCHAR(50) DEFAULT 'Unpaid', may_extra_amount DECIMAL(10,2) DEFAULT 0,
            june_status VARCHAR(50) DEFAULT 'Unpaid', june_extra_amount DECIMAL(10,2) DEFAULT 0,
            july_status VARCHAR(50) DEFAULT 'Unpaid', july_extra_amount DECIMAL(10,2) DEFAULT 0,
            august_status VARCHAR(50) DEFAULT 'Unpaid', august_extra_amount DECIMAL(10,2) DEFAULT 0,
            september_status VARCHAR(50) DEFAULT 'Unpaid', september_extra_amount DECIMAL(10,2) DEFAULT 0,
            october_status VARCHAR(50) DEFAULT 'Unpaid', october_extra_amount DECIMAL(10,2) DEFAULT 0,
            november_status VARCHAR(50) DEFAULT 'Unpaid', november_extra_amount DECIMAL(10,2) DEFAULT 0,
            december_status VARCHAR(50) DEFAULT 'Unpaid', december_extra_amount DECIMAL(10,2) DEFAULT 0,
            january_status VARCHAR(50) DEFAULT 'Unpaid', january_extra_amount DECIMAL(10,2) DEFAULT 0,
            february_status VARCHAR(50) DEFAULT 'Unpaid', february_extra_amount DECIMAL(10,2) DEFAULT 0,
            march_status VARCHAR(50) DEFAULT 'Unpaid', march_extra_amount DECIMAL(10,2) DEFAULT 0,
            FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        const results: any = {};

        // Import Preschool sheet
        if (workbook.SheetNames.includes('Preschool')) {
            const sheet = workbook.Sheets['Preschool'];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            results.preschool = await importPreschool(db, rows);
        }

        // Import DC sheet (has trailing space)
        const dcSheetName = workbook.SheetNames.find(n => n.trim() === 'DC');
        if (dcSheetName) {
            const sheet = workbook.Sheets[dcSheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            results.daycare = await importDaycare(db, rows);
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
