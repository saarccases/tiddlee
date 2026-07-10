import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable(db: any) {
    await db.query(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            person_type ENUM('student','teacher') NOT NULL,
            person_id INT NOT NULL,
            person_name VARCHAR(255),
            date DATE NOT NULL,
            status ENUM('present','absent','late') DEFAULT 'present',
            note TEXT,
            marked_by VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_attendance (person_type, person_id, date)
        )
    `);
}

// GET — today's absent counts OR full list
export async function GET(request: NextRequest) {
    try {
        const db = await getDb();
        await ensureTable(db);

        const today = new Date().toISOString().split('T')[0];
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || today;

        const [studentAbsent]: any = await db.query(
            `SELECT COUNT(*) as count FROM attendance WHERE person_type='student' AND date=? AND status='absent'`,
            [date]
        );
        const [teacherAbsent]: any = await db.query(
            `SELECT COUNT(*) as count FROM attendance WHERE person_type='teacher' AND date=? AND status='absent'`,
            [date]
        );
        const [records]: any = await db.query(
            `SELECT * FROM attendance WHERE date=? ORDER BY person_type, person_name`,
            [date]
        );

        return NextResponse.json({
            date,
            student_absent: studentAbsent[0].count,
            teacher_absent: teacherAbsent[0].count,
            records,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — mark attendance
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { person_type, person_id, person_name, status, date, note } = body;
        if (!person_type || !person_id || !status) {
            return NextResponse.json({ error: 'person_type, person_id, status required' }, { status: 400 });
        }

        const db = await getDb();
        await ensureTable(db);

        const today = date || new Date().toISOString().split('T')[0];
        await db.query(
            `INSERT INTO attendance (person_type, person_id, person_name, date, status, note)
             VALUES (?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE status=VALUES(status), note=VALUES(note)`,
            [person_type, person_id, person_name || '', today, status, note || null]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
