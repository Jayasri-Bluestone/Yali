const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config();

const { pool, initDB } = require('./db');
const { sendOrderConfirmation, sendVendorNotification, sendStatusUpdateNotification } = require('./mail');

const app = express();
const PORT = process.env.PORT || 5010;
const JWT_SECRET = process.env.JWT_SECRET || 'yali_super_secure_secret_key_2026';

app.use(cors({
  origin: ['https://springgreen-badger-965556.hostingersite.com', 'http://localhost:5173']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Fix for Hostinger Nginx proxy stripping the /yali_api prefix
app.use((req, res, next) => {
  // If the request doesn't start with /yali_api and doesn't start with /uploads, prepend /yali_api
  if (!req.url.startsWith('/yali_api') && !req.url.startsWith('/uploads')) {
    req.url = '/yali_api' + req.url;
  }
  next();
});


// Serve uploaded files as static assets
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer storage: disk storage with original filename preserved
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.mimetype.startsWith('video') ? 'videos' : 'images';
    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm|avi|mkv/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('Only image and video files are allowed'));
  }
});

// Token Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('[AUTH] Token error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// 📁 FILE UPLOAD ROUTE
// -------------------------------------------------------------

// Generic file upload for images and videos
app.post('/yali_api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const subDir = req.file.mimetype.startsWith('video') ? 'videos' : 'images';
  const fileUrl = `http://localhost:${PORT}/uploads/${subDir}/${req.file.filename}`;

  res.json({
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image and video files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// -------------------------------------------------------------
// 🔑 AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Register Route
app.post('/yali_api/auth/register', async (req, res) => {
  const { name, email, phone, password, role, companyName, storeDescription, taxId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if user already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'vendor' ? 'vendor' : 'customer';
    const userStatus = role === 'vendor' ? 'pending_approval' : 'active';

    await connection.beginTransaction();

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword, userRole, userStatus]
    );

    const userId = userResult.insertId;

    // If registering as vendor, insert vendor details
    if (role === 'vendor' && companyName) {
      await connection.query(
        'INSERT INTO vendor_details (user_id, company_name, store_description, tax_id, status) VALUES (?, ?, ?, ?, ?)',
        [userId, companyName, storeDescription || '', taxId || null, 'pending']
      );
    }

    await connection.commit();
    res.status(201).json({ 
      message: role === 'vendor' ? 'Registration pending admin approval.' : 'Registration successful.',
      userId 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  } finally {
    if (connection) connection.release();
  }
});

// Login Route
app.post('/yali_api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Your account is disabled. Please contact support.' });
    }

    if (user.status === 'pending_approval') {
      return res.status(403).json({ error: 'Your vendor account is pending admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate Token
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        managed_category: user.managed_category 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wallet: parseFloat(user.wallet),
        role: user.role,
        status: user.status,
        managed_category: user.managed_category
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Google OAuth Route
app.post('/yali_api/auth/google', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'No access token provided' });

  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const { email, name } = response.data;
    if (!email) return res.status(400).json({ error: 'Email is required from Google' });

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, '', 'customer']
      );
      const [newUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUsers[0];
    } else {
      user = users[0];
    }

    if (user.status === 'disabled') return res.status(403).json({ error: 'Account is disabled.' });

    // Generate Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, managed_category: user.managed_category },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, wallet: parseFloat(user.wallet), role: user.role, status: user.status, managed_category: user.managed_category
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Facebook OAuth Route
app.post('/yali_api/auth/facebook', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'No access token provided' });

  try {
    // Verify token with Facebook Graph API
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
    const { email, name } = response.data;
    
    if (!email) return res.status(400).json({ error: 'Email is required from Facebook' });

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, '', 'customer']
      );
      const [newUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUsers[0];
    } else {
      user = users[0];
    }

    if (user.status === 'disabled') return res.status(403).json({ error: 'Account is disabled.' });

    // Generate Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, managed_category: user.managed_category },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, wallet: parseFloat(user.wallet), role: user.role, status: user.status, managed_category: user.managed_category
      }
    });

  } catch (error) {
    console.error('Facebook Auth Error:', error);
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
});

// Get Profile details
app.get('/yali_api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, phone, wallet, role, status, managed_category FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    let vendorData = null;

    if (user.role === 'vendor') {
      const [details] = await pool.query('SELECT * FROM vendor_details WHERE user_id = ?', [user.id]);
      if (details.length > 0) {
        vendorData = details[0];
      }
    }

    res.json({
      user: {
        ...user,
        wallet: parseFloat(user.wallet),
        vendorDetails: vendorData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// 📂 CATEGORIES ROUTES
// -------------------------------------------------------------

// Fetch Categories
app.get('/yali_api/categories', async (req, res) => {
  const { all } = req.query;
  let sql = 'SELECT * FROM categories';
  if (!all) sql += ' WHERE status = "active"';
  sql += ' ORDER BY id ASC';
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Category
app.post('/yali_api/categories', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { value, label, icon, color_gradient } = req.body;
  try {
    await pool.query(
      'INSERT INTO categories (value, label, icon, color_gradient) VALUES (?, ?, ?, ?)',
      [value, label, icon || 'Tag', color_gradient || 'from-gray-500 to-gray-600']
    );
    res.status(201).json({ message: 'Category created' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// 🛍️ PRODUCT CATALOG ROUTES
// -------------------------------------------------------------

// Fetch all products
app.get('/yali_api/products', async (req, res) => {
  const { category, q, vendor_id, all } = req.query;
  
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (!all) {
    sql += ' AND status = "active"';
  }

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (vendor_id) {
    sql += ' AND vendor_id = ?';
    params.push(parseInt(vendor_id));
  }

  if (q) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += ' ORDER BY id DESC';

  try {
    const [rows] = await pool.query(sql, params);
    const parsedRows = rows.map(r => ({
      ...r,
      price: parseFloat(r.price),
      originalPrice: r.original_price ? parseFloat(r.original_price) : null,
      rating: parseFloat(r.rating)
    }));
    res.json(parsedRows);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// Single Product details
app.get('/yali_api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const p = rows[0];
    res.json({
      ...p,
      price: parseFloat(p.price),
      originalPrice: p.original_price ? parseFloat(p.original_price) : null,
      rating: parseFloat(p.rating)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Product
app.post('/yali_api/products', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  const { name, description, price, originalPrice, image, stock, badge, category, unique_id, images, return_policy, delivery_days } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Product name, price, and category are required' });
  }

  // Category restriction check for Admins and Vendors
  if (req.user.managed_category && req.user.managed_category !== 'all') {
    if (req.user.managed_category !== category) {
      return res.status(403).json({ error: `Unauthorized: You can only create products in the '${req.user.managed_category}' category.` });
    }
  }

  const vendorId = req.user.role === 'vendor' ? req.user.id : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO products (unique_id, name, description, price, original_price, image, stock, badge, category, vendor_id, images, return_policy, delivery_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        unique_id || null,
        name,
        description || '',
        parseFloat(price),
        originalPrice ? parseFloat(originalPrice) : null,
        image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&h=500&fit=crop',
        parseInt(stock) || 0,
        badge || null,
        category,
        vendorId,
        images ? JSON.stringify(images) : null,
        return_policy || '7 Days Replacement',
        delivery_days ? parseInt(delivery_days) : 3
      ]
    );

    const newId = result.insertId;

    if (!unique_id) {
      let prefix = 'PRD';
      if (category === 'real-estate') prefix = 'RE';
      else if (category === 'properties') prefix = 'PR';
      else if (category === 'bike-accessories') prefix = 'BA';
      else if (category === 'car-accessories') prefix = 'CR';
      else if (category === 'organic-groceries') prefix = 'OG';
      else if (category) prefix = category.substring(0, 2).toUpperCase();

      const generatedUniqueId = `${prefix}-${String(newId).padStart(6, '0')}`;
      await pool.query('UPDATE products SET unique_id = ? WHERE id = ?', [generatedUniqueId, newId]);
    }

    res.status(201).json({ message: 'Product created successfully', id: newId });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Product
app.put('/yali_api/products/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const productId = req.params.id;
  const { name, description, price, originalPrice, image, stock, badge, category, unique_id, images, return_policy, delivery_days } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const prod = existing[0];

    // Ownership checks
    if (req.user.role === 'vendor' && prod.vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this product' });
    }

    // Admin/Vendor category restriction
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== prod.category || (category && req.user.managed_category !== category)) {
        return res.status(403).json({ error: `Unauthorized: You can only edit items in the '${req.user.managed_category}' category.` });
      }
    }

    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, image = ?, stock = ?, badge = ?, category = ?, unique_id = ?, images = ?, return_policy = ?, delivery_days = ? WHERE id = ?',
      [
        name || prod.name,
        description !== undefined ? description : prod.description,
        price ? parseFloat(price) : prod.price,
        originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : prod.original_price,
        image || prod.image,
        stock !== undefined ? parseInt(stock) : prod.stock,
        badge !== undefined ? badge : prod.badge,
        category || prod.category,
        unique_id !== undefined ? unique_id : prod.unique_id,
        images !== undefined ? (images ? JSON.stringify(images) : null) : prod.images,
        return_policy !== undefined ? return_policy : prod.return_policy,
        delivery_days !== undefined ? parseInt(delivery_days) : prod.delivery_days,
        productId
      ]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Product
app.delete('/yali_api/products/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const productId = req.params.id;

  try {
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });

    const prod = existing[0];

    if (req.user.role === 'vendor' && prod.vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this product' });
    }

    // Admin/Vendor category restriction
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== prod.category) {
        return res.status(403).json({ error: `Unauthorized: You can only manage items in the '${req.user.managed_category}' category.` });
      }
    }

    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk Import Products
app.post('/yali_api/products/import', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only access' });
  }

  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'List of product items is required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const item of items) {
      // Admin category scope check during import
      if (req.user.managed_category && req.user.managed_category !== 'all') {
        if (req.user.managed_category !== item.category) {
          continue; // Skip items that don't match admin category
        }
      }

      const finalUniqueId = item.unique_id || 'YALI-PROD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      await connection.query(
        'INSERT INTO products (unique_id, name, description, price, original_price, image, stock, badge, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          finalUniqueId,
          item.name,
          item.description || '',
          parseFloat(item.price),
          item.originalPrice ? parseFloat(item.originalPrice) : null,
          item.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&h=500&fit=crop',
          parseInt(item.stock) || 0,
          item.badge || null,
          item.category
        ]
      );
    }

    await connection.commit();
    res.json({ message: 'Products imported successfully (category limits applied if applicable)' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Import products error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});


// -------------------------------------------------------------
// 📦 ORDER MANAGEMENT ROUTES
// -------------------------------------------------------------

// Place an Order
app.post('/yali_api/orders', authenticateToken, async (req, res) => {
  const { address, paymentMethod, items, subtotal, tax, shipping, discount, total, appliedCoupon } = req.body;

  if (!items || items.length === 0 || !address || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required checkout details' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Fetch user data to verify status & wallet balance
    const [users] = await connection.query('SELECT wallet, status, email, name FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    const user = users[0];

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Your account is disabled' });
    }

    // 2. Validate sufficient funds for WALLET payments
    if (paymentMethod === 'WALLET') {
      if (parseFloat(user.wallet) < parseFloat(total)) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }

      // Deduct wallet balance
      const newWallet = parseFloat(user.wallet) - parseFloat(total);
      await connection.query('UPDATE users SET wallet = ? WHERE id = ?', [newWallet, req.user.id]);

      // Record wallet transaction
      const txnId = 'TXN-' + Date.now();
      await connection.query(
        'INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
        [txnId, req.user.id, 'debit', parseFloat(total), `Purchase of order items`]
      );
    }

    // 3. Deduct stock for each item & compile primary category
    let mainCategory = 'various';
    if (items.length > 0) {
      // Find category of the first item
      const [prodRows] = await connection.query('SELECT category FROM products WHERE id = ?', [items[0].id]);
      if (prodRows.length > 0) {
        mainCategory = prodRows[0].category;
      }
    }

    for (const item of items) {
      const [prod] = await connection.query('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.id]);
      if (prod.length === 0) {
        throw new Error(`Product ${item.name} not found`);
      }
      
      const currentStock = prod[0].stock;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${prod[0].name}`);
      }

      // Reduce stock
      await connection.query('UPDATE products SET stock = ? WHERE id = ?', [currentStock - item.quantity, item.id]);
    }

    // 4. Save order record
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    await connection.query(
      'INSERT INTO orders (order_id, customer_id, customer_name, customer_email, address, payment_method, subtotal, tax, shipping, discount, total, status, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderId,
        req.user.id,
        user.name,
        user.email,
        address,
        paymentMethod,
        parseFloat(subtotal),
        parseFloat(tax),
        parseFloat(shipping),
        parseFloat(discount),
        parseFloat(total),
        'Pending',
        mainCategory
      ]
    );

    // 5. Save order items
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)',
        [
          orderId,
          item.id,
          item.name,
          parseFloat(item.price),
          parseInt(item.quantity),
          item.image
        ]
      );
    }

    await connection.commit();

    // 6. Send Mail Notification asynchronously
    const savedOrder = {
      orderId,
      customerName: user.name,
      customerEmail: user.email,
      address,
      paymentMethod,
      items,
      subtotal: parseFloat(subtotal),
      tax: parseFloat(tax),
      shipping: parseFloat(shipping),
      discount: parseFloat(discount),
      total: parseFloat(total),
      orderDate: new Date()
    };

    sendOrderConfirmation(user.email, savedOrder);

    res.status(201).json({ message: 'Order placed successfully', orderId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Checkout error:', error);
    res.status(400).json({ error: error.message || 'Error processing payment checkout' });
  } finally {
    if (connection) connection.release();
  }
});

// Fetch user orders list (depending on scopes)
app.get('/yali_api/orders', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (req.user.role === 'customer') {
      sql = 'SELECT * FROM orders WHERE customer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'vendor') {
      sql = 'SELECT * FROM orders WHERE assigned_vendor_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'admin') {
      if (req.user.managed_category && req.user.managed_category !== 'all') {
        sql = 'SELECT * FROM orders WHERE category = ?';
        params.push(req.user.managed_category);
      }
    }

    sql += ' ORDER BY order_date DESC';

    const [orders] = await pool.query(sql, params);

    // Fetch items for each order
    const enrichedOrders = [];
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.order_id]);
      enrichedOrders.push({
        ...order,
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        shipping: parseFloat(order.shipping),
        discount: parseFloat(order.discount),
        total: parseFloat(order.total),
        items: items.map(it => ({
          ...it,
          id: it.product_id, // Map for frontend convenience
          price: parseFloat(it.price)
        }))
      });
    }

    res.json(enrichedOrders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin assign order to vendor
app.put('/yali_api/orders/:id/assign', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const orderId = req.params.id;
  const { vendorId } = req.body;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];

    // Category restriction check
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== order.category) {
        return res.status(403).json({ error: 'Unauthorized category order assignment' });
      }
    }

    // Update assignment
    await pool.query('UPDATE orders SET assigned_vendor_id = ? WHERE order_id = ?', [vendorId, orderId]);

    // Fetch vendor user details
    const [vendorRows] = await pool.query('SELECT u.name, u.email, vd.company_name FROM users u LEFT JOIN vendor_details vd ON u.id = vd.user_id WHERE u.id = ?', [vendorId]);
    
    if (vendorRows.length > 0) {
      const vendor = vendorRows[0];
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      
      const fullOrderObj = {
        ...order,
        items
      };

      // Email the assigned vendor
      sendVendorNotification(vendor.email, vendor.company_name || vendor.name, fullOrderObj);
    }

    res.json({ message: 'Order successfully assigned to vendor' });

  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Order status
app.put('/yali_api/orders/:id/status', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];

    // Authorization checks: Admin or the Assigned Vendor
    if (req.user.role === 'vendor' && order.assigned_vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: This order is not assigned to you' });
    }

    // Check if user is restricted by category
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== order.category) {
        return res.status(403).json({ error: `Unauthorized: You can only manage orders for '${req.user.managed_category}'.` });
      }
    }

    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);

    // If order was cancelled and was paid via WALLET, refund customer wallet balance
    if (status === 'Cancelled' && order.payment_method === 'WALLET') {
      await pool.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [order.total, order.customer_id]);
      
      // Log wallet transaction
      const txnId = 'TXN-REF-' + Date.now();
      await pool.query(
        'INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
        [txnId, order.customer_id, 'credit', parseFloat(order.total), `Refund for cancelled order ${orderId}`]
      );
    }

    // Fetch updated order & items to email customer
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const updatedOrder = {
      ...order,
      status,
      items
    };

    sendStatusUpdateNotification(order.customer_email, updatedOrder);

    res.json({ message: 'Order status updated successfully' });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Order tracking number
app.put('/yali_api/orders/:id/tracking', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const { trackingNumber } = req.body;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];

    // Authorization checks
    if (req.user.role === 'vendor' && order.assigned_vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized assignment details access' });
    }

    await pool.query('UPDATE orders SET tracking_number = ? WHERE order_id = ?', [trackingNumber, orderId]);

    res.json({ message: 'Tracking details updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Update Order expected delivery date
app.put('/yali_api/orders/:id/delivery-date', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const { expectedDeliveryDate } = req.body;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];

    // Authorization checks
    if (req.user.role === 'vendor' && order.assigned_vendor_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized order details access' });
    }

    await pool.query('UPDATE orders SET expected_delivery_date = ? WHERE order_id = ?', [expectedDeliveryDate || null, orderId]);

    res.json({ message: 'Expected delivery date updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// 👥 USER CONTROLLER ROUTES (ADMIN ONLY)
// -------------------------------------------------------------

// Fetch all users list
app.get('/yali_api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only access' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.wallet, u.role, u.status, u.managed_category,
             vd.company_name, vd.store_description, vd.tax_id, vd.status as vendor_status
      FROM users u
      LEFT JOIN vendor_details vd ON u.id = vd.user_id
      ORDER BY u.id DESC
    `);
    
    const parsedUsers = rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      wallet: parseFloat(u.wallet),
      role: u.role,
      status: u.status,
      managed_category: u.managed_category,
      vendorDetails: u.company_name ? {
        companyName: u.company_name,
        storeDescription: u.store_description,
        taxId: u.tax_id,
        status: u.vendor_status
      } : null
    }));

    res.json(parsedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Server error fetching user list' });
  }
});

// Update user role
app.put('/yali_api/users/:id/role', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const userId = req.params.id;
  const { role, managedCategory } = req.body;

  try {
    await pool.query('UPDATE users SET role = ?, managed_category = ? WHERE id = ?', [role, managedCategory || null, userId]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle user activation status / vendor approval status
app.put('/yali_api/users/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const userId = req.params.id;
  const { status } = req.body; // 'active', 'disabled'

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [users] = await connection.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];

    // Update status in users table
    await connection.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    // If vendor, update matching status in vendor details table
    if (user.role === 'vendor') {
      const dbVendorStatus = status === 'active' ? 'approved' : (status === 'disabled' ? 'rejected' : 'pending');
      await connection.query('UPDATE vendor_details SET status = ? WHERE user_id = ?', [dbVendorStatus, userId]);
    }

    await connection.commit();
    res.json({ message: 'User access status updated successfully' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});


// -------------------------------------------------------------
// 🏷️ COUPON ROUTES
// -------------------------------------------------------------

// Fetch coupons
app.get('/yali_api/coupons', async (req, res) => {
  const { all } = req.query;
  try {
    let sql = 'SELECT * FROM coupons';
    if (!all) sql += ' WHERE status = "active"';
    const [rows] = await pool.query(sql);
    const couponsList = rows.map(c => ({
      ...c,
      value: parseFloat(c.value),
      minOrder: parseFloat(c.min_order)
    }));
    res.json(couponsList);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching coupons' });
  }
});

// Create Coupon
app.post('/yali_api/coupons', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { code, type, value, minOrder, expiry } = req.body;

  if (!code || !value) {
    return res.status(400).json({ error: 'Coupon code and value are required' });
  }

  try {
    await pool.query(
      'INSERT INTO coupons (code, type, value, min_order, expiry, status) VALUES (?, ?, ?, ?, ?, ?)',
      [code.trim().toUpperCase(), type || 'percentage', parseFloat(value), parseFloat(minOrder) || 0, expiry || '2026-12-31', 'active']
    );
    res.status(201).json({ message: 'Coupon created successfully' });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Coupon
app.delete('/yali_api/coupons/:code', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  
  try {
    await pool.query('DELETE FROM coupons WHERE code = ?', [req.params.code]);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Coupon
app.put('/yali_api/coupons/:code', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  
  const originalCode = req.params.code;
  const { code, type, value, minOrder, expiry } = req.body;

  if (!code || !value) {
    return res.status(400).json({ error: 'Coupon code and value are required' });
  }

  try {
    await pool.query(
      'UPDATE coupons SET code = ?, type = ?, value = ?, min_order = ?, expiry = ? WHERE code = ?',
      [code.trim().toUpperCase(), type || 'percentage', parseFloat(value), parseFloat(minOrder) || 0, expiry || '2026-12-31', originalCode]
    );
    res.json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// 🖼️ BANNER EDITOR ROUTES
// -------------------------------------------------------------

// Fetch Banners
app.get('/yali_api/banners', async (req, res) => {
  const { all } = req.query;
  try {
    let sql = 'SELECT * FROM banners';
    if (!all) sql += ' WHERE status = "active"';
    const [rows] = await pool.query(sql);
    const bannersList = rows.map(b => ({
      ...b,
      bgImage: b.bg_image
    }));
    res.json(bannersList);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Banner
app.put('/yali_api/banners/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const bannerId = req.params.id;
  const { title, subtitle, cta, discount, bgImage, gradient } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM banners WHERE id = ?', [bannerId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Banner not found' });

    const b = existing[0];

    // Admin scope check
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== b.category) {
        return res.status(403).json({ error: 'Unauthorized category banner scope access' });
      }
    }

    await pool.query(
      'UPDATE banners SET title = ?, subtitle = ?, cta = ?, discount = ?, bg_image = ?, gradient = ? WHERE id = ?',
      [
        title || b.title,
        subtitle !== undefined ? subtitle : b.subtitle,
        cta || b.cta,
        discount !== undefined ? discount : b.discount,
        bgImage || b.bg_image,
        gradient || b.gradient,
        bannerId
      ]
    );

    res.json({ message: 'Banner slide updated successfully' });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Banner
app.post('/yali_api/banners', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { title, subtitle, cta, discount, bgImage, gradient, category } = req.body;

  // Admin scope check
  if (req.user.managed_category && req.user.managed_category !== 'all') {
    if (req.user.managed_category !== category) {
      return res.status(403).json({ error: 'Unauthorized category banner scope access' });
    }
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO banners (title, subtitle, cta, discount, bg_image, gradient, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        title || 'New Banner',
        subtitle || '',
        cta || 'Shop Now',
        discount || null,
        bgImage || '',
        gradient || 'from-gray-500 to-gray-600',
        category || 'various'
      ]
    );

    res.status(201).json({ message: 'Banner created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Banner
app.delete('/yali_api/banners/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const [existing] = await pool.query('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Banner not found' });

    // Admin scope check
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== existing[0].category) {
        return res.status(403).json({ error: 'Unauthorized category banner scope access' });
      }
    }

    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// 🎥 VIDEO SHOWCASE ROUTES
// -------------------------------------------------------------

// Fetch Videos
app.get('/yali_api/videos', async (req, res) => {
  const { category, all } = req.query;
  let sql = 'SELECT * FROM videos WHERE 1=1';
  const params = [];

  if (!all) {
    sql += ' AND status = "active"';
  }
  
  if (category && category !== 'all') {
    sql += ' WHERE category = ?';
    params.push(category);
  }
  
  try {
    const [rows] = await pool.query(sql, params);
    const videosList = rows.map(v => ({
      id: v.id,
      title: v.title,
      shortTitle: v.short_title,
      desc: v.description,
      url: v.url,
      duration: v.duration,
      category: v.category
    }));
    res.json(videosList);
  } catch (error) {
    console.error('Fetch videos error:', error);
    res.status(500).json({ error: 'Server error fetching videos' });
  }
});

// Create Video
app.post('/yali_api/videos', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { title, shortTitle, desc, url, duration, category } = req.body;

  if (!title || !shortTitle || !url || !category) {
    return res.status(400).json({ error: 'Title, short title, video URL, and category are required' });
  }

  // Category admin scope access verification
  if (req.user.managed_category && req.user.managed_category !== 'all') {
    if (req.user.managed_category !== category) {
      return res.status(403).json({ error: 'Unauthorized category video scope access' });
    }
  }

  try {
    await pool.query(
      'INSERT INTO videos (title, short_title, description, url, duration, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, shortTitle, desc || '', url, duration || '0:15', category]
    );
    res.status(201).json({ message: 'Video spotlight registered successfully!' });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Video
app.put('/yali_api/videos/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const videoId = req.params.id;
  const { title, shortTitle, desc, url, duration, category } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM videos WHERE id = ?', [videoId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Video not found' });

    const v = existing[0];

    // Admin scope check for existing video category
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== v.category || req.user.managed_category !== category) {
        return res.status(403).json({ error: 'Unauthorized category video scope access' });
      }
    }

    await pool.query(
      'UPDATE videos SET title = ?, short_title = ?, description = ?, url = ?, duration = ?, category = ? WHERE id = ?',
      [
        title || v.title,
        shortTitle || v.short_title,
        desc !== undefined ? desc : v.description,
        url || v.url,
        duration || v.duration,
        category || v.category,
        videoId
      ]
    );

    res.json({ message: 'Video spotlight updated successfully' });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Video
app.delete('/yali_api/videos/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const videoId = req.params.id;

  try {
    const [existing] = await pool.query('SELECT * FROM videos WHERE id = ?', [videoId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Video not found' });

    const v = existing[0];

    // Admin scope check for existing video category
    if (req.user.managed_category && req.user.managed_category !== 'all') {
      if (req.user.managed_category !== v.category) {
        return res.status(403).json({ error: 'Unauthorized category video scope access' });
      }
    }

    await pool.query('DELETE FROM videos WHERE id = ?', [videoId]);
    res.json({ message: 'Video spotlight deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// 💳 WALLET TRANSACTIONS ROUTES
// -------------------------------------------------------------

// Add money to Wallet
app.post('/yali_api/wallet/add-money', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if user account status is disabled
    const [users] = await connection.query('SELECT wallet, status FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    if (users[0].status === 'disabled') {
      return res.status(403).json({ error: 'Your account is disabled' });
    }

    const currentBalance = parseFloat(users[0].wallet);
    const newBalance = currentBalance + parseFloat(amount);

    // Update wallet
    await connection.query('UPDATE users SET wallet = ? WHERE id = ?', [newBalance, req.user.id]);

    // Record wallet transaction
    const txnId = 'TXN-' + Date.now();
    await connection.query(
      'INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
      [txnId, req.user.id, 'credit', parseFloat(amount), 'Credited money via gateway']
    );

    await connection.commit();
    res.json({ message: 'Wallet deposit completed', newBalance });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Wallet deposit error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

// Fetch transactions history log
app.get('/yali_api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
    const txns = rows.map(r => ({
      id: r.id,
      type: r.type,
      amount: parseFloat(r.amount),
      description: r.description,
      date: new Date(r.date).toLocaleDateString()
    }));
    res.json(txns);
  } catch (error) {
    console.error('Fetch wallet transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// 🗂️ UI CARDS ROUTES
// -------------------------------------------------------------

// Fetch active UI cards (public)
app.get('/yali_api/ui-cards', async (req, res) => {
  const { all } = req.query;
  try {
    let sql = 'SELECT * FROM ui_cards';
    if (!all) sql += ' WHERE status = "active"';
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Fetch UI cards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin fetch all UI cards
app.get('/yali_api/admin/ui-cards', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM ui_cards ORDER BY section, id');
    res.json(rows);
  } catch (error) {
    console.error('Admin fetch UI cards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create UI card
app.post('/yali_api/ui-cards', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { section, title, subtitle, icon, image_url, link_url, color_gradient, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO ui_cards (section, title, subtitle, icon, image_url, link_url, color_gradient, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [section, title, subtitle || null, icon || null, image_url || null, link_url || null, color_gradient || null, status || 'active']
    );
    res.status(201).json({ message: 'UI Card created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create UI card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update UI card
app.put('/yali_api/ui-cards/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { section, title, subtitle, icon, image_url, link_url, color_gradient, status } = req.body;
  try {
    await pool.query(
      'UPDATE ui_cards SET section=?, title=?, subtitle=?, icon=?, image_url=?, link_url=?, color_gradient=?, status=? WHERE id=?',
      [section, title, subtitle || null, icon || null, image_url || null, link_url || null, color_gradient || null, status || 'active', req.params.id]
    );
    res.json({ message: 'UI Card updated successfully' });
  } catch (error) {
    console.error('Update UI card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete UI card
app.delete('/yali_api/ui-cards/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM ui_cards WHERE id=?', [req.params.id]);
    res.json({ message: 'UI Card deleted successfully' });
  } catch (error) {
    console.error('Delete UI card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// 🔄 UNIFIED STATUS TOGGLE
// -------------------------------------------------------------

app.patch('/yali_api/admin/:entity/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') return res.status(403).json({ error: 'Unauthorized' });
  
  const { entity, id } = req.params;
  const { status } = req.body;
  
  const validEntities = ['products', 'banners', 'videos', 'coupons', 'categories', 'ui-cards'];
  if (!validEntities.includes(entity)) return res.status(400).json({ error: 'Invalid entity' });
  
  if (status !== 'active' && status !== 'inactive') return res.status(400).json({ error: 'Invalid status' });

  const idField = entity === 'coupons' ? 'code' : 'id';
  const tableName = entity === 'ui-cards' ? 'ui_cards' : entity;

  try {
    if (req.user.role === 'vendor' && entity === 'products') {
      const [prod] = await pool.query('SELECT vendor_id FROM products WHERE id = ?', [id]);
      if (!prod[0] || prod[0].vendor_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    await pool.query(`UPDATE ${tableName} SET status = ? WHERE ${idField} = ?`, [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// 🛒 CART MANAGEMENT ROUTES (Server-side persistent cart)
// -------------------------------------------------------------

// Get user's cart
app.get('/yali_api/cart', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ci.id, ci.user_id, ci.product_id, ci.selected_variant, ci.quantity, ci.created_at,
             p.name, p.price, p.original_price, p.image, p.category, p.stock, p.badge, p.unique_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
app.post('/yali_api/cart', authenticateToken, async (req, res) => {
  const { product_id, selected_variant, quantity } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

  try {
    // Check if item already in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND (selected_variant = ? OR (selected_variant IS NULL AND ? IS NULL))',
      [req.user.id, product_id, selected_variant || null, selected_variant || null]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQty = existing[0].quantity + (quantity || 1);
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
      res.json({ message: 'Cart updated', id: existing[0].id });
    } else {
      const [result] = await pool.query(
        'INSERT INTO cart_items (user_id, product_id, selected_variant, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, selected_variant || null, quantity || 1]
      );
      res.status(201).json({ message: 'Added to cart', id: result.insertId });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
app.put('/yali_api/cart/:id', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Valid quantity required' });

  try {
    const [existing] = await pool.query('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Cart item not found' });

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
app.delete('/yali_api/cart/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear entire cart
app.delete('/yali_api/cart', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all cart items (all users)
app.get('/yali_api/admin/carts', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const [rows] = await pool.query(`
      SELECT ci.id, ci.user_id, ci.product_id, ci.selected_variant, ci.quantity, ci.created_at,
             u.name AS customer_name, u.email AS customer_email,
             p.name AS product_name, p.price, p.image, p.category, p.unique_id
      FROM cart_items ci
      JOIN users u ON ci.user_id = u.id
      JOIN products p ON ci.product_id = p.id
      ORDER BY ci.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Admin get carts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Remove a specific cart item
app.delete('/yali_api/admin/carts/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Admin remove cart item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// ❤️ WISHLIST MANAGEMENT ROUTES (Server-side persistent wishlist)
// -------------------------------------------------------------

// Get user's wishlist
app.get('/yali_api/wishlist', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.id, w.user_id, w.product_id, w.created_at,
             p.name, p.price, p.original_price, p.image, p.category, p.stock, p.badge, p.rating, p.unique_id
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add/Toggle wishlist item
app.post('/yali_api/wishlist', authenticateToken, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

  try {
    // Check if already in wishlist
    const [existing] = await pool.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);

    if (existing.length > 0) {
      // Remove (toggle off)
      await pool.query('DELETE FROM wishlist WHERE id = ?', [existing[0].id]);
      res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      // Add (toggle on)
      const [result] = await pool.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [req.user.id, product_id]
      );
      res.status(201).json({ message: 'Added to wishlist', action: 'added', id: result.insertId });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from wishlist
app.delete('/yali_api/wishlist/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlist WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all wishlist items (all users)
app.get('/yali_api/admin/wishlists', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const [rows] = await pool.query(`
      SELECT w.id, w.user_id, w.product_id, w.created_at,
             u.name AS customer_name, u.email AS customer_email,
             p.name AS product_name, p.price, p.image, p.category, p.unique_id
      FROM wishlist w
      JOIN users u ON w.user_id = u.id
      JOIN products p ON w.product_id = p.id
      ORDER BY w.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Admin get wishlists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Remove a specific wishlist item
app.delete('/yali_api/admin/wishlists/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM wishlist WHERE id = ?', [req.params.id]);
    res.json({ message: 'Wishlist item removed' });
  } catch (error) {
    console.error('Admin remove wishlist item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// VISITOR LOCATIONS (Anyone entering site)
// -------------------------------------------------------------

// Record a visitor's location
app.post('/yali_api/locations', async (req, res) => {
  const { session_id, latitude, longitude, city, country } = req.body;
  if (!session_id || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing required location data' });
  }

  try {
    // Check if session already recorded to prevent spam
    const [existing] = await pool.query('SELECT id FROM visitor_locations WHERE session_id = ?', [session_id]);
    if (existing.length > 0) {
      return res.status(200).json({ message: 'Location already recorded for this session' });
    }

    await pool.query(
      'INSERT INTO visitor_locations (session_id, latitude, longitude, city, country) VALUES (?, ?, ?, ?, ?)',
      [session_id, latitude, longitude, city || null, country || null]
    );
    res.status(201).json({ message: 'Location recorded successfully' });
  } catch (error) {
    console.error('Record location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all visitor locations
app.get('/yali_api/admin/locations', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const [rows] = await pool.query('SELECT * FROM visitor_locations ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Admin get locations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// PRODUCT REVIEWS ROUTES
// -------------------------------------------------------------

// Get approved reviews for a product
app.get('/yali_api/products/:id/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      "SELECT * FROM product_reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC", 
      [req.params.id]
    );
    const parsedReviews = reviews.map(r => {
      let mediaArray = [];
      if (typeof r.media === 'string') {
        try {
          mediaArray = JSON.parse(r.media);
        } catch (e) {
          console.warn(`[WARNING] Failed to parse media for review ${r.id}, it might be truncated.`);
        }
      } else if (r.media) {
        mediaArray = r.media;
      }
      return { ...r, media: mediaArray };
    });
    res.json(parsedReviews);
  } catch (error) {
    console.error('[GET REVIEWS ERROR]:', error);
    res.status(500).json({ error: error.message || 'Server error fetching reviews' });
  }
});

// Submit a review for a product
app.post('/yali_api/products/:id/reviews', authenticateToken, async (req, res) => {
  const { rating, comment, media } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Valid rating (1-5) is required' });

  try {
    // Check if product exists
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) return res.status(404).json({ error: 'Product not found' });

    // Check if user already reviewed
    const [existing] = await pool.query('SELECT * FROM product_reviews WHERE product_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length > 0) return res.status(409).json({ error: 'You have already reviewed this product' });

    await pool.query(
      "INSERT INTO product_reviews (product_id, user_id, author_name, rating, comment, media, status) VALUES (?, ?, ?, ?, ?, ?, 'approved')",
      [req.params.id, req.user.id, req.user.name, rating, comment || '', media ? JSON.stringify(media) : null]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

// Admin: Get all reviews
app.get('/yali_api/admin/reviews', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    console.error(`[Admin Reviews GET] 403 Forbidden. User role is: ${req.user.role}`);
    return res.status(403).json({ error: 'Unauthorized: Admins only' });
  }
  try {
    const [reviews] = await pool.query(`
      SELECT pr.*, p.name as product_name 
      FROM product_reviews pr 
      JOIN products p ON pr.product_id = p.id 
      ORDER BY pr.created_at DESC
    `);
    const parsedReviews = reviews.map(r => {
      let mediaArray = [];
      if (typeof r.media === 'string') {
        try {
          mediaArray = JSON.parse(r.media);
        } catch (e) {
          console.warn(`[WARNING] Failed to parse media for admin review ${r.id}, it might be truncated.`);
        }
      } else if (r.media) {
        mediaArray = r.media;
      }
      return { ...r, media: mediaArray };
    });
    res.json(parsedReviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update review status
app.put('/yali_api/admin/reviews/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    console.error(`[Admin Reviews PUT] 403 Forbidden. User role is: ${req.user.role}`);
    return res.status(403).json({ error: 'Unauthorized: Admins only' });
  }
  try {
    await pool.query('UPDATE product_reviews SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete review
app.delete('/yali_api/admin/reviews/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    console.error(`[Admin Reviews DELETE] 403 Forbidden. User role is: ${req.user.role}`);
    return res.status(403).json({ error: 'Unauthorized: Admins only' });
  }
  try {
    await pool.query('DELETE FROM product_reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// 📍 VISITOR LOCATIONS ROUTES
// -------------------------------------------------------------

// Save visitor location (Public)
app.post('/yali_api/locations', async (req, res) => {
  const { session_id, latitude, longitude, city, country } = req.body;
  if (!session_id || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing location data' });
  }
  
  try {
    const [existing] = await pool.query('SELECT id FROM visitor_locations WHERE session_id = ?', [session_id]);
    if (existing.length > 0) {
      await pool.query(
        'UPDATE visitor_locations SET latitude = ?, longitude = ?, city = ?, country = ? WHERE session_id = ?',
        [latitude, longitude, city || null, country || null, session_id]
      );
    } else {
      await pool.query(
        'INSERT INTO visitor_locations (session_id, latitude, longitude, city, country) VALUES (?, ?, ?, ?, ?)',
        [session_id, latitude, longitude, city || null, country || null]
      );
    }
    res.json({ message: 'Location saved' });
  } catch (error) {
    console.error('Save location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin fetch locations
app.get('/yali_api/admin/locations', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM visitor_locations ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch locations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// 📍 PAGE SECTIONS ROUTES (Dynamic Page Builder)
// -------------------------------------------------------------

// Get sections for a specific page
app.get('/yali_api/page-sections/:page_id', async (req, res) => {
  try {
    const { page_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM page_sections WHERE page_id = ? AND status = "active" ORDER BY display_order ASC', [page_id]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch page sections error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all sections for a page (including inactive)
app.get('/yali_api/admin/page-sections/:page_id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { page_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM page_sections WHERE page_id = ? ORDER BY display_order ASC', [page_id]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch page sections admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create section
app.post('/yali_api/page-sections', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { page_id, section_type, title, subtitle, display_order, content, status } = req.body;
    const contentStr = content ? JSON.stringify(content) : null;
    
    const [result] = await pool.query(
      'INSERT INTO page_sections (page_id, section_type, title, subtitle, display_order, content, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [page_id, section_type, title, subtitle, display_order || 0, contentStr, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Section created' });
  } catch (error) {
    console.error('Create page section error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update section
app.put('/yali_api/page-sections/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { page_id, section_type, title, subtitle, display_order, content, status } = req.body;
    const contentStr = content ? JSON.stringify(content) : null;
    
    await pool.query(
      'UPDATE page_sections SET page_id = ?, section_type = ?, title = ?, subtitle = ?, display_order = ?, content = ?, status = ? WHERE id = ?',
      [page_id, section_type, title, subtitle, display_order, contentStr, status, req.params.id]
    );
    res.json({ message: 'Section updated' });
  } catch (error) {
    console.error('Update page section error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete section
app.delete('/yali_api/page-sections/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM page_sections WHERE id = ?', [req.params.id]);
    res.json({ message: 'Section deleted' });
  } catch (error) {
    console.error('Delete page section error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Reorder sections
app.put('/yali_api/page-sections/reorder/batch', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { updates } = req.body; // [{ id: 1, display_order: 0 }, { id: 2, display_order: 1 }]
    for (const update of updates) {
      await pool.query('UPDATE page_sections SET display_order = ? WHERE id = ?', [update.display_order, update.id]);
    }
    res.json({ message: 'Sections reordered' });
  } catch (error) {
    console.error('Reorder page sections error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------------------
// SERVER BOOTUP & DB INIT
// -------------------------------------------------------------
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`YALI Backend Server listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Could not boot up backend server due to database init failure:', err);
  process.exit(1);
});
