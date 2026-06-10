require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    await pool.query("ALTER TABLE orders MODIFY COLUMN status ENUM('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned') DEFAULT 'Pending'");
    console.log('Successfully altered status enum');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
