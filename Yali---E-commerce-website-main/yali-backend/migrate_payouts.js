require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log("Adding bank_details to vendor_details...");
    await connection.query("ALTER TABLE vendor_details ADD COLUMN bank_details JSON NULL;");
    console.log("Added bank_details");
  } catch (e) {
    console.log("Could not add bank_details (might already exist)", e.message);
  }

  try {
    console.log("Creating payout_requests table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payout_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        transaction_id VARCHAR(255) NULL,
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Created payout_requests");
  } catch (e) {
    console.log("Could not create payout_requests", e.message);
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate();
