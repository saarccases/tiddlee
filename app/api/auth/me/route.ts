import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const [rows]: any = await db.query(
        'SELECT id, name, email, role, class_assigned FROM users WHERE id = ? AND is_active = 1',
        [user.id]
    );
    if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: rows[0] });
}
