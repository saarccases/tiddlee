import mysql from 'mysql2/promise';
import fs from 'fs';

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function migrate() {
    const connection = await mysql.createConnection({
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });

    console.log('Migrating database...');

    const columnsToAdd = [
        'blood_group VARCHAR(20)',
        'physician_name VARCHAR(255)',
        'physician_phone VARCHAR(50)',
        'physician_address TEXT',
        'backup_physician_allowed VARCHAR(10)',
        'allergies_reactions TEXT',
        'past_illnesses TEXT',
        'other_health_info TEXT',
        'immunization_records JSON',
        'current_height VARCHAR(50)',
        'current_weight VARCHAR(50)',
        'food_allergies TEXT',
        'likes TEXT',
        'dislikes TEXT',
        'sleep_routines TEXT',
        'playtime_activities TEXT',
        'is_potty_trained VARCHAR(10)',
        'redirection_techniques TEXT',
        'additional_comments TEXT'
    ];

    for (const col of columnsToAdd) {
        const colName = col.split(' ')[0];
        try {
            // Check if column exists
            const [check] = await connection.query(`SHOW COLUMNS FROM admissions LIKE '${colName}'`);
            if (check.length === 0) {
                console.log(`Adding column: ${colName}`);
                await connection.query(`ALTER TABLE admissions ADD COLUMN ${col}`);
            } else {
                console.log(`Column ${colName} already exists, skipping.`);
            }
        } catch (err) {
            console.error(`Error adding column ${colName}:`, err);
        }
    }

    console.log('Migration complete.');
    await connection.end();
}

migrate().catch(console.error);
