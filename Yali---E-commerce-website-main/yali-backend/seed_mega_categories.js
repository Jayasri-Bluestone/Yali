const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'auth-db1278.hstgr.io',
    user: process.env.DB_USER || 'u287260207_yali_user',
    password: process.env.DB_PASSWORD || 'yaLi@2K26',
    database: process.env.DB_NAME || 'u287260207_yali_db'
};

const CATEGORIES_DATA = [
  {
    value: 'real-estate',
    label: 'Properties Land',
    icon: 'Home',
    bg_color: '#ef4444',
    status: 'active',
    items: [
      { filter_tag: 'residential', label: 'Residential Properties', subtitle: 'Houses, Apartments, Villas', icon_name: 'Home', link_url: '/search?category=residential', display_order: 1 },
      { filter_tag: 'commercial', label: 'Commercial Properties', subtitle: 'Offices, Shops, Showrooms', icon_name: 'Building2', link_url: '/search?category=commercial', display_order: 2 },
      { filter_tag: 'agricultural', label: 'Agricultural Land', subtitle: 'Farms, Plots, Farmland', icon_name: 'Tractor', link_url: '/search?category=agricultural', display_order: 3 },
      { filter_tag: 'buy', label: 'Buy', subtitle: 'Find your dream property', icon_name: 'Search', link_url: '/search?action=buy', display_order: 4 },
      { filter_tag: 'rent', label: 'Rent / Lease', subtitle: 'Homes & commercial spaces', icon_name: 'Key', link_url: '/search?action=rent', display_order: 5 },
      { filter_tag: 'sell', label: 'Sell', subtitle: 'List your property', icon_name: 'Megaphone', link_url: '/sell', display_order: 6 },
      { filter_tag: 'services', label: 'Property Services', subtitle: 'Legal, Documents, Consulting', icon_name: 'FileText', link_url: '/services', display_order: 7 },
    ]
  },
  {
    value: 'automobiles',
    label: 'Two Wheelers\n& Four Wheelers',
    icon: 'Car',
    bg_color: '#3b82f6',
    status: 'active',
    items: [
      { filter_tag: 'new-vehicles', label: 'New Vehicles', subtitle: 'Latest Bikes & Cars', icon_name: 'CarFront', link_url: '/search?category=new-vehicles', display_order: 1 },
      { filter_tag: 'used-vehicles', label: 'Used Vehicles', subtitle: 'Verified Second-hand', icon_name: 'Car', link_url: '/search?category=used-vehicles', display_order: 2 },
      { filter_tag: 'buy-vehicle', label: 'Buy', subtitle: 'Find the right vehicle', icon_name: 'Search', link_url: '/search?action=buy-vehicle', display_order: 3 },
      { filter_tag: 'sell-vehicle', label: 'Sell', subtitle: 'List your vehicle easily', icon_name: 'Megaphone', link_url: '/sell-vehicle', display_order: 4 },
      { filter_tag: 'compare', label: 'Compare', subtitle: 'Compare prices & features', icon_name: 'GitCompare', link_url: '/compare', display_order: 5 },
      { filter_tag: 'accessories', label: 'Accessories', subtitle: 'Parts & Add-ons', icon_name: 'Wrench', link_url: '/search?category=accessories', display_order: 6 },
      { filter_tag: 'services-auto', label: 'Services', subtitle: 'Repair, Maintenance, Insurance', icon_name: 'Settings', link_url: '/services', display_order: 7 },
    ]
  },
  {
    value: 'organic-products',
    label: 'Organic Products',
    icon: 'Leaf',
    bg_color: '#22c55e',
    status: 'active',
    items: [
      { filter_tag: 'vegetables', label: 'Fresh Vegetables', subtitle: 'Farm Fresh & Natural', icon_name: 'Leaf', link_url: '/search?category=vegetables', display_order: 1 },
      { filter_tag: 'fruits', label: 'Fresh Fruits', subtitle: 'Seasonal & Organic', icon_name: 'Apple', link_url: '/search?category=fruits', display_order: 2 },
      { filter_tag: 'grocery', label: 'Organic Grocery', subtitle: 'Pulses, Grains, Flour, Spices', icon_name: 'Wheat', link_url: '/search?category=grocery', display_order: 3 },
      { filter_tag: 'herbal', label: 'Herbal & Natural Products', subtitle: 'Teas, Oils, Supplements', icon_name: 'Coffee', link_url: '/search?category=herbal', display_order: 4 },
      { filter_tag: 'personal-care', label: 'Personal Care', subtitle: 'Soaps, Skin & Hair Care', icon_name: 'Heart', link_url: '/search?category=personal-care', display_order: 5 },
      { filter_tag: 'home-care', label: 'Home Care', subtitle: 'Cleaners, Detergents', icon_name: 'SprayCan', link_url: '/search?category=home-care', display_order: 6 },
      { filter_tag: 'farm-to-home', label: 'Farm to Home', subtitle: 'Direct from Farmers', icon_name: 'Truck', link_url: '/search?category=farm-to-home', display_order: 7 },
    ]
  },
  {
    value: 'dry-fruits',
    label: 'Dry Fruits',
    icon: 'Cookie',
    bg_color: '#ea580c',
    status: 'active',
    items: [
      { filter_tag: 'nuts', label: 'Nuts', subtitle: 'Almonds, Cashews, Walnuts', icon_name: 'Cookie', link_url: '/search?category=nuts', display_order: 1 },
      { filter_tag: 'dried-fruits', label: 'Dried Fruits', subtitle: 'Raisins, Dates, Apricots, Figs', icon_name: 'Cherry', link_url: '/search?category=dried-fruits', display_order: 2 },
      { filter_tag: 'seeds', label: 'Seeds', subtitle: 'Chia, Flax, Pumpkin, Sunflower', icon_name: 'Sprout', link_url: '/search?category=seeds', display_order: 3 },
      { filter_tag: 'nut-butters', label: 'Nut Butters', subtitle: 'Almond Butter, Peanut Butter', icon_name: 'Combine', link_url: '/search?category=nut-butters', display_order: 4 },
      { filter_tag: 'gift-packs', label: 'Gift Packs', subtitle: 'Premium & Combo Packs', icon_name: 'Gift', link_url: '/search?category=gift-packs', display_order: 5 },
      { filter_tag: 'premium-dry-fruits', label: 'Organic & Premium', subtitle: '100% Natural & Quality', icon_name: 'BadgeCheck', link_url: '/search?category=premium-dry-fruits', display_order: 6 },
      { filter_tag: 'health', label: 'Health Benefits', subtitle: 'Eat Healthy, Live Healthy', icon_name: 'Stethoscope', link_url: '/search?category=health', display_order: 7 },
    ]
  },
  {
    value: 'fashion',
    label: 'Dresses',
    icon: 'Shirt',
    bg_color: '#a855f7',
    status: 'active',
    items: [
      { filter_tag: 'men', label: 'Men', subtitle: 'Shirts, T-Shirts, Jeans, Suits', icon_name: 'Shirt', link_url: '/search?category=men', display_order: 1 },
      { filter_tag: 'women', label: 'Women', subtitle: 'Dresses, Kurtis, Tops, Sarees', icon_name: 'User', link_url: '/search?category=women', display_order: 2 },
      { filter_tag: 'kids', label: 'Kids', subtitle: 'Boys & Girls Clothing', icon_name: 'Baby', link_url: '/search?category=kids', display_order: 3 },
      { filter_tag: 'ethnic', label: 'Ethnic Wear', subtitle: 'Sarees, Lehengas, Kurtas', icon_name: 'Palette', link_url: '/search?category=ethnic', display_order: 4 },
      { filter_tag: 'western', label: 'Western Wear', subtitle: 'Casuals, Party Wear, Formals', icon_name: 'Scissors', link_url: '/search?category=western', display_order: 5 },
      { filter_tag: 'fashion-accessories', label: 'Accessories', subtitle: 'Bags, Belts, Watches, Caps', icon_name: 'Briefcase', link_url: '/search?category=fashion-accessories', display_order: 6 },
      { filter_tag: 'new-arrivals', label: 'New Arrivals', subtitle: 'Latest Collections', icon_name: 'Sparkles', link_url: '/search?category=new-arrivals', display_order: 7 },
    ]
  }
];

const FEATURES = [
  { icon_name: 'ShieldCheck', title: 'Trusted & Secure', description: '100% safe and secure platform.', color_hex: '#083366', display_order: 1, status: 'active' },
  { icon_name: 'Headset', title: '24/7 Support', description: 'We are here to help you anytime.', color_hex: '#3b82f6', display_order: 2, status: 'active' },
  { icon_name: 'Star', title: 'Best Quality', description: 'Quality products and services you can trust.', color_hex: '#ea580c', display_order: 3, status: 'active' },
  { icon_name: 'Tag', title: 'Great Deals', description: 'Best prices and exciting offers every day.', color_hex: '#a855f7', display_order: 4, status: 'active' },
];

async function seedData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database. Starting seed...");

    // 1. Seed Categories
    for (const cat of CATEGORIES_DATA) {
      // Check if category exists
      const [existingCat] = await connection.query('SELECT id FROM categories WHERE value = ?', [cat.value]);
      
      if (existingCat.length === 0) {
        await connection.query(
          'INSERT INTO categories (value, label, icon, bg_color, status) VALUES (?, ?, ?, ?, ?)',
          [cat.value, cat.label, cat.icon, cat.bg_color, cat.status]
        );
        console.log(`Inserted category: ${cat.label}`);
      } else {
        await connection.query(
          'UPDATE categories SET label=?, icon=?, bg_color=? WHERE value=?',
          [cat.label, cat.icon, cat.bg_color, cat.value]
        );
        console.log(`Updated category: ${cat.label}`);
      }

      // 2. Seed Sub Categories
      for (const sub of cat.items) {
        const [existingSub] = await connection.query('SELECT id FROM sub_categories WHERE filter_tag = ? AND category_value = ?', [sub.filter_tag, cat.value]);
        if (existingSub.length === 0) {
          await connection.query(
            'INSERT INTO sub_categories (category_value, label, filter_tag, subtitle, icon_name, link_url, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [cat.value, sub.label, sub.filter_tag, sub.subtitle, sub.icon_name, sub.link_url, sub.display_order, 'active']
          );
          console.log(`Inserted sub-category: ${sub.label}`);
        } else {
          await connection.query(
            'UPDATE sub_categories SET label=?, subtitle=?, icon_name=?, link_url=?, display_order=? WHERE filter_tag=? AND category_value=?',
            [sub.label, sub.subtitle, sub.icon_name, sub.link_url, sub.display_order, sub.filter_tag, cat.value]
          );
          console.log(`Updated sub-category: ${sub.label}`);
        }
      }
    }

    // 3. Seed Home Features
    for (const feat of FEATURES) {
      const [existingFeat] = await connection.query('SELECT id FROM home_features WHERE title = ?', [feat.title]);
      if (existingFeat.length === 0) {
        await connection.query(
          'INSERT INTO home_features (icon_name, title, description, color_hex, display_order, status) VALUES (?, ?, ?, ?, ?, ?)',
          [feat.icon_name, feat.title, feat.description, feat.color_hex, feat.display_order, feat.status]
        );
        console.log(`Inserted feature: ${feat.title}`);
      } else {
        await connection.query(
          'UPDATE home_features SET icon_name=?, description=?, color_hex=?, display_order=? WHERE title=?',
          [feat.icon_name, feat.description, feat.color_hex, feat.display_order, feat.title]
        );
        console.log(`Updated feature: ${feat.title}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    if (connection) await connection.end();
  }
}

seedData();
