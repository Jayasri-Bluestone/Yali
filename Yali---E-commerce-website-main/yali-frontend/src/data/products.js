export const PRODUCTS = [
  // Real Estate Properties
  {
    id: 1,
    unique_id: 'YALI-PROD-0001',
    name: '5 Acre Agricultural Land with Farm House - Premium Location',
    price: 250000,
    originalPrice: 300000,
    rating: 4.9,
    reviews: [
      { id: 1, author: 'Rajesh Kumar', rating: 5, date: 'May 20, 2026', comment: 'Excellent property! Perfect for farming and weekend getaway. Great investment.', verified: true, helpful: 89 },
      { id: 2, author: 'Priya Sharma', rating: 5, date: 'May 15, 2026', comment: 'Beautiful location with all amenities. Highly recommended!', verified: true, helpful: 67 }
    ],
    discount: 17,
    badge: 'Hot Deal',
    category: 'real-estate',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500&h=500&fit=crop'
    ],
    description: 'Premium 5-acre agricultural land with modern farm house, water source, and fertile soil. Perfect for organic farming or luxury weekend retreat.',
    features: [
      '5 acres of fertile agricultural land',
      'Modern 2BHK farm house included',
      'Bore well with year-round water supply',
      'Clear title with all legal documents',
      '24/7 security and gated community',
      'Easy road access'
    ],
    specs: [
      { label: 'Area', value: '5 Acres' },
      { label: 'Location', value: 'Highway accessible' },
      { label: 'Water Source', value: 'Bore Well + Canal' },
      { label: 'Electricity', value: 'Available' },
      { label: 'Title', value: 'Clear & Freehold' },
      { label: 'Possession', value: 'Immediate' }
    ],
    stock: 1
  },
  {
    id: 2,
    unique_id: 'YALI-PROD-0002',
    name: 'Luxury 3BHK Apartment - City Center with Premium Amenities',
    price: 180000,
    originalPrice: 220000,
    rating: 4.8,
    reviews: [
      { id: 1, author: 'Amit Patel', rating: 5, date: 'May 18, 2026', comment: 'Amazing apartment with all modern amenities. Great location!', verified: true, helpful: 124 }
    ],
    discount: 18,
    badge: 'Bestseller',
    category: 'real-estate',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=500&fit=crop',
    description: 'Modern 3BHK luxury apartment in prime location with swimming pool, gym, and 24/7 security.',
    features: [
      '1850 sq.ft built-up area',
      'Swimming pool and gym',
      'Modular kitchen with appliances',
      'Premium Italian marble flooring',
      'Reserved parking for 2 cars',
      '24/7 security and power backup'
    ],
    specs: [
      { label: 'Bedrooms', value: '3 BHK' },
      { label: 'Built-up Area', value: '1850 sq.ft' },
      { label: 'Floor', value: '12th of 18' },
      { label: 'Facing', value: 'East' },
      { label: 'Age', value: 'Ready to Move' }
    ],
    stock: 3
  },
  {
    id: 3,
    unique_id: 'YALI-PROD-0003',
    name: '2 Acre Residential Plot - Gated Community with All Amenities',
    price: 95000,
    rating: 4.7,
    reviews: [
      { id: 1, author: 'Sunita Reddy', rating: 5, date: 'May 12, 2026', comment: 'Perfect plot to build dream home. Great community and location!', verified: true, helpful: 56 }
    ],
    badge: 'New Listing',
    category: 'real-estate',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=500&fit=crop',
    description: 'Premium residential plot in gated community with park, clubhouse, and excellent infrastructure.',
    features: [
      '2 acres of prime land',
      'Gated community with security',
      'Underground electricity and drainage',
      'Park and children play area',
      'Wide internal roads',
      'Immediate registration'
    ],
    stock: 5
  },

  // Bike Accessories
  {
    id: 4,
    unique_id: 'YALI-PROD-0004',
    name: 'Premium Full Face Motorcycle Helmet - DOT Certified Safety',
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviews: [
      { id: 1, author: 'Vikram Singh', rating: 5, date: 'May 22, 2026', comment: 'Best helmet! Very comfortable and safe. Great ventilation.', verified: true, helpful: 234 }
    ],
    discount: 31,
    badge: 'Bestseller',
    category: 'bike-accessories',
    image: 'https://images.unsplash.com/photo-1590506995460-d0d9892b54da?w=500&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1590506995460-d0d9892b54da?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1611004061856-ccc3cbe944b2?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1627530980937-b8721b91506a?w=500&h=500&fit=crop'
    ],
    description: 'Professional-grade full face helmet with advanced safety features, anti-fog visor, and superior comfort.',
    features: [
      'DOT and ECE certified',
      'Anti-fog dual visor system',
      'Advanced ventilation system',
      'Removable and washable liner',
      'Quick release buckle',
      'Aerodynamic design'
    ],
    specs: [
      { label: 'Certification', value: 'DOT & ECE' },
      { label: 'Material', value: 'ABS Shell' },
      { label: 'Weight', value: '1.5 kg' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' }
    ],
    stock: 145
  },
  {
    id: 5,
    unique_id: 'YALI-PROD-0005',
    name: 'Motorcycle Riding Jacket - All Season with Armor Protection',
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.7,
    reviews: [
      { id: 1, author: 'Arjun Mehta', rating: 5, date: 'May 19, 2026', comment: 'Excellent quality jacket with great protection. Worth every penny!', verified: true, helpful: 178 }
    ],
    discount: 28,
    category: 'bike-accessories',
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=500&h=500&fit=crop',
    description: 'All-weather riding jacket with CE-approved armor, waterproof membrane, and thermal liner.',
    features: [
      'CE-approved shoulder, elbow, back armor',
      'Waterproof and breathable membrane',
      'Removable thermal liner',
      'Reflective panels for visibility',
      'Multiple ventilation zippers',
      'Adjustable cuffs and waist'
    ],
    stock: 89
  },
  {
    id: 6,
    unique_id: 'YALI-PROD-0006',
    name: 'Bike LED Headlight Kit - Ultra Bright 6000K White Light',
    price: 45.99,
    originalPrice: 69.99,
    rating: 4.6,
    reviews: [
      { id: 1, author: 'Rahul Verma', rating: 4, date: 'May 10, 2026', comment: 'Very bright lights! Easy installation and great value.', verified: true, helpful: 92 }
    ],
    discount: 34,
    badge: 'Hot Deal',
    category: 'bike-accessories',
    image: 'https://images.unsplash.com/photo-1649027421785-6827863f0891?w=500&h=500&fit=crop',
    description: 'High-performance LED headlight kit with 6000K pure white light, waterproof design, and easy installation.',
    features: [
      '6000K ultra-bright white light',
      'IP67 waterproof rating',
      'Easy plug-and-play installation',
      '50,000 hours lifespan',
      'Universal fitment',
      'Heat dissipation aluminum housing'
    ],
    stock: 234
  },

  // Car Accessories
  {
    id: 7,
    unique_id: 'YALI-PROD-0007',
    name: 'Premium Leather Car Seat Covers - Universal Fit 5-Seater',
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviews: [
      { id: 1, author: 'Suresh Iyer', rating: 5, date: 'May 21, 2026', comment: 'Excellent quality leather! Looks premium and fits perfectly.', verified: true, helpful: 267 }
    ],
    discount: 25,
    badge: 'Bestseller',
    category: 'car-accessories',
    image: 'https://images.unsplash.com/photo-1667893530449-e58102223524?w=500&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1667893530449-e58102223524?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1614527255138-018e29ff34ee?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1629838978692-40a61bf66f7b?w=500&h=500&fit=crop'
    ],
    description: 'Premium PU leather car seat covers with elegant design, easy installation, and universal fit for most 5-seater vehicles.',
    features: [
      'High-quality PU leather',
      'Universal fit for 5-seater cars',
      'Easy installation with hooks',
      'Breathable and comfortable',
      'Water-resistant and easy to clean',
      'Front and rear seat coverage'
    ],
    specs: [
      { label: 'Material', value: 'Premium PU Leather' },
      { label: 'Fit', value: 'Universal 5-Seater' },
      { label: 'Colors', value: 'Black, Beige, Brown' },
      { label: 'Warranty', value: '1 Year' }
    ],
    stock: 178
  },
  {
    id: 8,
    unique_id: 'YALI-PROD-0008',
    name: 'Car Dashboard Camera - 4K Ultra HD with Night Vision',
    price: 119.99,
    originalPrice: 169.99,
    rating: 4.9,
    reviews: [
      { id: 1, author: 'Karthik Raj', rating: 5, date: 'May 16, 2026', comment: 'Amazing camera quality! Night vision works perfectly. Must-have for safety.', verified: true, helpful: 345 }
    ],
    discount: 29,
    badge: 'Top Rated',
    category: 'car-accessories',
    image: 'https://images.unsplash.com/photo-1715122476474-c14d2fab50a8?w=500&h=500&fit=crop',
    description: '4K Ultra HD dash camera with Sony sensor, night vision, G-sensor, and loop recording for complete road safety.',
    features: [
      '4K Ultra HD recording',
      'Sony STARVIS sensor for night vision',
      '170° wide-angle lens',
      'G-sensor for accident detection',
      'Loop recording and parking mode',
      '32GB SD card included'
    ],
    stock: 234
  },
  {
    id: 9,
    unique_id: 'YALI-PROD-0009',
    name: 'Carbon Fiber Steering Wheel Cover - Ergonomic Anti-Slip Design',
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.6,
    reviews: [
      { id: 1, author: 'Deepak Nair', rating: 4, date: 'May 8, 2026', comment: 'Good grip and looks sporty. Easy to install!', verified: true, helpful: 89 }
    ],
    discount: 40,
    category: 'car-accessories',
    image: 'https://images.unsplash.com/photo-1562172380-b641fb7b8e46?w=500&h=500&fit=crop',
    description: 'Premium carbon fiber steering wheel cover with anti-slip texture and ergonomic design for comfortable driving.',
    features: [
      'Carbon fiber pattern design',
      'Anti-slip silicone interior',
      'Ergonomic grip design',
      'Universal fit 14.5-15 inch',
      'Easy installation',
      'Breathable and odorless'
    ],
    stock: 456
  },

  // Organic Groceries
  {
    id: 10,
    unique_id: 'YALI-PROD-0010',
    name: 'Organic Turmeric Powder - 100% Pure & Chemical-Free (1kg)',
    price: 12.99,
    originalPrice: 18.99,
    rating: 4.9,
    reviews: [
      { id: 1, author: 'Lakshmi Devi', rating: 5, date: 'May 25, 2026', comment: 'Best turmeric! Pure and fresh. Great color and aroma.', verified: true, helpful: 456 },
      { id: 2, author: 'Radha Krishna', rating: 5, date: 'May 20, 2026', comment: 'Excellent quality! Much better than store-bought turmeric.', verified: true, helpful: 234 }
    ],
    discount: 32,
    badge: 'Bestseller',
    category: 'organic-groceries',
    image: 'https://images.unsplash.com/photo-1606951443958-5563274417a7?w=500&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1606951443958-5563274417a7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1768729340925-2749ecdc211c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=500&h=500&fit=crop'
    ],
    description: 'Premium organic turmeric powder sourced from certified organic farms. No chemicals, preservatives, or additives. High curcumin content for maximum health benefits.',
    features: [
      '100% organic and chemical-free',
      'High curcumin content (5-6%)',
      'Certified organic by USDA',
      'Farm-fresh and stone-ground',
      'No preservatives or additives',
      'Resealable packaging'
    ],
    specs: [
      { label: 'Weight', value: '1 kg' },
      { label: 'Origin', value: 'Organic Farms' },
      { label: 'Certification', value: 'USDA Organic' },
      { label: 'Shelf Life', value: '12 months' },
      { label: 'Curcumin', value: '5-6%' }
    ],
    stock: 567
  },
  {
    id: 11,
    unique_id: 'YALI-PROD-0011',
    name: 'Pure Organic Jaggery - Traditional Gur (2kg Block)',
    price: 9.99,
    originalPrice: 14.99,
    rating: 4.8,
    reviews: [
      { id: 1, author: 'Meena Kumari', rating: 5, date: 'May 23, 2026', comment: 'Pure and natural jaggery! Perfect sweetness and taste.', verified: true, helpful: 345 }
    ],
    discount: 33,
    badge: 'Organic',
    category: 'organic-groceries',
    image: 'https://images.unsplash.com/photo-1666818398897-381dd5eb9139?w=500&h=500&fit=crop',
    description: 'Traditional organic jaggery (gur) made from pure sugarcane juice. Rich in iron, minerals, and natural sweetness. No chemicals or additives.',
    features: [
      '100% pure sugarcane jaggery',
      'No chemicals or preservatives',
      'Rich in iron and minerals',
      'Traditional preparation method',
      'Natural sweetener alternative',
      'Easy to store and use'
    ],
    specs: [
      { label: 'Weight', value: '2 kg Block' },
      { label: 'Type', value: 'Sugarcane Jaggery' },
      { label: 'Processing', value: 'Traditional Method' },
      { label: 'Shelf Life', value: '6 months' }
    ],
    stock: 423
  },
  {
    id: 12,
    unique_id: 'YALI-PROD-0012',
    name: 'Organic Spice Combo - Turmeric, Cumin, Coriander, Chili (4-Pack)',
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.9,
    reviews: [
      { id: 1, author: 'Anita Sharma', rating: 5, date: 'May 17, 2026', comment: 'Amazing combo! All spices are fresh and aromatic. Great value!', verified: true, helpful: 289 }
    ],
    discount: 29,
    badge: 'Value Pack',
    category: 'organic-groceries',
    image: 'https://images.unsplash.com/photo-1594813593996-7f0d9868ce8e?w=500&h=500&fit=crop',
    description: 'Complete organic spice pack with turmeric, cumin, coriander, and red chili powder. All sourced from certified organic farms.',
    features: [
      '4 essential spices pack',
      '100% organic certification',
      'Stone-ground for freshness',
      'No artificial colors or preservatives',
      'Individual resealable pouches',
      '250g each spice'
    ],
    stock: 345
  }
];
