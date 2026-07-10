import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const db = await getDb();
    const [rows]: any = await db.query(
        'SELECT id, name, email, role, class_assigned, is_active, created_at FROM users ORDER BY role, name'
    );
    return NextResponse.json({ users: rows });
}

export async function POST(request: NextRequest) {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, email, password, role, class_assigned } = await request.json();
    if (!name || !email || !password || !role) {
        return NextResponse.json({ error: 'name, email, password, role required' }, { status: 400 });
    }

    const db = await getDb();
    const hash = await bcrypt.hash(password, 10);
    const [result]: any = await db.query(
        'INSERT INTO users (name, email, password_hash, role, class_assigned) VALUES (?,?,?,?,?)',
        [name, email.toLowerCase().trim(), hash, role, class_assigned || null]
    );
    return NextResponse.json({ success: true, id: result.insertId });
}

export async function PATCH(request: NextRequest) {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id, name, email, password, role, class_assigned, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name=?'); values.push(name); }
    if (email !== undefined) { fields.push('email=?'); values.push(email.toLowerCase().trim()); }
    if (role !== undefined) { fields.push('role=?'); values.push(role); }
    if (class_assigned !== undefined) { fields.push('class_assigned=?'); values.push(class_assigned); }
    if (is_active !== undefined) { fields.push('is_active=?'); values.push(is_active ? 1 : 0); }
    if (password) { fields.push('password_hash=?'); values.push(await bcrypt.hash(password, 10)); }

    if (!fields.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(',')} WHERE id=?`, values);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    if (parseInt(id) === authUser.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });

    const db = await getDb();
    await db.query('DELETE FROM users WHERE id=?', [id]);
    return NextResponse.json({ success: true });
}
