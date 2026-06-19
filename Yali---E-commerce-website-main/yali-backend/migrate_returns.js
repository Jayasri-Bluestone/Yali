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
    console.log("Creating return_requests table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS return_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        item_id INT NOT NULL,
        customer_id INT NOT NULL,
        vendor_id INT NULL,
        reason TEXT NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected', 'Received') DEFAULT 'Pending',
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES order_items(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Created return_requests table");

    // Also update order_items item_status ENUM to include 'Return Requested', 'Return Approved', 'Returned'
    // Let's modify the column enum values.
    console.log("Updating order_items item_status ENUM...");
    await connection.query(`
      ALTER TABLE order_items 
      MODIFY COLUMN item_status ENUM('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Returned') DEFAULT 'Pending';
    `);
    console.log("Updated order_items item_status ENUM");

  } catch (e) {
    console.log("Could not create return_requests table or update ENUM", e.message);
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate();
