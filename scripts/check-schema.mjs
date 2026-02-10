import mysql from 'mysql2/promise';

async function checkSchema() {
    const db = await mysql.createConnection({
        host: '147.93.155.21',
        user: 'root',
        password: 'rootpass',
        database: 'tiddlee_admissions',
    });

    try {
        const [rows] = await db.query('DESCRIBE admissions');
        console.log('Admissions schema:', rows);
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await db.end();
    }
}

checkSchema();
