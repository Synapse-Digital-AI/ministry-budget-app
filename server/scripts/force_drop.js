const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function forceDrop() {
    try {
        console.log('Checking for constraint...');
        // Check if it exists
        const checkRes = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'notifications_user_form_unique' 
      AND table_name = 'notifications'
    `);

        if (checkRes.rows.length > 0) {
            console.log('Constraint FOUND. Dropping now...');
            await pool.query(`ALTER TABLE notifications DROP CONSTRAINT notifications_user_form_unique`);
            console.log('Constraint DROPPED successfully.');
        } else {
            console.log('Constraint NOT FOUND. It might have consistently been dropped.');
        }

    } catch (error) {
        console.error('Force drop failed:', error);
    } finally {
        await pool.end();
    }
}

forceDrop();
