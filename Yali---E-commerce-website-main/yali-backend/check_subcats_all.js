const { pool } = require('./db.js');
async function run() {
  const [rows] = await pool.query('SELECT category_value, filter_tag, label FROM sub_categories');
  console.log(rows);
  process.exit(0);
}
run().catch(console.error);
