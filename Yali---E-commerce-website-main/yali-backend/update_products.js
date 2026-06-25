const { pool } = require('./db.js');

async function run() {
  await pool.query('UPDATE products SET category="RealEstate" WHERE category="real-estate"');
  // I will also fix "Automobiles" if there are any case issues.
  await pool.query('UPDATE products SET category="Automobiles" WHERE category="automobiles"');
  await pool.query('UPDATE products SET category="OrganicProducts" WHERE category="organic-products"');
  console.log("Updated categories");
  process.exit(0);
}
run().catch(console.error);
