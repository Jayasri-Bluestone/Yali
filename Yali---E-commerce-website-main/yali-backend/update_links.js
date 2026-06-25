const { pool } = require('./db.js');
async function run() {
  await pool.query('UPDATE sub_categories SET link_url="/page/sell" WHERE link_url="/sell"');
  await pool.query('UPDATE sub_categories SET link_url="/page/sell-vehicle" WHERE link_url="/sell-vehicle"');
  await pool.query('UPDATE sub_categories SET link_url="/page/services" WHERE link_url="/services"');
  console.log("Updated subcategory static page links");
  process.exit(0);
}
run().catch(console.error);
