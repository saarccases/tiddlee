import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST() {
    try {
        const db = getDb();

        // Wipe all data but keep the table structure
        await db.query('TRUNCATE TABLE admissions');

        return NextResponse.json({
            message: 'Database reset complete. All admission data has been erased. Auto-increment reset to 1.'
        }, { status: 200 });
    } catch (error) {
        console.error('[Reset DB] Error:', error);
        return NextResponse.json({ message: 'Database reset failed', error: (error as Error).message }, { status: 500 });
    }
}
