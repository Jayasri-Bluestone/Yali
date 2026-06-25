const { pool } = require('./db.js');
async function run() {
  await pool.query('UPDATE sub_categories SET filter_tag="Residential", link_url="/search?category=Residential" WHERE label="Residential Properties"');
  await pool.query('UPDATE products SET sub_category="Residential" WHERE sub_category="VillasApartments"');
  console.log("Updated Residential subcategory tags");
  process.exit(0);
}
run().catch(console.error);
