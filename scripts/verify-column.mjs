import mysql from 'mysql2/promise';

async function checkMediaConsent() {
    const db = await mysql.createConnection({
        host: '147.93.155.21',
        user: 'root',
        password: 'rootpass',
        database: 'tiddlee_admissions',
    });

    try {
        const [rows] = await db.query('SHOW COLUMNS FROM admissions');
        const mediaConsent = rows.find(r => r.Field === 'media_consent');
        if (mediaConsent) {
            console.log('media_consent column found:', mediaConsent);
        } else {
            console.log('media_consent column NOT found!');
            console.log('Available columns:', rows.map(r => r.Field).join(', '));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

checkMediaConsent();
