const { pool } = require('./db.js');

async function run() {
  const [rows] = await pool.query('SELECT id, name, category, sub_category FROM products WHERE category="RealEstate" OR category="real-estate"');
  console.log(rows);
  process.exit(0);
}
run().catch(console.error);
