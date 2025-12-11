const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env if needed

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  try {
    console.log('Starting migration: Adding rejected_at column...');
    
    await pool.query(`
      ALTER TABLE ministry_forms 
      ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
    `);
    
    console.log('Successfully added rejected_at column to ministry_forms table.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
