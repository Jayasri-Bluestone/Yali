const { pool } = require('./db.js');

async function run() {
  const [rows] = await pool.query('SELECT label, filter_tag, link_url FROM sub_categories WHERE category_value="real-estate"');
  console.log(rows);
  
  // Actually, let's fix the link_url so that they point to /search?category={filter_tag} correctly!
  for (const r of rows) {
    let newLink = `/search?category=${r.filter_tag}`;
    // keep sell and services as they were
    if (r.label === 'Sell') newLink = '/sell';
    if (r.label === 'Property Services') newLink = '/services';
    
    await pool.query('UPDATE sub_categories SET link_url=? WHERE category_value="real-estate" AND label=?', [newLink, r.label]);
  }
  
  console.log('Fixed link_urls');
  process.exit(0);
}
run().catch(console.error);
