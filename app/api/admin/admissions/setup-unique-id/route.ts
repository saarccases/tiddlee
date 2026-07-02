import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// One-time setup:
// 1. Add unique_id column to admissions
// 2. Keep only Vehant, delete all other online admissions
// 3. Assign Vehant TID/2026-27/506
export async function POST() {
    try {
        const db = await getDb();

        // Add unique_id column if missing
        try {
            await db.query('ALTER TABLE admissions ADD COLUMN unique_id VARCHAR(50) NULL AFTER id');
        } catch (e: any) {
            if (!e.message?.includes('Duplicate column')) throw e;
        }

        // Find Vehant's record
        const [admissions]: any = await db.query(
            `SELECT id, child_name, unique_id FROM admissions ORDER BY created_at ASC`
        );

        if (admissions.length === 0) {
            return NextResponse.json({ message: 'No admissions found' });
        }

        // Vehant is the first / only student — keep him, delete the rest
        const vehant = admissions.find((a: any) =>
            a.child_name?.toLowerCase().includes('vehant')
        ) || admissions[0];

        // Delete all other admissions
        const otherIds = admissions
            .filter((a: any) => a.id !== vehant.id)
            .map((a: any) => a.id);

        if (otherIds.length > 0) {
            await db.query(
                `DELETE FROM admissions WHERE id IN (${otherIds.map(() => '?').join(',')})`,
                otherIds
            );
        }

        // Assign Vehant's unique ID
        await db.query(
            'UPDATE admissions SET unique_id = ?, status = ? WHERE id = ?',
            ['TID/2026-27/506', 'approved', vehant.id]
        );

        return NextResponse.json({
            success: true,
            kept: vehant.child_name,
            unique_id: 'TID/2026-27/506',
            deleted: otherIds.length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
