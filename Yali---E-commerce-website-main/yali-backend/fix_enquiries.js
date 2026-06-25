const { pool } = require('./db');
async function run() {
  try {
    // Fix vehicle category
    const [r1] = await pool.query(
      "UPDATE enquiries SET type='vehicle' WHERE (type='' OR type IS NULL) AND (category LIKE '%Automobile%' OR category LIKE '%Vehicle%' OR category LIKE '%Wheeler%')"
    );
    console.log('Vehicle updated:', r1.affectedRows);

    // Fix property category
    const [r2] = await pool.query(
      "UPDATE enquiries SET type='property' WHERE (type='' OR type IS NULL) AND (category LIKE '%Real Estate%' OR category LIKE '%Land%' OR category LIKE '%Property%' OR category LIKE '%Plot%')"
    );
    console.log('Property updated:', r2.affectedRows);

    // Fix remaining to general
    const [r3] = await pool.query(
      "UPDATE enquiries SET type='general' WHERE type='' OR type IS NULL"
    );
    console.log('General updated:', r3.affectedRows);

    // Also fix cta_action empty strings
    await pool.query("UPDATE enquiries SET cta_action='enquiry' WHERE cta_action='' OR cta_action IS NULL");

    const [rows] = await pool.query('SELECT id, category, type, cta_action, full_name, status FROM enquiries');
    console.log('All enquiries:', JSON.stringify(rows, null, 2));
  } catch(e) {
    console.log('Error:', e.message);
  }
  process.exit(0);
}
run();
