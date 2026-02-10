import mysql from 'mysql2/promise';

async function logAdmissions() {
    const db = await mysql.createConnection({
        host: '147.93.155.21',
        user: 'root',
        password: 'rootpass',
        database: 'tiddlee_admissions',
    });

    try {
        const [rows] = await db.query('SELECT id, unique_id, child_name FROM admissions');
        console.log('Current admissions:', rows);
    } catch (error) {
        console.error('Error logging admissions:', error);
    } finally {
        await db.end();
    }
}

logAdmissions();
