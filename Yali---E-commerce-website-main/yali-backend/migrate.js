require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Adding status_history column...');
    await pool.query("ALTER TABLE orders ADD COLUMN status_history JSON");
    console.log('Migration successful');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error(err);
    }
  }
  process.exit(0);
}
migrate();
