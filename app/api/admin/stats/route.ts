import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();

        // 1. Total Students (Approved status)
        const [totalStudents]: any = await db.query(
            "SELECT COUNT(*) as count FROM admissions WHERE status = 'approved'"
        );

        // 2. Pending Admissions
        const [pendingAdmissions]: any = await db.query(
            "SELECT COUNT(*) as count FROM admissions WHERE status = 'pending'"
        );

        // 3. New Applications today
        const [newToday]: any = await db.query(
            "SELECT COUNT(*) as count FROM admissions WHERE DATE(created_at) = CURDATE()"
        );

        // 4. Recent Admissions list
        const [recentList]: any = await db.query(`
            SELECT id, child_name, programs_selected, mother_name, status, created_at
            FROM admissions
            ORDER BY created_at DESC
            LIMIT 5
        `);

        // 5. Active staff count from staff table
        let activeStaff = 0;
        let staffAvailability: any[] = [];
        try {
            const [staffCount]: any = await db.query(
                "SELECT COUNT(*) as count FROM staff WHERE status = 'active'"
            );
            activeStaff = staffCount[0].count;

            const [staffList]: any = await db.query(
                "SELECT name, role, status, photo FROM staff WHERE status = 'active' ORDER BY name ASC LIMIT 5"
            );
            staffAvailability = staffList;
        } catch { /* staff table may not exist yet */ }

        return NextResponse.json({
            stats: {
                totalStudents: totalStudents[0].count,
                pendingAdmissions: pendingAdmissions[0].count,
                newToday: newToday[0].count,
                staffCount: activeStaff,
            },
            recentAdmissions: recentList.map((row: any) => ({
                ...row,
                programs_selected: row.programs_selected ? JSON.parse(row.programs_selected) : []
            })),
            staffAvailability,
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
