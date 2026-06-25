const { pool } = require('./db.js');

const mockData = [
  // Commercial
  {
    name: 'Prime IT Park Office Space',
    description: 'A 5000 sq.ft fully furnished office space located in the heart of the IT corridor.',
    price: 15000000,
    category: 'RealEstate',
    sub_category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      commercial_type: 'Office Space',
      sqft: '5000',
      parking_spots: '10',
      agent_name: 'John Doe',
      location: 'OMR, Chennai'
    }
  },
  {
    name: 'Downtown Retail Store',
    description: 'High footfall retail space suitable for premium brands.',
    price: 25000000,
    category: 'RealEstate',
    sub_category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1580828369019-2228cdf6f2cc?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      commercial_type: 'Retail',
      sqft: '1200',
      parking_spots: '2',
      agent_name: 'Jane Smith',
      location: 'T Nagar, Chennai'
    }
  },
  // Villas & Apartments
  {
    name: 'Sea View Luxury Villa',
    description: 'A premium 4BHK villa with an uninterrupted sea view and a private pool.',
    price: 45000000,
    category: 'RealEstate',
    sub_category: 'VillasApartments',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      property_type: 'Villa',
      bedrooms: '4',
      bathrooms: '5',
      sqft: '4200',
      location: 'ECR, Chennai'
    }
  },
  {
    name: 'Skyline 3BHK Apartment',
    description: 'Modern 3BHK apartment in a high-rise building with world-class amenities.',
    price: 12000000,
    category: 'RealEstate',
    sub_category: 'VillasApartments',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    stock: 5,
    status: 'active',
    metadata: {
      property_type: 'Apartment',
      bedrooms: '3',
      bathrooms: '3',
      sqft: '1800',
      location: 'Adyar, Chennai'
    }
  },
  // Rentals
  {
    name: 'Cozy Studio Apartment',
    description: 'Fully furnished studio apartment ideal for bachelors and young professionals.',
    price: 15000,
    category: 'RealEstate',
    sub_category: 'Rentals',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1e5250ce02?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      rental_type: 'Apartment',
      monthly_rent: '15000',
      security_deposit: '50000',
      furnishing: 'Fully Furnished',
      location: 'Velachery, Chennai'
    }
  },
  {
    name: 'Spacious Independent House',
    description: 'A 2BHK independent house with a small garden and covered parking.',
    price: 25000,
    category: 'RealEstate',
    sub_category: 'Rentals',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      rental_type: 'Independent House',
      monthly_rent: '25000',
      security_deposit: '150000',
      furnishing: 'Semi-Furnished',
      location: 'Anna Nagar, Chennai'
    }
  },
  // Agricultural Land
  {
    name: 'Fertile Farm Land',
    description: '5 acres of fertile agricultural land with a well and direct road access.',
    price: 5000000,
    category: 'RealEstate',
    sub_category: 'AgriculturalLand',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      land_type: 'Farm Land',
      acres: '5',
      water_source: 'Well',
      road_access: 'true',
      location: 'Kanchipuram, TN'
    }
  },
  {
    name: 'Coconut Grove',
    description: 'A well-maintained 2-acre coconut grove yielding steady income.',
    price: 3500000,
    category: 'RealEstate',
    sub_category: 'AgriculturalLand',
    image: 'https://images.unsplash.com/photo-1598466857140-5fcdccaa41ce?w=800&q=80',
    stock: 1,
    status: 'active',
    metadata: {
      land_type: 'Orchard',
      acres: '2',
      water_source: 'Borewell',
      road_access: 'true',
      location: 'Pollachi, TN'
    }
  }
];

async function seedRealEstate() {
  try {
    for (const item of mockData) {
      await pool.query(
        'INSERT INTO products (name, description, price, category, sub_category, image, stock, status, metadata, cta_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          item.name,
          item.description,
          item.price,
          item.category,
          item.sub_category,
          item.image,
          item.stock,
          item.status,
          JSON.stringify(item.metadata),
          'schedule_visit'
        ]
      );
    }
    console.log('Successfully inserted Real Estate mock data!');
  } catch (error) {
    console.error('Error inserting mock data:', error);
  } finally {
    process.exit(0);
  }
}

seedRealEstate();
