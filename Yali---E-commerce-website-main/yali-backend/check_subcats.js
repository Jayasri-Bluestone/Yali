const { pool } = require('./db.js');
async function run() {
  const [rows] = await pool.query('SELECT label, filter_tag, link_url FROM sub_categories WHERE category_value="real-estate"');
  console.log(rows);
  process.exit(0);
}
run().catch(console.error);
