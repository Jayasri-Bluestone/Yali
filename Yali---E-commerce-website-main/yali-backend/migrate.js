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
    console.log("Dropping assigned_vendor_id from orders...");
    // Foreign key might be named orders_ibfk_2, check if it fails
    try {
      await connection.query('ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_2;');
    } catch(e) { console.log(e.message) }
    await connection.query('ALTER TABLE orders DROP COLUMN assigned_vendor_id;');
    console.log("Dropped assigned_vendor_id");
  } catch (e) {
    console.log("Could not drop assigned_vendor_id (might not exist)", e.message);
  }

  try {
    console.log("Adding columns to order_items...");
    await connection.query("ALTER TABLE order_items ADD COLUMN vendor_id INT NULL;");
    await connection.query("ALTER TABLE order_items ADD COLUMN item_status ENUM('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned') DEFAULT 'Pending';");
    await connection.query("ALTER TABLE order_items ADD COLUMN tracking_number VARCHAR(100) DEFAULT '';");
    await connection.query("ALTER TABLE order_items ADD FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL;");
    console.log("Added columns to order_items");
  } catch (e) {
    console.log("Could not add columns to order_items (might already exist)", e.message);
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate();
