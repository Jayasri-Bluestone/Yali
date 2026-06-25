const { pool } = require('./db.js');

async function insertMocks() {
  const products = [
    {
      name: 'Organic Farm Tomatoes',
      description: 'Freshly picked organic tomatoes, pesticide free.',
      price: 45.00,
      original_price: 60.00,
      stock: 100,
      badge: 'Bestseller',
      category: 'organic-products',
      sub_category: 'vegetables',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1kg', farming: 'Certified Organic', shelfLife: '7 Days' })
    },
    {
      name: 'Premium Apples (Shimla)',
      description: 'Crisp and sweet apples directly from Shimla orchards.',
      price: 250.00,
      original_price: 300.00,
      stock: 50,
      badge: 'Fresh',
      category: 'organic-products',
      sub_category: 'fruits',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1kg', origin: 'Shimla', shelfLife: '10 Days' })
    },
    {
      name: 'Organic Toor Dal',
      description: 'Unpolished and rich in protein toor dal.',
      price: 180.00,
      original_price: 220.00,
      stock: 200,
      badge: 'High Protein',
      category: 'organic-products',
      sub_category: 'grocery',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1585996985558-8120b0805176?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1kg', brand: 'Nature Farms', certification: 'USDA Organic', expiryDate: '12 Months' })
    },
    {
      name: 'Ashwagandha Root Powder',
      description: 'Pure herbal ashwagandha for stress relief.',
      price: 350.00,
      original_price: 400.00,
      stock: 30,
      badge: 'Immunity',
      category: 'organic-products',
      sub_category: 'herbal',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1611078449902-6b94e3579b36?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '200g', ingredients: '100% Ashwagandha', benefits: 'Stress relief, Energy' })
    },
    {
      name: 'Aloe Vera Neem Soap',
      description: 'Handmade organic soap for sensitive skin.',
      price: 120.00,
      original_price: 150.00,
      stock: 80,
      badge: 'Handmade',
      category: 'organic-products',
      sub_category: 'personal-care',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '125g', ingredients: 'Aloe Vera, Neem Oil', skinType: 'All Skin Types' })
    },
    {
      name: 'Bio-Enzyme Floor Cleaner',
      description: 'Natural citrus-based floor cleaner.',
      price: 199.00,
      original_price: 250.00,
      stock: 40,
      badge: 'Eco-Friendly',
      category: 'organic-products',
      sub_category: 'home-care',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1584820927500-848c4ea78e47?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1 Liter', ingredients: 'Citrus Peels, Water', usage: 'Mix 1 cap in half bucket of water' })
    },
    {
      name: 'Farm Fresh Milk Subscription',
      description: 'A2 Cow Milk delivered straight from farm.',
      price: 90.00,
      original_price: 110.00,
      stock: 100,
      badge: 'Farm Fresh',
      category: 'organic-products',
      sub_category: 'farm-to-home',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ weight: '1 Liter', farmName: 'Happy Cows Dairy', harvestDate: 'Daily Morning' })
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
    console.log('Successfully inserted mock organic products!');
  } catch (err) {
    console.error('Error inserting mocks:', err);
  } finally {
    process.exit(0);
  }
}

insertMocks();
