import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const columns = [
            { name: 'medical_auth_name', def: 'VARCHAR(255)' },
            { name: 'daycare_time_from', def: 'VARCHAR(10)' },
            { name: 'daycare_time_to', def: 'VARCHAR(10)' },
            { name: 'aadhar_front', def: 'VARCHAR(500)' },
            { name: 'aadhar_back', def: 'VARCHAR(500)' },
            { name: 'birth_certificate', def: 'VARCHAR(500)' },
        ];
        for (const col of columns) {
            try {
                await db.query(`ALTER TABLE admissions ADD COLUMN ${col.name} ${col.def}`);
            } catch (e: any) {
                if (!e.message.includes('Duplicate column')) throw e;
            }
        }
        return NextResponse.json({ success: true, message: 'Document fields migrated.' });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}
