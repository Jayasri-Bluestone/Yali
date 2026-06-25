const { pool } = require('./db.js');

async function run() {
  await pool.query("UPDATE sub_categories SET filter_tag='Commercial' WHERE category_value='real-estate' AND filter_tag='commercial'");
  await pool.query("UPDATE sub_categories SET filter_tag='AgriculturalLand' WHERE category_value='real-estate' AND filter_tag='agricultural'");
  await pool.query("UPDATE sub_categories SET filter_tag='Rentals' WHERE category_value='real-estate' AND filter_tag='rent'");
  await pool.query("UPDATE sub_categories SET filter_tag='VillasApartments' WHERE category_value='real-estate' AND filter_tag='residential'");
  console.log('Updated DB filter tags');
  process.exit(0);
}
run().catch(console.error);
