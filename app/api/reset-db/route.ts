import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST() {
    try {
        const db = getDb();

        // Wipe all data but keep table structure
        await db.query('DELETE FROM admissions');
        await db.query('ALTER TABLE admissions AUTO_INCREMENT = 1');
        try {
            await db.query('DELETE FROM staff');
            await db.query('ALTER TABLE staff AUTO_INCREMENT = 1');
        } catch { /* staff table may not exist */ }
        try {
            await db.query('DELETE FROM student_fees');
            await db.query('ALTER TABLE student_fees AUTO_INCREMENT = 1');
        } catch { /* table may not exist */ }
        try {
            await db.query('DELETE FROM program_fees');
            await db.query('ALTER TABLE program_fees AUTO_INCREMENT = 1');
        } catch { /* table may not exist */ }

        return NextResponse.json({
            message: 'Database reset complete. All data erased and auto-increment reset to 1.'
        }, { status: 200 });
    } catch (error) {
        console.error('[Reset DB] Error:', error);
        return NextResponse.json({ message: 'Database reset failed', error: (error as Error).message }, { status: 500 });
    }
}
