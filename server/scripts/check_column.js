const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkColumn() {
    try {
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ministry_forms' AND column_name = 'rejected_at';
    `);

        if (res.rows.length > 0) {
            console.log('PASS: rejected_at column exists.');
        } else {
            console.log('FAIL: rejected_at column does NOT exist.');
            // Try to add it again if it failed
            console.log('Attempting to add it again...');
            await pool.query(`ALTER TABLE ministry_forms ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;`);
            console.log('Added rejected_at column.');
        }
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await pool.end();
    }
}

checkColumn();
