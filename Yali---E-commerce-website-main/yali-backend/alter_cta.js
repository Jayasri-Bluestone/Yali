const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to DB');

    try {
      await connection.query("ALTER TABLE products ADD COLUMN cta_action VARCHAR(50) DEFAULT 'buy_now'");
      console.log('Added cta_action column to products');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column cta_action already exists');
      } else {
        throw e;
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

run();
