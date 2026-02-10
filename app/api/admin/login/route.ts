import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'tiddlee-super-secret-key-change-me'
);

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const db = await getDb();

        const [rows]: any = await db.query(
            "SELECT * FROM admins WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        const admin = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return NextResponse.json(
                { message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create JWT
        const token = await new SignJWT({
            id: admin.id,
            username: admin.username,
            role: admin.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // Update last login
        await db.query("UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [admin.id]);

        // Set cookie
        cookies().set({
            name: 'admin_token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return NextResponse.json({
            success: true,
            user: {
                id: admin.id,
                username: admin.username,
                full_name: admin.full_name,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
