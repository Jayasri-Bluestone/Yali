const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to MySQL Hostinger Database successfully!');

    // 1. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        wallet DECIMAL(10,2) DEFAULT 0.00,
        role ENUM('customer', 'admin', 'vendor') DEFAULT 'customer',
        status ENUM('active', 'disabled', 'pending_approval') DEFAULT 'active',
        managed_category VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create Vendor Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendor_details (
        user_id INT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        store_description TEXT,
        tax_id VARCHAR(100) NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2.5 Create Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        color_gradient VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id VARCHAR(100) UNIQUE NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) NULL,
        image MEDIUMTEXT,
        stock INT DEFAULT 0,
        badge VARCHAR(50) NULL,
        category VARCHAR(100) NOT NULL,
        images MEDIUMTEXT,
        return_policy VARCHAR(255) DEFAULT '7 Days Replacement',
        delivery_days INT DEFAULT 3,
        rating DECIMAL(3,2) DEFAULT 5.00,
        reviews_count INT DEFAULT 0,
        vendor_id INT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(50) PRIMARY KEY,
        customer_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) NOT NULL,
        shipping DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned') DEFAULT 'Pending',
        tracking_number VARCHAR(100) DEFAULT '',
        assigned_vendor_id INT NULL,
        category VARCHAR(100) NULL,
        expected_delivery_date DATE NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_vendor_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        image VARCHAR(500),
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create Coupons Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        type ENUM('percentage', 'fixed') DEFAULT 'percentage',
        value DECIMAL(10,2) NOT NULL,
        min_order DECIMAL(10,2) DEFAULT 0.00,
        expiry DATE NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query("ALTER TABLE coupons ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add status to coupons:', e.message);
    }
    try {
      await connection.query("ALTER TABLE products ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add status to products:', e.message);
    }
    try {
      await connection.query("ALTER TABLE products ADD COLUMN unique_id VARCHAR(100) UNIQUE NULL");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add unique_id to products:', e.message);
    }
    try {
      await connection.query("ALTER TABLE products MODIFY COLUMN image MEDIUMTEXT");
      await connection.query("ALTER TABLE products MODIFY COLUMN images MEDIUMTEXT");
    } catch (e) {
      console.warn('Could not modify image columns in products:', e.message);
    }
    try {
      await connection.query("ALTER TABLE orders ADD COLUMN expected_delivery_date DATE NULL");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add expected_delivery_date to orders:', e.message);
    }
    try {
      await connection.query("ALTER TABLE products ADD COLUMN images TEXT");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add images to products:', e.message);
    }
    try {
      await connection.query("ALTER TABLE products ADD COLUMN return_policy VARCHAR(255) DEFAULT '7 Days Replacement'");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add return_policy to products:', e.message);
    }
    try {
      await connection.query("ALTER TABLE products ADD COLUMN delivery_days INT DEFAULT 3");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add delivery_days to products:', e.message);
    }
    try {
      // Inline migration: Assign sequential category-based unique IDs to all existing products
      const [existingProds] = await connection.query('SELECT id, category, unique_id FROM products');
      for (const row of existingProds) {
        let prefix = 'PRD';
        if (row.category === 'real-estate') prefix = 'RE';
        else if (row.category === 'properties') prefix = 'PR';
        else if (row.category === 'bike-accessories') prefix = 'BA';
        else if (row.category === 'car-accessories') prefix = 'CR';
        else if (row.category === 'organic-groceries') prefix = 'OG';
        else if (row.category) prefix = row.category.substring(0, 2).toUpperCase();

        const generatedUniqueId = `${prefix}-${String(row.id).padStart(6, '0')}`;
        
        // Update if it doesn't match the new format
        if (row.unique_id !== generatedUniqueId) {
          await connection.query('UPDATE products SET unique_id = ? WHERE id = ?', [generatedUniqueId, row.id]);
        }
      }
    } catch (e) {
      console.warn('Could not migrate existing products to have unique_id:', e.message);
    }
    try {
      await connection.query("ALTER TABLE banners ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add status to banners:', e.message);
    }
    try {
      await connection.query("ALTER TABLE banners MODIFY COLUMN bg_image MEDIUMTEXT");
    } catch (e) {
      console.warn('Could not modify bg_image column in banners:', e.message);
    }
    try {
      await connection.query("ALTER TABLE videos ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add status to videos:', e.message);
    }
    try {
      await connection.query("ALTER TABLE ui_cards ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Could not add status to ui_cards:', e.message);
    }

    // 7. Create Banners Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        cta VARCHAR(50) DEFAULT 'Explore Now',
        discount VARCHAR(50),
        bg_image MEDIUMTEXT,
        gradient VARCHAR(100),
        category VARCHAR(100) NULL,
        status ENUM('active', 'inactive') DEFAULT 'active'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Create Wallet Transactions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id VARCHAR(50) PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Create Videos Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_title VARCHAR(100) NOT NULL,
        description TEXT,
        url VARCHAR(500) NOT NULL,
        duration VARCHAR(50) DEFAULT '0:15',
        category VARCHAR(100) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Create UI Cards Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ui_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section ENUM('category_card', 'trust_card', 'promo_card') NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        icon VARCHAR(100),
        image_url VARCHAR(500),
        link_url VARCHAR(255),
        color_gradient VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10.5 Create Page Sections Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS page_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id VARCHAR(50) NOT NULL,
        section_type VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        display_order INT DEFAULT 0,
        content JSON,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Create Cart Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        selected_variant VARCHAR(255) NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 12. Create Wishlist Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 13. Create Visitor Locations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visitor_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        city VARCHAR(255),
        country VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 14. Create Product Reviews Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        media MEDIUMTEXT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query("ALTER TABLE product_reviews MODIFY media MEDIUMTEXT NULL");
    } catch (e) {
      console.warn('Could not modify media to MEDIUMTEXT in product_reviews:', e.message);
    }

    console.log('Tables verified/created successfully.');

    // Seed data if empty
    await seedData(connection);

  } catch (err) {
    console.error('\n======================================================================');
    console.error('❌ DATABASE CONNECTION ERROR');
    console.error('======================================================================');
    console.error('Could not connect to Hostinger MySQL Database.');
    console.error('Error Message:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n👉 HOW TO FIX (HOSTINGER REMOTE ACCESS):');
      console.error('1. Log in to your Hostinger Control Panel.');
      console.error('2. Navigate to Databases -> Remote MySQL.');
      console.error('3. Add your current IP address (shown in error above or resolve via checkip) to the whitelist.');
      console.error('   Alternative: Enter "%" in the IP field to allow connections from any computer (less secure, good for testing).');
      console.error('4. Make sure "Database" dropdown is set to "u287260207_yali_db".');
      console.error('\n👉 TO TEST LOCALLY WITHOUT REMOTE HOSTINGER ACCESS:');
      console.error('1. Start a local MySQL server (like XAMPP or MySQL Installer).');
      console.error('2. Update your .env file in "yali-backend/.env" to use local details:');
      console.error('   DB_HOST=localhost');
      console.error('   DB_USER=root');
      console.error('   DB_PASSWORD=your_local_password');
      console.error('   DB_NAME=u287260207_yali_db (or create a local test database)');
    }
    console.error('======================================================================\n');
    throw err;
  } finally {
    if (connection) connection.release();
  }
}

async function seedData(connection) {
  // Check if users table is empty
  const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
  if (userCount[0].count === 0) {
    console.log('Seeding default users...');
    const hashedCustPass = await bcrypt.hash('password123', 10);
    const hashedAdminPass = await bcrypt.hash('adminpassword', 10);
    const hashedVendorPass = await bcrypt.hash('vendorpassword', 10);

    // Insert Users
    await connection.query(`
      INSERT INTO users (name, email, phone, password, wallet, role, status, managed_category) VALUES
      ('John Doe', 'john@example.com', '+1 (555) 123-4567', ?, 150.00, 'customer', 'active', NULL),
      ('Alice Smith', 'alice@example.com', '+1 (555) 987-6543', ?, 0.00, 'customer', 'active', NULL),
      ('Admin User', 'admin@yali.com', '+1 (555) 000-1111', ?, 1000.00, 'admin', 'active', NULL),
      ('Real Estate Manager', 'admin_re@yali.com', '+1 (555) 222-3333', ?, 500.00, 'admin', 'active', 'real-estate'),
      ('Groceries Manager', 'admin_groceries@yali.com', '+1 (555) 444-5555', ?, 500.00, 'admin', 'active', 'organic-groceries'),
      ('YALI Properties Vendor', 'vendor@yali.com', '+1 (555) 999-8888', ?, 0.00, 'vendor', 'active', NULL);
    `, [hashedCustPass, hashedCustPass, hashedAdminPass, hashedAdminPass, hashedAdminPass, hashedVendorPass]);

    // Insert Vendor details for vendor user (ID is 6 in auto-increment if started from 1)
    const [vendors] = await connection.query("SELECT id FROM users WHERE email = 'vendor@yali.com'");
    if (vendors[0]) {
      await connection.query(`
        INSERT INTO vendor_details (user_id, company_name, store_description, tax_id, status) VALUES
        (?, 'YALI Real Estate & Farm Products Ltd.', 'Primary vendor for properties and organic farm groceries.', 'GSTIN987654321', 'approved');
      `, [vendors[0].id]);
    }
  }

  // Check if categories table is empty
  const [categoryCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
  if (categoryCount[0].count === 0) {
    console.log('Seeding default categories...');
    await connection.query(`
      INSERT INTO categories (value, label, icon, color_gradient, status) VALUES
      ('real-estate', 'Real Estate', 'Building2', 'bg-gradient-to-br from-[#0066cc] to-[#0099ff]', 'active'),
      ('properties', 'Properties', 'Home', 'bg-gradient-to-br from-[#10b981] to-[#22d3ee]', 'active'),
      ('bike-accessories', 'Bike Accessories', 'Bike', 'bg-gradient-to-br from-[#22d3ee] to-[#0066cc]', 'active'),
      ('car-accessories', 'Car Accessories', 'Car', 'bg-gradient-to-br from-[#8b5cf6] to-[#0066cc]', 'active'),
      ('organic-groceries', 'Organic Groceries', 'Leaf', 'bg-gradient-to-br from-[#f59e0b] to-[#10b981]', 'active');
    `);
  }

  // Check if products table is empty
  const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
  if (productCount[0].count === 0) {
    console.log('Seeding default products...');
    const [vendorRow] = await connection.query("SELECT id FROM users WHERE email = 'vendor@yali.com'");
    const vendorId = vendorRow[0] ? vendorRow[0].id : null;

    const initialProducts = [
      {
        unique_id: 'YALI-PROD-0001',
        name: 'Eco-Friendly Smart Villa',
        description: 'Modern 3 BHK eco-friendly villa equipped with solar panels, smart automated systems, and a green garden landscape.',
        price: 250000.00,
        original_price: 320000.00,
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&h=500&fit=crop',
        stock: 5,
        badge: 'Popular',
        category: 'real-estate',
        rating: 4.8,
        reviews_count: 24
      },
      {
        unique_id: 'YALI-PROD-0002',
        name: 'Premium City Center Apartment',
        description: 'Luxury 2 BHK apartment in the heart of downtown. Access to rooftop pool, fitness center, and 24/7 security concierge.',
        price: 180000.00,
        original_price: 200000.00,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=500&fit=crop',
        stock: 8,
        badge: 'New',
        category: 'properties',
        rating: 4.9,
        reviews_count: 15
      },
      {
        unique_id: 'YALI-PROD-0003',
        name: 'Suburban Farm Land (1 Acre)',
        description: 'Fertile suburban farm land perfect for organic cultivation, weekend farmhouse development, or long-term investment holding.',
        price: 95000.00,
        original_price: 110000.00,
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=500&fit=crop',
        stock: 3,
        badge: 'Investment',
        category: 'real-estate',
        rating: 4.7,
        reviews_count: 10
      },
      {
        unique_id: 'YALI-PROD-0004',
        name: 'Pure Turmeric Powder - Organic (500g)',
        description: '100% natural, hand-picked, pesticide-free organic turmeric powder sourced from local co-op farms. Rich in curcumin.',
        price: 6.99,
        original_price: 8.99,
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=500&fit=crop',
        stock: 120,
        badge: 'Best Seller',
        category: 'organic-groceries',
        rating: 4.9,
        reviews_count: 85
      },
      {
        unique_id: 'YALI-PROD-0005',
        name: 'Natural Sugarcane Jaggery Block (1kg)',
        description: 'Chemical-free natural sugarcane jaggery block. Perfect healthy substitute for refined white sugar in sweets and beverages.',
        price: 4.49,
        original_price: 5.99,
        image: 'https://images.unsplash.com/photo-1608408881647-862804b4c73d?w=500&h=500&fit=crop',
        stock: 80,
        badge: 'Organic',
        category: 'organic-groceries',
        rating: 4.8,
        reviews_count: 42
      },
      {
        unique_id: 'YALI-PROD-0006',
        name: 'Carbon Fiber Bike Helmet',
        description: 'Ultra-lightweight aerodynamic carbon fiber bicycle helmet with adjustable dial fit system and high impact absorption.',
        price: 45.00,
        original_price: 65.00,
        image: 'https://images.unsplash.com/photo-1557166983-5939644443a0?w=500&h=500&fit=crop',
        stock: 12,
        badge: 'Safety First',
        category: 'bike-accessories',
        rating: 4.6,
        reviews_count: 18
      },
      {
        unique_id: 'YALI-PROD-0007',
        name: 'Premium Memory Foam Car Seat Cushion',
        description: 'Ergonomically designed memory foam cushion to reduce lumbar stress during long car journeys. Breathable 3D mesh cover.',
        price: 24.99,
        original_price: 34.99,
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&h=500&fit=crop',
        stock: 35,
        badge: '10% OFF',
        category: 'car-accessories',
        rating: 4.5,
        reviews_count: 30
      },
      {
        unique_id: 'YALI-PROD-0008',
        name: 'Waterproof Bike Saddle Bag',
        description: 'Hard-shell waterproof bicycle saddle bag with tail light hook attachment. Fits keys, repair toolkits, and phone securely.',
        price: 15.99,
        original_price: 22.00,
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&h=500&fit=crop',
        stock: 50,
        badge: 'Trending',
        category: 'bike-accessories',
        rating: 4.4,
        reviews_count: 22
      },
      {
        unique_id: 'YALI-PROD-0009',
        name: 'All-Weather Rubber Car Floor Mats',
        description: 'Heavy-duty 4-piece rubber car mats built to trap water, mud, dirt, and spills. Easily trimmable to fit any vehicle type.',
        price: 39.99,
        original_price: 49.99,
        image: 'https://images.unsplash.com/photo-1611245781356-0744743fc8f2?w=500&h=500&fit=crop',
        stock: 15,
        badge: 'Best Value',
        category: 'car-accessories',
        rating: 4.7,
        reviews_count: 14
      }
    ];

    for (const prod of initialProducts) {
      await connection.query(`
        INSERT INTO products (unique_id, name, description, price, original_price, image, stock, badge, category, rating, reviews_count, vendor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [prod.unique_id, prod.name, prod.description, prod.price, prod.original_price, prod.image, prod.stock, prod.badge, prod.category, prod.rating, prod.reviews_count, vendorId]);
    }
  }

  // Check if banners table is empty
  const [bannerCount] = await connection.query('SELECT COUNT(*) as count FROM banners');
  if (bannerCount[0].count === 0) {
    console.log('Seeding default banners...');
    await connection.query(`
      INSERT INTO banners (title, subtitle, cta, discount, bg_image, gradient, category) VALUES
      ('Dream Properties', 'Premium Land & Apartments - Up to 30% OFF', 'Explore Now', '30% OFF', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop', 'from-[#0066cc]/80 to-[#0099ff]/80', 'real-estate'),
      ('Organic & Fresh', 'Pure Turmeric, Jaggery & Farm Products - Special Discount', 'Shop Organic', '25% OFF', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=400&fit=crop', 'from-[#10b981]/80 to-[#22d3ee]/80', 'organic-groceries'),
      ('Auto Accessories', 'Premium Bike & Car Accessories - Limited Time Offer', 'Grab Deals', '40% OFF', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop', 'from-[#22d3ee]/80 to-[#0066cc]/80', NULL);
    `);
  }

  // Check if coupons table is empty
  const [couponCount] = await connection.query('SELECT COUNT(*) as count FROM coupons');
  if (couponCount[0].count === 0) {
    console.log('Seeding default coupons...');
    await connection.query(`
      INSERT INTO coupons (code, type, value, min_order, expiry, status) VALUES
      ('SAVE10', 'percentage', 10.00, 50.00, '2026-12-31', 'active'),
      ('SAVE20', 'percentage', 20.00, 100.00, '2026-12-31', 'active');
    `);
  }

  // Check if videos table is empty
  const [videoCount] = await connection.query('SELECT COUNT(*) as count FROM videos');
  if (videoCount[0].count === 0) {
    console.log('Seeding default videos...');
    await connection.query(`
      INSERT INTO videos (title, short_title, description, url, duration, category) VALUES
      ('Luxury Modern Villa Tour', 'Luxury Villa', 'Take an exterior walk-in tour of our smart, solar-equipped residential villas.', 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-44141-large.mp4', '0:15', 'real-estate'),
      ('Interior Living Spaces & Comfort', 'Living Spaces', 'Explore the fireplace and open-concept lounges of our premium properties.', 'https://assets.mixkit.co/videos/preview/mixkit-cozy-living-room-with-active-fireplace-43093-large.mp4', '0:09', 'real-estate'),
      ('Suburban Family Neighborhoods', 'Suburban Homes', 'Browse beautiful family homes situated in secure, green suburban communities.', 'https://assets.mixkit.co/videos/preview/mixkit-residential-house-with-a-front-yard-44139-large.mp4', '0:12', 'real-estate'),
      ('Closing Deal & Key Handover', 'Key Handover', 'Quick walkthrough of final documentation and secure property handover.', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-real-estate-agent-holding-house-keys-40226-large.mp4', '0:14', 'properties'),
      ('Acre Cabin Property Highlights', 'Cabin Retreats', 'Snow-capped retreat cabins built in scenic countryside and holiday locations.', 'https://assets.mixkit.co/videos/preview/mixkit-wooden-house-in-the-snow-at-sunset-41617-large.mp4', '0:10', 'properties'),
      ('Modern Commercial Offices', 'Office Spaces', 'Premium fully-serviced office desks and conference rooms in commercial business hubs.', 'https://assets.mixkit.co/videos/preview/mixkit-camera-moving-through-an-empty-office-space-40228-large.mp4', '0:11', 'properties'),
      ('Helmet Safety & Forest Trails', 'Safety Helmets', 'Aerodynamic carbon fiber helmet testing in demanding single-track settings.', 'https://assets.mixkit.co/videos/preview/mixkit-cyclist-riding-on-a-road-in-the-forest-41604-large.mp4', '0:11', 'bike-accessories'),
      ('City Commuting & Saddle Bags Guide', 'Commuter Bags', 'Waterproof saddle bags demonstration for daily metropolitan biking trips.', 'https://assets.mixkit.co/videos/preview/mixkit-riding-a-bicycle-on-a-city-street-41605-large.mp4', '0:08', 'bike-accessories'),
      ('Bicycle Maintenances & Repairs', 'Bicycle Care', 'Learn to swap bike tyres and fit accessory parts with ease.', 'https://assets.mixkit.co/videos/preview/mixkit-man-hands-installing-a-wheel-on-a-bicycle-41603-large.mp4', '0:14', 'bike-accessories'),
      ('Premium Polish & Shine Care', 'Shine Polish', 'Step-by-step application instructions for deep-gloss paint restoration polish.', 'https://assets.mixkit.co/videos/preview/mixkit-young-man-cleaning-his-car-40277-large.mp4', '0:12', 'car-accessories'),
      ('All-Weather Floor Protection', 'Floor Mats', 'Heavy duty rubber mat setup and trim guide for sedans and SUVs.', 'https://assets.mixkit.co/videos/preview/mixkit-driving-a-car-on-a-highway-during-sunset-41611-large.mp4', '0:14', 'car-accessories'),
      ('Windshield Wipers & Winter Gears', 'Winter Accessories', 'Equip your car with durable all-weather wipers and winter safety modifications.', 'https://assets.mixkit.co/videos/preview/mixkit-car-windshield-wipers-sweeping-away-rain-41608-large.mp4', '0:12', 'car-accessories'),
      ('Sourcing Spices & Fresh Produce', 'Farm Staples', 'Organic farmer collections, cleaning, and packing direct farm staples.', 'https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-in-a-crate-in-the-kitchen-40284-large.mp4', '0:15', 'organic-groceries'),
      ('Fresh Milk & Cooking Guide', 'Milk & Cooking', 'Pure farm organic milk and cooking ideas using direct organic ingredients.', 'https://assets.mixkit.co/videos/preview/mixkit-pouring-fresh-milk-into-a-glass-on-a-wooden-table-40294-large.mp4', '0:11', 'organic-groceries'),
      ('Hand-Picked Fresh Berries', 'Fresh Berries', 'Select direct farm-fresh organic strawberries and fruits delivered in cold-chains.', 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-fresh-organic-strawberries-40292-large.mp4', '0:13', 'organic-groceries');
    `);
  }

  // Check if ui_cards table is empty
  const [uiCardsCount] = await connection.query('SELECT COUNT(*) as count FROM ui_cards');
  if (uiCardsCount[0].count === 0) {
    console.log('Seeding default ui_cards...');
    await connection.query(`
      INSERT INTO ui_cards (section, title, subtitle, icon, image_url, link_url, color_gradient) VALUES
      ('category_card', 'Real Estate', '', 'Building2', NULL, 'real-estate', 'from-blue-600 to-blue-400'),
      ('category_card', 'Properties', '', 'Home', NULL, 'properties', 'from-emerald-500 to-cyan-400'),
      ('category_card', 'Bike Accessories', '', 'Bike', NULL, 'bike-accessories', 'from-cyan-500 to-blue-500'),
      ('category_card', 'Car Accessories', '', 'Car', NULL, 'car-accessories', 'from-purple-600 to-indigo-400'),
      ('category_card', 'Organic', '', 'Leaf', NULL, 'organic-groceries', 'from-amber-400 to-emerald-500'),
      
      ('trust_card', 'Free Shipping', 'On orders over ₹999', 'Truck', NULL, NULL, 'from-blue-500 to-cyan-400'),
      ('trust_card', 'Secure Payment', '100% protected', 'Shield', NULL, NULL, 'from-emerald-500 to-teal-400'),
      ('trust_card', 'Easy Returns', '30-day policy', 'RotateCcw', NULL, NULL, 'from-violet-500 to-purple-400'),
      ('trust_card', 'Quality Assured', 'Verified products', 'Award', NULL, NULL, 'from-amber-500 to-orange-400'),
      ('trust_card', 'EMI Available', '0% interest plans', 'CreditCard', NULL, NULL, 'from-pink-500 to-rose-400'),
      ('trust_card', 'Gift Wrapping', 'Free on request', 'Gift', NULL, NULL, 'from-indigo-500 to-blue-400'),

      ('promo_card', 'Farm Fresh Picks', 'Chemical-free, direct from farm to your door.', '🌿', NULL, 'organic-groceries', 'from-emerald-500 via-teal-500 to-cyan-500'),
      ('promo_card', 'Dream Homes Await', 'Luxury villas, farm land, and smart living spaces.', '🏡', NULL, 'real-estate', 'from-[#0066cc] via-blue-600 to-indigo-700')
    `);
  }
}

module.exports = {
  pool,
  initDB
};
