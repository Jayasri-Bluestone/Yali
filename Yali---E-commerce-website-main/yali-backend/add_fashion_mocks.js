const { pool } = require('./db.js');

async function insertMocks() {
  const products = [
    {
      name: 'Classic White Linen Shirt',
      description: 'Premium tailored linen shirt for men.',
      price: 1299.00,
      original_price: 1999.00,
      stock: 50,
      badge: 'Bestseller',
      category: 'fashion',
      sub_category: 'men',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'Yali Tailors', material: '100% Linen', fit: 'Slim Fit' })
    },
    {
      name: 'Floral Print Midi Dress',
      description: 'Beautiful summer dress for women.',
      price: 1599.00,
      original_price: 2499.00,
      stock: 40,
      badge: 'New Arrival',
      category: 'fashion',
      sub_category: 'women',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'Urban Vogue', material: 'Cotton Blend', occasion: 'Casual' })
    },
    {
      name: 'Boys Denim Jacket',
      description: 'Stylish and comfortable denim jacket for kids.',
      price: 999.00,
      original_price: 1499.00,
      stock: 30,
      badge: 'Trending',
      category: 'fashion',
      sub_category: 'kids',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1519238398462-8178d30e3860?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'TinyTots', ageGroup: '5-7 Years', material: 'Denim' })
    },
    {
      name: 'Designer Silk Saree',
      description: 'Handwoven traditional silk saree with zari border.',
      price: 5999.00,
      original_price: 8500.00,
      stock: 15,
      badge: 'Premium',
      category: 'fashion',
      sub_category: 'ethnic',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1610189014167-160fa1402245?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'Heritage Weaves', fabric: 'Pure Silk', work: 'Zari Embroidery' })
    },
    {
      name: 'Formal Trousers',
      description: 'Classic fit formal trousers for office wear.',
      price: 1499.00,
      original_price: 2199.00,
      stock: 60,
      badge: 'Office Wear',
      category: 'fashion',
      sub_category: 'western',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1594938298596-ec6520b72cda?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'Corporate Edge', style: 'Formal', material: 'Poly Viscose' })
    },
    {
      name: 'Leather Crossbody Bag',
      description: 'Genuine leather bag with adjustable strap.',
      price: 2499.00,
      original_price: 3599.00,
      stock: 25,
      badge: 'Genuine Leather',
      category: 'fashion',
      sub_category: 'fashion-accessories',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'LeatherCrafters', type: 'Bag', material: '100% Genuine Leather' })
    },
    {
      name: 'Summer Collection Launch Set',
      description: 'Exclusive first look at our Summer 2026 collection.',
      price: 3999.00,
      original_price: 4999.00,
      stock: 10,
      badge: 'Exclusive',
      category: 'fashion',
      sub_category: 'new-arrivals',
      cta_action: 'buy_now',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop',
      metadata: JSON.stringify({ brand: 'Yali Exclusives', collection: 'Summer Breeze', season: 'Summer 2026' })
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
    console.log('Successfully inserted mock fashion products!');
  } catch (err) {
    console.error('Error inserting mocks:', err);
  } finally {
    process.exit(0);
  }
}

insertMocks();
