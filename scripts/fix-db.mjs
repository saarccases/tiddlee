import mysql from 'mysql2/promise';

async function fixDb() {
    const db = await mysql.createConnection({
        host: '147.93.155.21',
        user: 'root',
        password: 'rootpass',
        database: 'tiddlee_admissions',
    });

    try {
        console.log('Checking database schema...');

        const ensureColumn = async (column, definition) => {
            const [rows] = await db.query(`SHOW COLUMNS FROM admissions LIKE "${column}"`);
            if (rows.length === 0) {
                console.log(`Adding column ${column}...`);
                await db.query(`ALTER TABLE admissions ADD COLUMN ${column} ${definition}`);
                console.log(`Column ${column} added successfully.`);
            } else {
                console.log(`Column ${column} already exists.`);
            }
        };

        await ensureColumn('media_consent', 'VARCHAR(10) AFTER languages_spoken');
        await ensureColumn('mother_signature', 'VARCHAR(255)');
        await ensureColumn('mother_signature_date', 'DATE');
        await ensureColumn('father_signature', 'VARCHAR(255)');
        await ensureColumn('father_signature_date', 'DATE');
        await ensureColumn('submission_date', 'DATE');

    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        await db.end();
    }
}

fixDb();
