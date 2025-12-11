const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrate() {
    try {
        console.log('Starting migration: Dropping notifications unique constraint...');

        await pool.query(`
      ALTER TABLE notifications 
      DROP CONSTRAINT IF EXISTS notifications_user_form_unique;
    `);

        console.log('Successfully dropped notifications_user_form_unique constraint.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
