import mysql from 'mysql2/promise';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function setupAdmin() {
    const connection = await mysql.createConnection({
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });

    console.log('Setting up Admin Dashboard database requirements...');

    // 1. Add status column to admissions if it doesn't exist
    try {
        const [checkStatus] = await connection.query("SHOW COLUMNS FROM admissions LIKE 'status'");
        if (checkStatus.length === 0) {
            console.log('Adding status column to admissions...');
            await connection.query("ALTER TABLE admissions ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
        }
    } catch (err) {
        console.error('Error adding status column:', err);
    }

    // 2. Create admins table
    try {
        console.log('Creating admins table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                email VARCHAR(255),
                role VARCHAR(50) DEFAULT 'admin',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error creating admins table:', err);
    }

    // 3. Create default admin if none exists
    try {
        const [admins] = await connection.query("SELECT * FROM admins LIMIT 1");
        if (admins.length === 0) {
            const defaultUser = 'admin';
            const defaultPass = 'admin123'; // In a real app, this should be changed immediately
            const hashedPassword = await bcrypt.hash(defaultPass, 10);

            console.log(`Creating default admin: ${defaultUser}`);
            await connection.query(
                "INSERT INTO admins (username, password, full_name, role) VALUES (?, ?, ?, ?)",
                [defaultUser, hashedPassword, 'Tiddlee Admin', 'superadmin']
            );
            console.log('--------------------------------------------------');
            console.log('DEFAULT ADMIN CREATED');
            console.log(`Username: ${defaultUser}`);
            console.log(`Password: ${defaultPass}`);
            console.log('PLEASE CHANGE THIS PASSWORD AFTER YOUR FIRST LOGIN');
            console.log('--------------------------------------------------');
        }
    } catch (err) {
        console.error('Error creating default admin:', err);
    }

    console.log('Admin setup complete.');
    await connection.end();
}

setupAdmin().catch(console.error);
