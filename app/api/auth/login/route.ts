import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const db = await getDb();

        // Use the existing admins table (same as web app)
        const [rows]: any = await db.query(
            'SELECT * FROM admins WHERE username = ? LIMIT 1',
            [username.trim()]
        );

        if (!rows.length) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        const admin = rows[0];
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        // Update last login
        await db.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

        const token = await signToken({
            id: admin.id,
            name: admin.full_name || admin.username,
            email: admin.username,
            role: admin.role || 'admin',
        });

        return NextResponse.json({
            token,
            user: {
                id: admin.id,
                name: admin.full_name || admin.username,
                email: admin.username,
                role: admin.role || 'admin',
                class_assigned: admin.class_assigned || null,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
