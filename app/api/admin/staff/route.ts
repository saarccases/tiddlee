import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureStaffTable() {
    const db = await getDb();
    await db.query(`
        CREATE TABLE IF NOT EXISTS staff (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id VARCHAR(50),
            name VARCHAR(255) NOT NULL,
            photo VARCHAR(500),
            dob DATE,
            gender VARCHAR(20),
            phone VARCHAR(50),
            email VARCHAR(255),
            address TEXT,
            blood_group VARCHAR(20),
            role VARCHAR(100),
            department VARCHAR(100),
            status VARCHAR(20) DEFAULT 'active',
            joining_date DATE,
            emergency_contact_name VARCHAR(255),
            emergency_contact_phone VARCHAR(50),
            emergency_contact_relation VARCHAR(100),
            work_experience TEXT,
            programs_handling TEXT,
            class_notes TEXT,
            qualifications TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

export async function GET(request: Request) {
    try {
        await ensureStaffTable();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const db = await getDb();

        if (id) {
            const [rows]: any = await db.query('SELECT * FROM staff WHERE id = ?', [id]);
            if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            const staff = rows[0];
            return NextResponse.json({
                ...staff,
                work_experience: staff.work_experience ? JSON.parse(staff.work_experience) : [],
                programs_handling: staff.programs_handling ? JSON.parse(staff.programs_handling) : [],
                qualifications: staff.qualifications ? JSON.parse(staff.qualifications) : [],
            });
        }

        const status = searchParams.get('status');
        let query = 'SELECT * FROM staff';
        const params: any[] = [];
        if (status && status !== 'all') {
            query += ' WHERE status = ?';
            params.push(status);
        }
        query += ' ORDER BY name ASC';
        const [rows]: any = await db.query(query, params);

        return NextResponse.json(rows.map((s: any) => ({
            ...s,
            work_experience: s.work_experience ? JSON.parse(s.work_experience) : [],
            programs_handling: s.programs_handling ? JSON.parse(s.programs_handling) : [],
            qualifications: s.qualifications ? JSON.parse(s.qualifications) : [],
        })));
    } catch (error) {
        console.error('Staff GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await ensureStaffTable();
        const body = await request.json();
        const db = await getDb();

        const payload = {
            ...body,
            work_experience: JSON.stringify(body.work_experience || []),
            programs_handling: JSON.stringify(body.programs_handling || []),
            qualifications: JSON.stringify(body.qualifications || []),
        };

        if (payload.id) {
            const { id, created_at, updated_at, ...fields } = payload;
            const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
            const values = keys.map(k => fields[k]);
            const setClause = keys.map(k => `${k} = ?`).join(', ');
            await db.query(`UPDATE staff SET ${setClause} WHERE id = ?`, [...values, id]);
            return NextResponse.json({ success: true, id });
        }

        // Auto-generate employee_id if not provided
        if (!payload.employee_id) {
            const [rows]: any = await db.query('SELECT COUNT(*) as cnt FROM staff');
            const count = rows[0].cnt + 1;
            payload.employee_id = `STF${String(count).padStart(4, '0')}`;
        }

        const { id, created_at, updated_at, ...insertFields } = payload;
        const keys = Object.keys(insertFields).filter(k => insertFields[k] !== undefined && insertFields[k] !== '');
        const values = keys.map(k => insertFields[k]);
        const placeholders = keys.map(() => '?').join(', ');
        const result: any = await db.query(
            `INSERT INTO staff (${keys.join(', ')}) VALUES (${placeholders})`,
            values
        );
        const insertId = result[0]?.insertId;
        return NextResponse.json({ success: true, id: insertId });
    } catch (error) {
        console.error('Staff POST error:', error);
        return NextResponse.json({ error: 'Failed to save staff' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const db = await getDb();
        await db.query('DELETE FROM staff WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Staff DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}
