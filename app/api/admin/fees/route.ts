import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// Ensure tables exist
async function ensureTables() {
    const db = getDb();

    // Program fee structure table
    await db.query(`
        CREATE TABLE IF NOT EXISTS program_fees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            program_name VARCHAR(100) NOT NULL,
            fee_type VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            frequency VARCHAR(30) NOT NULL DEFAULT 'one-time',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Student fee records table - tracks what each approved student owes/paid
    await db.query(`
        CREATE TABLE IF NOT EXISTS student_fees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admission_id INT NOT NULL,
            program_fee_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            due_date DATE,
            paid_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

// GET - fetch program fees, or student fees if admission_id is provided
export async function GET(request: Request) {
    try {
        await ensureTables();
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const admissionId = searchParams.get('admission_id');

        if (admissionId) {
            // Get fees for a specific student
            const [rows] = await db.query(
                `SELECT sf.*, pf.program_name, pf.fee_type, pf.frequency
                 FROM student_fees sf
                 JOIN program_fees pf ON sf.program_fee_id = pf.id
                 WHERE sf.admission_id = ?
                 ORDER BY sf.status ASC, sf.due_date ASC`,
                [admissionId]
            );
            return NextResponse.json(rows);
        }

        // Get all program fees
        const [rows] = await db.query('SELECT * FROM program_fees ORDER BY program_name, fee_type');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('[Fees GET] Error:', error);
        return NextResponse.json({ message: 'Error fetching fees', error: (error as Error).message }, { status: 500 });
    }
}

// POST - create or update a program fee
export async function POST(request: Request) {
    try {
        await ensureTables();
        const db = getDb();
        const body = await request.json();
        const { id, program_name, fee_type, amount, frequency } = body;

        if (id) {
            await db.query(
                'UPDATE program_fees SET program_name = ?, fee_type = ?, amount = ?, frequency = ? WHERE id = ?',
                [program_name, fee_type, amount, frequency, id]
            );
            return NextResponse.json({ message: 'Fee updated', id });
        }

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO program_fees (program_name, fee_type, amount, frequency) VALUES (?, ?, ?, ?)',
            [program_name, fee_type, amount, frequency]
        );
        return NextResponse.json({ message: 'Fee created', id: result.insertId });
    } catch (error) {
        console.error('[Fees POST] Error:', error);
        return NextResponse.json({ message: 'Error saving fee', error: (error as Error).message }, { status: 500 });
    }
}

// DELETE - delete a program fee
export async function DELETE(request: Request) {
    try {
        await ensureTables();
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

        await db.query('DELETE FROM program_fees WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Fee deleted' });
    } catch (error) {
        console.error('[Fees DELETE] Error:', error);
        return NextResponse.json({ message: 'Error deleting fee', error: (error as Error).message }, { status: 500 });
    }
}

// PATCH - assign fees to a student or update student fee status
export async function PATCH(request: Request) {
    try {
        await ensureTables();
        const db = getDb();
        const body = await request.json();

        // Assign fees to student when approved
        if (body.action === 'assign') {
            const { admission_id, programs } = body;

            // Get all fees for the student's programs
            const [fees]: any = await db.query(
                'SELECT * FROM program_fees WHERE program_name IN (?)',
                [programs]
            );

            for (const fee of fees) {
                // Check if already assigned
                const [existing]: any = await db.query(
                    'SELECT id FROM student_fees WHERE admission_id = ? AND program_fee_id = ?',
                    [admission_id, fee.id]
                );
                if (existing.length === 0) {
                    await db.query(
                        'INSERT INTO student_fees (admission_id, program_fee_id, amount, status) VALUES (?, ?, ?, ?)',
                        [admission_id, fee.id, fee.amount, 'pending']
                    );
                }
            }
            return NextResponse.json({ message: 'Fees assigned to student' });
        }

        // Update student fee status (mark as paid)
        if (body.action === 'update_status') {
            const { student_fee_id, status, paid_date } = body;
            await db.query(
                'UPDATE student_fees SET status = ?, paid_date = ? WHERE id = ?',
                [status, paid_date || null, student_fee_id]
            );
            return NextResponse.json({ message: 'Fee status updated' });
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[Fees PATCH] Error:', error);
        return NextResponse.json({ message: 'Error updating fee', error: (error as Error).message }, { status: 500 });
    }
}
