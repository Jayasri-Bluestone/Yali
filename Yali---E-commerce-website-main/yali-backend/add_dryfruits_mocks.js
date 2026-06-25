const { pool } = require('./db.js');

async function insertMocks() {
  const products = [
    {
      name: 'Premium California Almonds',
      description: 'High quality big size almonds.',
      price: 850.00,
      original_price: 1000.00,
      stock: 50,
      badge: 'Premium',
      category: 'dry-fruits',
      sub_category: 'nuts',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1kg', origin: 'California, USA', grade: 'W320' })
    },
    {
      name: 'Seedless Afghan Black Raisins',
      description: 'Naturally sweet and large black raisins.',
      price: 450.00,
      original_price: 550.00,
      stock: 40,
      badge: 'Bestseller',
      category: 'dry-fruits',
      sub_category: 'dried-fruits',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '500g', origin: 'Afghanistan', shelfLife: '12 Months' })
    },
    {
      name: 'Roasted Pumpkin Seeds',
      description: 'Lightly salted and roasted healthy seeds.',
      price: 350.00,
      original_price: 400.00,
      stock: 30,
      badge: 'Healthy',
      category: 'dry-fruits',
      sub_category: 'seeds',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1502741126161-b048400d085d?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '250g', type: 'Roasted', benefits: 'High Protein, Good for Heart' })
    },
    {
      name: 'Creamy Peanut Butter',
      description: '100% natural peanut butter without added sugar.',
      price: 299.00,
      original_price: 350.00,
      stock: 60,
      badge: 'No Sugar',
      category: 'dry-fruits',
      sub_category: 'nut-butters',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1584852924151-5121b6d05908?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1kg', ingredients: 'Roasted Peanuts', shelfLife: '6 Months' })
    },
    {
      name: 'Festive Delight Gift Pack',
      description: 'A beautiful combo of 4 premium dry fruits.',
      price: 1500.00,
      original_price: 1800.00,
      stock: 20,
      badge: 'Gift Choice',
      category: 'dry-fruits',
      sub_category: 'gift-packs',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1511221762142-ff264b3da5cb?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1kg (4 x 250g)', items: 'Almonds, Cashews, Pistachios, Raisins', occasion: 'Festive' })
    },
    {
      name: 'Certified Organic Walnuts',
      description: 'Premium shelled organic walnuts.',
      price: 1200.00,
      original_price: 1500.00,
      stock: 15,
      badge: 'Organic',
      category: 'dry-fruits',
      sub_category: 'premium-dry-fruits',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '500g', certification: 'USDA Organic', origin: 'Kashmir' })
    },
    {
      name: 'Immunity Booster Mix',
      description: 'A special mix of seeds and berries to boost immunity.',
      price: 600.00,
      original_price: 750.00,
      stock: 25,
      badge: 'Immunity',
      category: 'dry-fruits',
      sub_category: 'health',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '500g', targetIssue: 'Low Immunity', dosage: '2 tablespoons daily' })
    }
  ];

  try {
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (name, description, price, original_price, stock, badge, category, sub_category, cta_action, image, metadata, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [p.name, p.description, p.price, p.original_price, p.stock, p.badge, p.category, p.sub_category, p.cta_action, p.image, p.metadata]
      );
    }
    console.log('Successfully inserted mock dry fruits!');
  } catch (err) {
    console.error('Error inserting mocks:', err);
  } finally {
    process.exit(0);
  }
}

insertMocks();
