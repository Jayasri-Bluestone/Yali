const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to DB');

    // 1. Ensure Categories Exist
    console.log('Seeding Categories...');
    await connection.query(`
      INSERT IGNORE INTO categories (value, label, icon, color_gradient, status) VALUES
      ('Real Estate', 'Real Estate', 'Building2', 'bg-gradient-to-br from-[#0066cc] to-[#0099ff]', 'active'),
      ('Automobiles', 'Automobiles', 'Car', 'bg-gradient-to-br from-[#f59e0b] to-[#10b981]', 'active')
    `);

    // 2. Insert Sub-Categories
    console.log('Seeding Sub-Categories...');
    const subCategories = [
      // Real Estate
      { cat: 'Real Estate', val: 'Property Listings', tag: 'Listings' },
      { cat: 'Real Estate', val: 'Residential', tag: 'Residential' },
      { cat: 'Real Estate', val: 'Commercial', tag: 'Commercial' },
      { cat: 'Real Estate', val: 'Agricultural Land', tag: 'Agricultural' },
      { cat: 'Real Estate', val: 'Villas & Apartments', tag: 'Villas' },
      { cat: 'Real Estate', val: 'Rentals', tag: 'Rentals' },
      
      // Automobiles
      { cat: 'Automobiles', val: 'Vehicle Listings', tag: 'Listings' },
      { cat: 'Automobiles', val: 'Bikes', tag: 'Bikes' },
      { cat: 'Automobiles', val: 'Scooters', tag: 'Scooters' },
      { cat: 'Automobiles', val: 'Cars', tag: 'Cars' },
      { cat: 'Automobiles', val: 'SUVs', tag: 'SUVs' },
      { cat: 'Automobiles', val: 'Commercial Vehicles', tag: 'Commercial' }
    ];

    for (let i = 0; i < subCategories.length; i++) {
      const sc = subCategories[i];
      const [existing] = await connection.query('SELECT id FROM sub_categories WHERE category_value = ? AND label = ?', [sc.cat, sc.val]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO sub_categories (category_value, label, filter_tag, display_order, status) VALUES (?, ?, ?, ?, ?)',
          [sc.cat, sc.val, sc.tag, i, 'active']
        );
      }
    }

    // 3. Insert Mock Products
    console.log('Seeding Products...');
    const products = [
      {
        unique_id: 'RE-RES-001',
        name: 'Luxury 3BHK Apartment in Downtown',
        description: 'A beautiful 3BHK apartment with modern amenities.',
        price: 350000.00,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80',
        category: 'Real Estate',
        sub_category: 'Residential',
        metadata: JSON.stringify({ type: 'Apartment', location: 'Downtown', area: '1500 sqft', status: 'Ready to Move' })
      },
      {
        unique_id: 'RE-COM-001',
        name: 'Prime Office Space',
        description: 'Spacious office in a tech park.',
        price: 850000.00,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80',
        category: 'Real Estate',
        sub_category: 'Commercial',
        metadata: JSON.stringify({ type: 'Office', location: 'Tech Park', area: '5000 sqft' })
      },
      {
        unique_id: 'AUTO-BIKE-001',
        name: 'Yamaha YZF R15 V4',
        description: 'Sports bike with aerodynamic design.',
        price: 215000.00,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bfce87?w=500&q=80',
        category: 'Automobiles',
        sub_category: 'Bikes',
        metadata: JSON.stringify({ location: 'Chennai', year: '2023', km: 2500, fuel: 'Petrol', type: 'Sports', cc: '155cc', dealer: 'Yamaha Motors' })
      },
      {
        unique_id: 'AUTO-CAR-001',
        name: 'Honda City ZX CVT',
        description: 'Premium sedan with advanced safety features.',
        price: 1650000.00,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80',
        category: 'Automobiles',
        sub_category: 'Cars',
        metadata: JSON.stringify({ location: 'Bangalore', year: '2023', km: 5000, fuel: 'Petrol', type: 'Sedan', cc: '1498cc', dealer: 'Honda Cars' })
      }
    ];

    for (const p of products) {
      const [existing] = await connection.query('SELECT id FROM products WHERE unique_id = ?', [p.unique_id]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO products (unique_id, name, description, price, image, category, sub_category, metadata, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, "active")',
          [p.unique_id, p.name, p.description, p.price, p.image, p.category, p.sub_category, p.metadata]
        );
      }
    }

    console.log('Done seeding.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

run();
