import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin','teacher') NOT NULL DEFAULT 'teacher',
                is_active TINYINT(1) DEFAULT 1,
                class_assigned VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const hash = await bcrypt.hash('admin123', 10);

        // Seed default admin if not exists, otherwise ensure password is correct
        const [rows]: any = await db.query(`SELECT id FROM users WHERE email = 'admin@tiddlee.com' LIMIT 1`);
        if (rows.length === 0) {
            await db.query(
                `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
                ['Admin', 'admin@tiddlee.com', hash]
            );
        } else {
            await db.query(
                `UPDATE users SET password_hash = ? WHERE email = 'admin@tiddlee.com'`,
                [hash]
            );
        }

        return NextResponse.json({ success: true, message: 'Users table ready. Admin password reset to admin123.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
