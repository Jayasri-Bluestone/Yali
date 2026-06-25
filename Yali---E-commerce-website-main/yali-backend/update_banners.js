const { pool } = require('./db');

const newBanners = [
  {
    title: 'Properties Land',
    subtitle: 'Premium Residential & Commercial Spaces',
    cta: 'Explore Properties',
    discount: 'Top Deals',
    bg_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=400&fit=crop',
    gradient: 'bg-green-600/70',
    category: 'residential',
    status: 'active'
  },
  {
    title: 'Two & Four Wheelers',
    subtitle: 'Buy, Sell & Compare Top Vehicles',
    cta: 'Explore Vehicles',
    discount: 'Best Offers',
    bg_image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=400&fit=crop',
    gradient: 'bg-blue-600/70',
    category: 'new-vehicles',
    status: 'active'
  },
  {
    title: 'Organic Products',
    subtitle: 'Fresh Vegetables, Fruits & Groceries',
    cta: 'Shop Organic',
    discount: '100% Natural',
    bg_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop',
    gradient: 'bg-emerald-600/70',
    category: 'vegetables',
    status: 'active'
  },
  {
    title: 'Premium Dry Fruits',
    subtitle: 'Nuts, Seeds & Gift Packs',
    cta: 'Shop Dry Fruits',
    discount: 'Healthy Choice',
    bg_image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&h=400&fit=crop',
    gradient: 'bg-orange-600/70',
    category: 'nuts',
    status: 'active'
  },
  {
    title: 'Fashion & Dresses',
    subtitle: 'Ethnic, Western & New Arrivals',
    cta: 'Shop Fashion',
    discount: 'Latest Trends',
    bg_image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&h=400&fit=crop',
    gradient: 'bg-purple-600/70',
    category: 'women',
    status: 'active'
  }
];

async function updateBanners() {
  try {
    // Delete existing banners
    await pool.query('DELETE FROM banners');
    console.log('Cleared existing banners.');

    // Insert new banners
    for (const b of newBanners) {
      await pool.query(
        `INSERT INTO banners (title, subtitle, cta, discount, bg_image, gradient, category, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.title, b.subtitle, b.cta, b.discount, b.bg_image, b.gradient, b.category, b.status]
      );
    }
    console.log('Successfully inserted new Mega Category banners!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating banners:', error);
    process.exit(1);
  }
}

updateBanners();
