import {
  ArrowLeft, Play, Film, Sparkles, Building2, Home, Bike, Car, Leaf,
  Star, ShoppingCart, Heart, ChevronRight, MapPin, Bed, Bath, Square,
  Shield, Zap, Award, CheckCircle, Phone, Clock, Truck, RotateCcw,
  Sun, Droplets, ThumbsUp, Package, Settings, Wrench, Gauge, Flame,
  Layers, Tag, ChevronLeft, Filter, X
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { formatINR } from '../utils/currency';
import { VideoCard } from './HomeVideoSection';
import { API_URL } from '../config';
import { DynamicSectionRenderer } from './sections/DynamicSectionRenderer';
import { ProductScrollRow } from '../App';

// ─── Category master config ────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  'real-estate': {
    title: 'Real Estate', tagline: 'Discover Premium Properties',
    description: 'Luxury villas, farm lands & smart homes curated for discerning buyers.',
    icon: Building2, accentHex: '#0066cc',
    heroGradient: 'from-slate-950 via-blue-950 to-indigo-950',
    accentGradient: 'from-blue-500 to-indigo-600',
    pillColor: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    highlightColor: 'text-blue-400', bgLight: 'bg-blue-50', borderAccent: 'border-blue-200',
    stats: [
      { label: 'Properties Listed', value: '1,200+', icon: Building2 },
      { label: 'Verified Sellers', value: '340+', icon: Shield },
      { label: 'Happy Buyers', value: '5,800+', icon: ThumbsUp },
      { label: 'Cities Covered', value: '28', icon: MapPin },
    ],
    features: [
      { icon: Shield, label: 'RERA Verified', desc: 'All listings RERA certified' },
      { icon: MapPin, label: 'Prime Locations', desc: 'Gated communities & city hubs' },
      { icon: Phone, label: 'Expert Guidance', desc: 'Dedicated property advisors' },
      { icon: CheckCircle, label: 'Legal Clearance', desc: 'Title-clear properties only' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80',
    // ── Flipkart-style promo banners ──
    promoBanners: [
      {
        id: 'p1', label: 'Luxury Villas', tag: 'MEGA SALE',
        headline: 'Dream Villas at Lowest Price', sub: 'Up to 15% off on select properties',
        cta: 'Explore Now', filter: 'Villas',
        gradient: 'from-blue-700 via-blue-600 to-indigo-700',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80',
      },
      {
        id: 'p2', label: 'Farm Land', tag: 'NEW LISTINGS',
        headline: 'Invest in Organic Farm Land', sub: 'Premium acres from ₹25 Lakh onwards',
        cta: 'View Listings', filter: 'Farm Land',
        gradient: 'from-emerald-700 via-teal-600 to-cyan-700',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
      },
      {
        id: 'p3', label: 'Apartments', tag: 'READY TO MOVE',
        headline: 'Modern Apartments, Zero Wait', sub: 'Possession in 30 days — RERA approved',
        cta: 'Book Site Visit', filter: 'Apartments',
        gradient: 'from-violet-700 via-purple-600 to-pink-700',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
      },
    ],
    // ── Sub-category icon grid (Flipkart style) ──
    subCategories: [
      { label: 'Villas', emoji: '🏡', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&q=80', filter: 'Villas' },
      { label: 'Apartments', emoji: '🏢', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80', filter: 'Apartments' },
      { label: 'Farm Land', emoji: '🌾', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80', filter: 'Farm Land' },
      { label: 'Plots', emoji: '📐', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Plots' },
      { label: 'Penthouse', emoji: '🏙️', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80', filter: 'Penthouse' },
      { label: 'Row Houses', emoji: '🏘️', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=200&q=80', filter: 'Row Houses' },
      { label: 'Commercial', emoji: '🏬', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&q=80', filter: 'Commercial' },
      { label: 'Beach Homes', emoji: '🌊', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=200&q=80', filter: 'Beach Homes' },
      { label: 'Hill Retreats', emoji: '⛰️', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80', filter: 'Hill Retreats' },
      { label: 'Smart Homes', emoji: '🤖', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Smart Homes' },
    ],
    filterTabs: ['All', 'Villas', 'Apartments', 'Farm Land', 'Plots', 'Penthouse', 'Commercial'],
  },

  'properties': {
    title: 'Properties', tagline: 'Your Next Chapter Starts Here',
    description: 'Commercial spaces, office hubs & residential complexes for modern lifestyles.',
    icon: Home, accentHex: '#10b981',
    heroGradient: 'from-emerald-950 via-teal-900 to-cyan-950',
    accentGradient: 'from-emerald-500 to-teal-500',
    pillColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    highlightColor: 'text-emerald-400', bgLight: 'bg-emerald-50', borderAccent: 'border-emerald-200',
    stats: [
      { label: 'Properties', value: '850+', icon: Home },
      { label: 'Sq Ft Range', value: '200-5000', icon: Square },
      { label: 'Bedrooms', value: '1–5 BHK', icon: Bed },
      { label: 'Ready to Move', value: '420+', icon: CheckCircle },
    ],
    features: [
      { icon: Bed, label: '1–5 BHK Options', desc: 'Studio to luxury suites' },
      { icon: Bath, label: 'Modern Amenities', desc: 'Clubhouse, pool & gym' },
      { icon: Shield, label: 'Bank Approved', desc: 'Home loan assistance' },
      { icon: Truck, label: 'Assisted Move-in', desc: 'Relocation support available' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1400&q=80',
    promoBanners: [
      {
        id: 'p1', label: '1 BHK Homes', tag: 'BEST VALUE',
        headline: 'Compact & Cozy 1 BHK Flats', sub: 'Starting from just ₹18 Lakh',
        cta: 'Browse Now', filter: '1 BHK',
        gradient: 'from-emerald-700 via-teal-600 to-green-700',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
      },
      {
        id: 'p2', label: 'Luxury 3 BHK', tag: 'TOP PICK',
        headline: 'Spacious 3 BHK with Club Life', sub: 'Pool, gym & 24×7 security included',
        cta: 'Explore 3 BHK', filter: '3 BHK',
        gradient: 'from-cyan-700 via-blue-600 to-teal-700',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
      },
      {
        id: 'p3', label: 'Commercial Offices', tag: 'HOT DEAL',
        headline: 'Premium Office Spaces for Lease', sub: 'Plug-and-play cabins from ₹8,000/mo',
        cta: 'See Offices', filter: 'Offices',
        gradient: 'from-indigo-700 via-violet-600 to-purple-700',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
      },
    ],
    subCategories: [
      { label: '1 BHK', emoji: '🛏️', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=80', filter: '1 BHK' },
      { label: '2 BHK', emoji: '🏠', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80', filter: '2 BHK' },
      { label: '3 BHK', emoji: '🏡', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&q=80', filter: '3 BHK' },
      { label: '4 BHK', emoji: '🏰', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&q=80', filter: '4 BHK' },
      { label: 'Studio', emoji: '🛋️', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200&q=80', filter: 'Studio' },
      { label: 'Duplex', emoji: '🏗️', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80', filter: 'Duplex' },
      { label: 'Offices', emoji: '💼', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80', filter: 'Offices' },
      { label: 'Warehouses', emoji: '🏭', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=200&q=80', filter: 'Warehouses' },
      { label: 'Co-working', emoji: '💻', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&q=80', filter: 'Co-working' },
      { label: 'Serviced Apts', emoji: '🔑', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&q=80', filter: 'Serviced Apts' },
    ],
    filterTabs: ['All', '1 BHK', '2 BHK', '3 BHK', 'Studio', 'Offices', 'Warehouses'],
  },

  'bike-accessories': {
    title: 'Bike Accessories', tagline: 'Gear Up. Ride Bold.',
    description: 'Performance helmets, saddle bags, lights and cycling mods for every rider.',
    icon: Bike, accentHex: '#06b6d4',
    heroGradient: 'from-gray-950 via-slate-900 to-cyan-950',
    accentGradient: 'from-cyan-400 to-blue-500',
    pillColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
    highlightColor: 'text-cyan-400', bgLight: 'bg-cyan-50', borderAccent: 'border-cyan-200',
    stats: [
      { label: 'Products', value: '600+', icon: Package },
      { label: 'Brands', value: '35+', icon: Award },
      { label: 'Ratings', value: '4.8★', icon: Star },
      { label: 'Sold This Month', value: '2,100+', icon: Zap },
    ],
    features: [
      { icon: Shield, label: 'Safety Certified', desc: 'ISI & CE marked helmets' },
      { icon: Zap, label: 'Performance Parts', desc: 'Aerodynamic accessories' },
      { icon: Settings, label: 'Universal Fit', desc: 'Compatible with all bikes' },
      { icon: Truck, label: 'Fast Delivery', desc: 'Ships within 24 hours' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    promoBanners: [
      {
        id: 'p1', label: 'Helmets', tag: 'SAFETY FIRST',
        headline: 'Premium Helmets up to 40% Off', sub: 'ISI & CE certified — ride protected',
        cta: 'Shop Helmets', filter: 'Helmets',
        gradient: 'from-cyan-700 via-blue-600 to-teal-700',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      },
      {
        id: 'p2', label: 'Lights & Reflectors', tag: 'NIGHT RIDER',
        headline: 'Be Seen in the Dark', sub: 'USB rechargeable LED sets from ₹299',
        cta: 'Buy Lights', filter: 'Lights',
        gradient: 'from-yellow-600 via-orange-500 to-amber-700',
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80',
      },
      {
        id: 'p3', label: 'Saddle Bags', tag: 'COMMUTER SPECIAL',
        headline: 'Waterproof Bags for Daily Rides', sub: 'Expandable & lightweight — from ₹499',
        cta: 'Explore Bags', filter: 'Bags',
        gradient: 'from-violet-700 via-purple-600 to-indigo-700',
        image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&q=80',
      },
    ],
    subCategories: [
      { label: 'Helmets', emoji: '⛑️', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Helmets' },
      { label: 'Lights', emoji: '💡', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200&q=80', filter: 'Lights' },
      { label: 'Saddle Bags', emoji: '🎒', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200&q=80', filter: 'Bags' },
      { label: 'Locks', emoji: '🔒', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Locks' },
      { label: 'Gloves', emoji: '🧤', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&q=80', filter: 'Gloves' },
      { label: 'Mirrors', emoji: '🪞', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200&q=80', filter: 'Mirrors' },
      { label: 'Tyres', emoji: '⚙️', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200&q=80', filter: 'Tyres' },
      { label: 'Stands', emoji: '🚲', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Stands' },
      { label: 'Bells', emoji: '🔔', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&q=80', filter: 'Bells' },
      { label: 'Water Bottles', emoji: '💧', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200&q=80', filter: 'Water Bottles' },
      { label: 'Knee Guards', emoji: '🦿', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200&q=80', filter: 'Knee Guards' },
      { label: 'Cycling Jerseys', emoji: '👕', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Jerseys' },
    ],
    filterTabs: ['All', 'Helmets', 'Lights', 'Bags', 'Locks', 'Gloves', 'Mirrors', 'Tyres'],
  },

  'car-accessories': {
    title: 'Car Accessories', tagline: 'Drive in Style & Comfort',
    description: 'Premium detailing, seat covers, floor mats, and all-weather protection gear.',
    icon: Car, accentHex: '#8b5cf6',
    heroGradient: 'from-violet-950 via-purple-950 to-indigo-950',
    accentGradient: 'from-violet-500 to-purple-600',
    pillColor: 'bg-violet-500/20 text-violet-200 border-violet-500/30',
    highlightColor: 'text-violet-400', bgLight: 'bg-violet-50', borderAccent: 'border-violet-200',
    stats: [
      { label: 'Products', value: '900+', icon: Car },
      { label: 'Car Models', value: '200+', icon: Settings },
      { label: 'Avg Rating', value: '4.7★', icon: Star },
      { label: 'Orders Shipped', value: '15K+', icon: Truck },
    ],
    features: [
      { icon: Shield, label: 'Premium Materials', desc: 'Aircraft-grade alloys & leather' },
      { icon: Gauge, label: 'OEM Fit Guarantee', desc: 'Exact factory-match parts' },
      { icon: Wrench, label: 'Easy Installation', desc: 'No-drill clip-on designs' },
      { icon: RotateCcw, label: '30-Day Returns', desc: 'Hassle-free return policy' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=80',
    promoBanners: [
      {
        id: 'p1', label: 'Seat Covers', tag: 'BEST SELLER',
        headline: 'Premium Leather Seat Covers', sub: 'Universal fit for all car models — from ₹899',
        cta: 'Shop Seat Covers', filter: 'Seat Covers',
        gradient: 'from-violet-700 via-purple-600 to-indigo-700',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
      },
      {
        id: 'p2', label: 'Car Polish', tag: 'GLEAM UP',
        headline: 'Deep Gloss Polish Kits', sub: 'Showroom shine in under 30 minutes',
        cta: 'Polish Now', filter: 'Polish',
        gradient: 'from-rose-700 via-pink-600 to-red-700',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      },
      {
        id: 'p3', label: 'Dash Cams', tag: 'DRIVE SAFE',
        headline: '4K Dash Cams with Night Vision', sub: 'GPS + parking mode — from ₹2,499',
        cta: 'View Dash Cams', filter: 'Dash Cams',
        gradient: 'from-slate-700 via-gray-600 to-zinc-700',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80',
      },
    ],
    subCategories: [
      { label: 'Seat Covers', emoji: '💺', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80', filter: 'Seat Covers' },
      { label: 'Floor Mats', emoji: '🟫', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Floor Mats' },
      { label: 'Car Polish', emoji: '✨', image: 'https://images.unsplash.com/photo-1506919258185-6078bba55d2a?w=200&q=80', filter: 'Polish' },
      { label: 'Windshield', emoji: '🪟', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&q=80', filter: 'Wipers' },
      { label: 'Dash Cams', emoji: '📹', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Dash Cams' },
      { label: 'Air Fresheners', emoji: '🌸', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80', filter: 'Air Fresheners' },
      { label: 'Car Covers', emoji: '🛡️', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80', filter: 'Car Covers' },
      { label: 'Steering Covers', emoji: '🎡', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Steering Covers' },
      { label: 'Tyre Inflators', emoji: '🔧', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&q=80', filter: 'Tyre Inflators' },
      { label: 'GPS Trackers', emoji: '📡', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80', filter: 'GPS' },
      { label: 'Back Camera', emoji: '📷', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', filter: 'Back Camera' },
      { label: 'Car Chargers', emoji: '🔌', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80', filter: 'Car Chargers' },
    ],
    filterTabs: ['All', 'Seat Covers', 'Floor Mats', 'Polish', 'Wipers', 'Dash Cams', 'Car Covers'],
  },

  'organic-groceries': {
    title: 'Organic Groceries', tagline: 'Pure. Natural. Farm Fresh.',
    description: 'Chemical-free grains, spices, fruits and dairy sourced directly from certified farms.',
    icon: Leaf, accentHex: '#f59e0b',
    heroGradient: 'from-stone-950 via-amber-950 to-emerald-950',
    accentGradient: 'from-amber-400 to-emerald-500',
    pillColor: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    highlightColor: 'text-amber-400', bgLight: 'bg-amber-50', borderAccent: 'border-amber-200',
    stats: [
      { label: 'Farm Partners', value: '120+', icon: Leaf },
      { label: 'Organic SKUs', value: '400+', icon: Package },
      { label: 'No Chemicals', value: '100%', icon: CheckCircle },
      { label: 'Same Day Ship', value: 'Available', icon: Zap },
    ],
    features: [
      { icon: Leaf, label: 'Certified Organic', desc: 'NPOP & India Organic certified' },
      { icon: Sun, label: 'Naturally Grown', desc: 'Zero pesticides, zero GMO' },
      { icon: Droplets, label: 'Cold Chain Fresh', desc: 'Temperature-controlled delivery' },
      { icon: Flame, label: 'High Nutritional Value', desc: 'Unprocessed & raw' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80',
    promoBanners: [
      {
        id: 'p1', label: 'Fresh Produce', tag: 'FARM TO TABLE',
        headline: 'Seasonal Fruits & Vegetables', sub: 'Delivered within 24hrs of harvest',
        cta: 'Order Fresh', filter: 'Fruits',
        gradient: 'from-green-700 via-emerald-600 to-teal-700',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      },
      {
        id: 'p2', label: 'Spices & Masalas', tag: 'PURE AROMA',
        headline: 'Hand-ground Organic Spices', sub: 'No additives, no preservatives — ₹99 onwards',
        cta: 'Buy Spices', filter: 'Spices',
        gradient: 'from-orange-700 via-amber-600 to-yellow-700',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
      },
      {
        id: 'p3', label: 'Cold-pressed Oils', tag: 'HEART HEALTHY',
        headline: 'Pure Cold-Pressed Edible Oils', sub: 'Groundnut, Coconut & Sesame — from ₹249',
        cta: 'Shop Oils', filter: 'Oils',
        gradient: 'from-yellow-700 via-lime-600 to-green-700',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
      },
    ],
    subCategories: [
      { label: 'Rice & Grains', emoji: '🌾', image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9ef64?w=200&q=80', filter: 'Grains' },
      { label: 'Spices', emoji: '🌶️', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&q=80', filter: 'Spices' },
      { label: 'Pulses', emoji: '🫘', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=200&q=80', filter: 'Pulses' },
      { label: 'Cold-pressed Oils', emoji: '🧴', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80', filter: 'Oils' },
      { label: 'Dairy', emoji: '🥛', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80', filter: 'Dairy' },
      { label: 'Fresh Fruits', emoji: '🍎', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80', filter: 'Fruits' },
      { label: 'Vegetables', emoji: '🥦', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', filter: 'Vegetables' },
      { label: 'Honey & Jams', emoji: '🍯', image: 'https://images.unsplash.com/photo-1582797493098-a4aefd4b3ad3?w=200&q=80', filter: 'Honey' },
      { label: 'Tea & Coffee', emoji: '☕', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=200&q=80', filter: 'Tea & Coffee' },
      { label: 'Dry Fruits', emoji: '🥜', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80', filter: 'Dry Fruits' },
      { label: 'Superfoods', emoji: '💚', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=200&q=80', filter: 'Superfoods' },
      { label: 'Flours', emoji: '🌽', image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9ef64?w=200&q=80', filter: 'Flours' },
    ],
    filterTabs: ['All', 'Grains', 'Spices', 'Dairy', 'Fruits', 'Vegetables', 'Oils', 'Pulses'],
  },
};

// ─── Static videos per category ───────────────────────────────────────────────
const CATEGORY_VIDEOS = {
  'real-estate': [
    { id: 're-v1', title: 'Luxury Modern Villa Tour', shortTitle: 'Luxury Villa', desc: 'Take an exterior walk-in tour of our smart, solar-equipped residential villas.', url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-44141-large.mp4', duration: '0:15' },
    { id: 're-v2', title: 'Interior Living Spaces & Comfort', shortTitle: 'Living Spaces', desc: 'Explore the fireplace and open-concept lounges of our premium properties.', url: 'https://assets.mixkit.co/videos/preview/mixkit-cozy-living-room-with-active-fireplace-43093-large.mp4', duration: '0:09' },
    { id: 're-v3', title: 'Suburban Family Neighborhoods', shortTitle: 'Suburban Homes', desc: 'Browse beautiful family homes situated in secure, green suburban communities.', url: 'https://assets.mixkit.co/videos/preview/mixkit-residential-house-with-a-front-yard-44139-large.mp4', duration: '0:12' },
  ],
  'properties': [
    { id: 'prop-v1', title: 'Deal Closing & Key Handover', shortTitle: 'Key Handover', desc: 'Quick walkthrough of final documentation and secure property handover.', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-real-estate-agent-holding-house-keys-40226-large.mp4', duration: '0:14' },
    { id: 'prop-v2', title: 'Acre Cabin Property Highlights', shortTitle: 'Cabin Retreats', desc: 'Snow-capped retreat cabins built in scenic countryside and holiday locations.', url: 'https://assets.mixkit.co/videos/preview/mixkit-wooden-house-in-the-snow-at-sunset-41617-large.mp4', duration: '0:10' },
    { id: 'prop-v3', title: 'Modern Commercial Offices', shortTitle: 'Office Spaces', desc: 'Premium fully-serviced office desks and conference rooms in commercial business hubs.', url: 'https://assets.mixkit.co/videos/preview/mixkit-camera-moving-through-an-empty-office-space-40228-large.mp4', duration: '0:11' },
  ],
  'bike-accessories': [
    { id: 'bike-v1', title: 'Helmet Safety & Forest Trails', shortTitle: 'Safety Helmets', desc: 'Aerodynamic carbon fiber helmet testing in demanding single-track settings.', url: 'https://assets.mixkit.co/videos/preview/mixkit-cyclist-riding-on-a-road-in-the-forest-41604-large.mp4', duration: '0:11' },
    { id: 'bike-v2', title: 'City Commuting & Saddle Bags', shortTitle: 'Commuter Bags', desc: 'Waterproof saddle bags demonstration for daily metropolitan biking trips.', url: 'https://assets.mixkit.co/videos/preview/mixkit-riding-a-bicycle-on-a-city-street-41605-large.mp4', duration: '0:08' },
    { id: 'bike-v3', title: 'Bicycle Maintenance & Repairs', shortTitle: 'Bicycle Care', desc: 'Learn to swap bike tyres and fit accessory parts with ease.', url: 'https://assets.mixkit.co/videos/preview/mixkit-man-hands-installing-a-wheel-on-a-bicycle-41603-large.mp4', duration: '0:14' },
  ],
  'car-accessories': [
    { id: 'car-v1', title: 'Premium Polish & Shine Care', shortTitle: 'Shine Polish', desc: 'Step-by-step application instructions for deep-gloss paint restoration polish.', url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-cleaning-his-car-40277-large.mp4', duration: '0:12' },
    { id: 'car-v2', title: 'All-Weather Floor Protection', shortTitle: 'Floor Mats', desc: 'Heavy duty rubber mat setup and trim guide for sedans and SUVs.', url: 'https://assets.mixkit.co/videos/preview/mixkit-driving-a-car-on-a-highway-during-sunset-41611-large.mp4', duration: '0:14' },
    { id: 'car-v3', title: 'Windshield Wipers & Winter Gears', shortTitle: 'Winter Accessories', desc: 'Equip your car with durable all-weather wipers and winter safety modifications.', url: 'https://assets.mixkit.co/videos/preview/mixkit-car-windshield-wipers-sweeping-away-rain-41608-large.mp4', duration: '0:12' },
  ],
  'organic-groceries': [
    { id: 'groc-v1', title: 'Sourcing Spices & Fresh Produce', shortTitle: 'Farm Staples', desc: 'Organic farmer collections, cleaning, and packing direct farm staples.', url: 'https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-in-a-crate-in-the-kitchen-40284-large.mp4', duration: '0:15' },
    { id: 'groc-v2', title: 'Fresh Milk & Cooking Guide', shortTitle: 'Milk & Cooking', desc: 'Pure farm organic milk and cooking ideas using direct organic ingredients.', url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-fresh-milk-into-a-glass-on-a-wooden-table-40294-large.mp4', duration: '0:11' },
    { id: 'groc-v3', title: 'Hand-Picked Fresh Berries', shortTitle: 'Fresh Berries', desc: 'Select direct farm-fresh organic strawberries and fruits delivered in cold-chains.', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-fresh-organic-strawberries-40292-large.mp4', duration: '0:13' },
  ],
};

// ─── Video Accordion Panel Removed (Replaced by VideoCard) ─────────────
// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ feature, cfg }) {
  return (
    <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 bg-gradient-to-br ${cfg.accentGradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <feature.icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-black text-gray-900">{feature.label}</p>
        <p className="text-xs text-gray-500">{feature.desc}</p>
      </div>
    </div>
  );
}

// ─── Promo Banner Card (Flipkart-style) ──────────────────────────────────────
function PromoBannerCard({ banner, onFilterSelect, cfg }) {
  return (
    <div
      onClick={() => onFilterSelect(banner.filter)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group bg-gradient-to-br ${banner.gradient} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
      style={{ minHeight: '180px' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-white/5 rounded-full" />

      {/* Background photo */}
      <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-25 bg-cover bg-center rounded-r-2xl"
        style={{ backgroundImage: `url(${banner.image})` }} />

      {/* Content */}
      <div className="relative p-6">
        <span className="inline-block bg-white/25 backdrop-blur-sm border border-white/30 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3">
          {banner.tag}
        </span>
        <h3 className="text-white font-black text-lg md:text-xl leading-tight mb-1 max-w-[60%]">{banner.headline}</h3>
        <p className="text-white/75 text-xs mb-4 max-w-[65%]">{banner.sub}</p>
        <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-black px-4 py-2 rounded-full group-hover:gap-2.5 transition-all">
          {banner.cta} <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

// ─── Sub-Category Icon (Flipkart grid style) ──────────────────────────────────
function SubCategoryIcon({ item, isActive, onClick, cfg }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group cursor-pointer"
    >
      <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
        isActive
          ? 'border-transparent scale-105 shadow-lg ring-2'
          : 'border-gray-200 hover:border-transparent hover:shadow-md hover:scale-105'
      }`}
        style={isActive ? { borderColor: cfg.accentHex, boxShadow: `0 0 0 2px ${cfg.accentHex}` } : {}}
      >
        <img
          src={item.image}
          alt={item.label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="hidden w-full h-full items-center justify-center text-2xl bg-gray-100">
          {item.emoji}
        </div>
        {isActive && (
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <div className="w-full h-1 rounded-full" style={{ background: cfg.accentHex }} />
          </div>
        )}
      </div>
      <span className={`text-[10px] md:text-xs font-bold text-center leading-tight transition-colors ${
        isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
      }`}
        style={isActive ? { color: cfg.accentHex } : {}}
      >
        {item.label}
      </span>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ cfg, onBackToHome, subCategoryFilter }) {
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`w-20 h-20 bg-gradient-to-br ${cfg.accentGradient} rounded-3xl flex items-center justify-center mb-5 shadow-xl`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">
        {subCategoryFilter !== 'All' ? `No "${subCategoryFilter}" products yet` : 'No listings yet'}
      </h3>
      <p className="text-gray-500 max-w-xs text-sm mb-6">
        {subCategoryFilter !== 'All'
          ? `We're stocking ${subCategoryFilter} soon. Explore other sub-categories!`
          : `We're curating the best ${cfg.title.toLowerCase()} for you. Check back soon.`
        }
      </p>
      <button onClick={onBackToHome}
        className={`bg-gradient-to-r ${cfg.accentGradient} text-white px-7 py-3 rounded-xl font-black text-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer`}>
        ← Back to Home
      </button>
    </div>
  );
}

// ─── MAIN CATEGORY PAGE ───────────────────────────────────────────────────────
export function CategoryPage({
  categoryKey, onBackToHome, products,
  onAddToCart, onProductClick, wishlistItems, onToggleWishlist,
  videos: backendVideos = [],
  subCategories: dbSubCategories = []
}) {
  const cfg = CATEGORY_CONFIG[categoryKey] || {
    title: 'Category', tagline: 'Explore Products', description: 'Hand-picked items for you.',
    icon: Sparkles, accentHex: '#6366f1',
    heroGradient: 'from-gray-900 to-gray-800', accentGradient: 'from-indigo-500 to-purple-500',
    pillColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    highlightColor: 'text-indigo-400', bgLight: 'bg-indigo-50', borderAccent: 'border-indigo-200',
    stats: [], features: [], promoBanners: [], subCategories: [], filterTabs: ['All'],
    heroImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
  };

  const backendCatVideos = backendVideos
    .filter(v => v.category === categoryKey)
    .map(v => ({ id: `db-${v.id}`, title: v.title, shortTitle: v.shortTitle || v.title, desc: v.desc || v.description || '', url: v.url, duration: v.duration || '0:15' }));
  const videos = backendCatVideos.length > 0 ? backendCatVideos : (CATEGORY_VIDEOS[categoryKey] || []);

  const dynamicSubCats = dbSubCategories
    .filter(sc => sc.category_value === categoryKey && sc.status === 'active')
    .map(sc => ({
      label: sc.label,
      emoji: sc.emoji,
      image: sc.image_url,
      filter: sc.filter_tag
    }));

  const activeSubCategories = dynamicSubCats.length > 0 ? dynamicSubCats : (cfg.subCategories || []);

  const [expandedId, setExpandedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeSubCat, setActiveSubCat] = useState('All');   // sub-category icon filter
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  
  const [dynamicSections, setDynamicSections] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [sidebarFilters, setSidebarFilters] = useState({
    categories: [],
    brands: [],
    priceMin: '',
    priceMax: '',
    ratings: [],
    discounts: []
  });

  // Scroll ref for sub-category row
  const subCatRef = useRef(null);

  useEffect(() => {
    setExpandedId(videos[0]?.id || null);
    setActiveSubCat('All');
    setSortBy('default');

    setIsLoadingSections(true);
    fetch(`${API_URL}/page-sections/category:${categoryKey}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicSections(data);
        setIsLoadingSections(false);
      })
      .catch(err => {
        console.error('Failed to fetch category layout', err);
        setIsLoadingSections(false);
      });
  }, [categoryKey]);

  const CategoryIcon = cfg.icon;
  const allProducts = products.filter(p => p.category === categoryKey);

  // Filter by sub-category: tries to match product name/category/badge loosely
  const filteredBySubCat = useMemo(() => {
    return activeSubCat === 'All'
      ? allProducts
      : allProducts.filter(p => {
          const haystack = `${p.name} ${p.subcategory || ''} ${p.badge || ''} ${p.description || ''}`.toLowerCase();
          const tag = activeSubCat.toLowerCase();
          
          // Simple plural matching: if tag ends with 's', try checking without 's' as well.
          let singularTag = tag;
          if (tag.endsWith('s')) {
            singularTag = tag.slice(0, -1);
          }
          
          return haystack.includes(tag) || haystack.includes(singularTag);
        });
  }, [allProducts, activeSubCat]);

  const availableBrands = useMemo(() => {
    const brands = new Set();
    filteredBySubCat.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [filteredBySubCat]);

  // Apply Sidebar Filters
  const fullyFiltered = useMemo(() => {
    return filteredBySubCat.filter(p => {
      // We don't filter by 'category' again because we are already in a specific category page,
      // but if we had sub-category checkboxes in the sidebar, we'd do it here.
      // For now we just apply price, rating, discount.

      if (sidebarFilters.brands?.length > 0 && !sidebarFilters.brands.includes(p.brand)) return false;

      const price = parseFloat(p.price);
      if (sidebarFilters.priceMin && price < parseFloat(sidebarFilters.priceMin)) return false;
      if (sidebarFilters.priceMax && price > parseFloat(sidebarFilters.priceMax)) return false;

      if (sidebarFilters.ratings?.length > 0) {
        const minRatingSelected = Math.min(...sidebarFilters.ratings);
        if ((p.rating || 0) < minRatingSelected) return false;
      }

      if (sidebarFilters.discounts?.length > 0) {
        const minDiscountSelected = Math.min(...sidebarFilters.discounts);
        if ((p.discount || 0) < minDiscountSelected) return false;
      }

      if (sidebarFilters.assured) {
        const isAssured = p.isAssured || (p.rating >= 4);
        if (!isAssured) return false;
      }

      return true;
    });
  }, [filteredBySubCat, sidebarFilters]);

  // Sort
  const displayProducts = useMemo(() => {
    const sorted = [...fullyFiltered];
    if (sortBy === 'price-asc') sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    else if (sortBy === 'price-desc') sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    else if (sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);
    return sorted;
  }, [fullyFiltered, sortBy]);

  // When a banner or sub-cat is clicked → filter + scroll to products
  const handleFilterSelect = (filterLabel) => {
    setActiveSubCat(filterLabel);
    setTimeout(() => document.getElementById('cat-products')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const scrollSubCat = (dir) => {
    if (subCatRef.current) subCatRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <div className="pb-20 animate-fade-in">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — CINEMATIC HERO HEADER
      ══════════════════════════════════════════════════════════ */}
      <div className={`relative -mx-4 overflow-hidden bg-gradient-to-br ${cfg.heroGradient}`} style={{ minHeight: '500px' }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${cfg.heroImage})` }} />
        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.heroGradient} opacity-80`} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: cfg.accentHex }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: cfg.accentHex }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-12">
          <button onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-sm mb-10 transition-all cursor-pointer group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end gap-10">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest mb-5 ${cfg.pillColor} backdrop-blur-sm`}>
                <CategoryIcon className="w-3.5 h-3.5" /> {cfg.title}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight mb-4">
                {cfg.tagline.split(' ').map((word, i, arr) => (
                  <span key={i}>{i === arr.length - 1 ? <span className={cfg.highlightColor}>{word}</span> : <span>{word} </span>}</span>
                ))}
              </h1>
              <p className="text-white/60 text-base md:text-lg max-w-xl font-medium leading-relaxed mb-8">{cfg.description}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => document.getElementById('cat-products')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`bg-gradient-to-r ${cfg.accentGradient} text-white font-black px-7 py-3.5 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-sm cursor-pointer`}>
                  Shop Now →
                </button>
                {videos.length > 0 && (
                  <button onClick={() => document.getElementById('cat-videos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm cursor-pointer">
                    <Play className="w-4 h-4 fill-white" /> Watch Videos
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            {cfg.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 lg:w-80 flex-shrink-0">
                {cfg.stats.map((stat, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                    <div className={`text-2xl font-black ${cfg.highlightColor}`}>{stat.value}</div>
                    <div className="text-white/50 text-xs font-semibold mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* ══════════════════════════════════════════════════════════
            DYNAMIC SECTIONS (If configured via Admin)
        ══════════════════════════════════════════════════════════ */}
        {!isLoadingSections && dynamicSections.length > 0 && (
          <div className="flex flex-col gap-2 mb-10">
            {dynamicSections.map(sec => (
              <DynamicSectionRenderer 
                key={sec.id} 
                section={sec} 
                products={products}
                videos={videos}
                banners={[]}
                uiCards={[]}
                wishlistItems={wishlistItems}
                onAddToCart={onAddToCart}
                onProductClick={onProductClick}
                onToggleWishlist={onToggleWishlist}
                onCategoryClick={() => {}}
                ProductScrollRowComponent={ProductScrollRow}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — FEATURES STRIP
      ══════════════════════════════════════════════════════════ */}
      {cfg.features.length > 0 && (
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cfg.features.map((f, i) => <FeatureCard key={i} feature={f} cfg={cfg} />)}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — PROMO BANNERS (Flipkart-style 3-col)
      ══════════════════════════════════════════════════════════ */}
      {cfg.promoBanners?.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-7 h-7 bg-gradient-to-br ${cfg.accentGradient} rounded-lg flex items-center justify-center`}>
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Trending Offers</h2>
            <span className="text-xs text-gray-400 font-semibold ml-1">· Click to explore sub-collection</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cfg.promoBanners.map(banner => (
              <PromoBannerCard
                key={banner.id}
                banner={banner}
                onFilterSelect={handleFilterSelect}
                cfg={cfg}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — SUB-CATEGORY ICON SCROLL GRID (Flipkart style)
      ══════════════════════════════════════════════════════════ */}
      {activeSubCategories.length > 0 && (
        <section className="mt-10">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900">Shop by Sub-Category</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Click any to filter products</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollSubCat(-1)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => scrollSubCat(1)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Scrollable row */}
            <div ref={subCatRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* "All" chip */}
              <button
                onClick={() => { setActiveSubCat('All'); }}
                className={`flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer`}
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all duration-200 ${
                  activeSubCat === 'All'
                    ? 'scale-105 shadow-lg'
                    : 'border-gray-200 bg-gray-50 hover:shadow-md hover:scale-105'
                }`}
                  style={activeSubCat === 'All' ? { borderColor: cfg.accentHex, background: `${cfg.accentHex}15`, boxShadow: `0 0 0 2px ${cfg.accentHex}` } : {}}>
                  🛒
                </div>
                <span className="text-[10px] md:text-xs font-bold text-center"
                  style={activeSubCat === 'All' ? { color: cfg.accentHex } : { color: '#6b7280' }}>All</span>
              </button>

              {activeSubCategories.map((item, i) => (
                <div key={i} className="flex-shrink-0">
                  <SubCategoryIcon
                    item={item}
                    isActive={activeSubCat === item.filter}
                    onClick={() => handleFilterSelect(item.filter)}
                    cfg={cfg}
                  />
                </div>
              ))}
            </div>

      {/* Active filter indicator */}
            {activeSubCat !== 'All' && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Showing:</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full text-white"
                  style={{ background: cfg.accentHex }}>
                  {activeSubCat}
                  <button onClick={() => setActiveSubCat('All')}
                    className="hover:opacity-70 transition-opacity cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
                <span className="text-gray-400">({displayProducts.length} products)</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — PRODUCTS CATALOG
      ══════════════════════════════════════════════════════════ */}
      <section id="cat-products" className="mt-10 scroll-mt-24">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {activeSubCat === 'All'
                ? <span>All <span style={{ color: cfg.accentHex }}>{cfg.title}</span> Products</span>
                : <span><span style={{ color: cfg.accentHex }}>{activeSubCat}</span> — All Products</span>
              }
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found
              {activeSubCat !== 'All' && (
                <button onClick={() => setActiveSubCat('All')}
                  className="ml-2 text-xs underline cursor-pointer hover:text-gray-700 transition-colors">
                  Clear filter
                </button>
              )}
            </p>
          </div>

          {allProducts.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm border border-gray-200 bg-white rounded-xl px-3 py-2 font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <span className="inline-block w-4 h-4 text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                </span>
                Filters
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 bg-white rounded-xl px-3 py-2 font-semibold text-gray-700 focus:outline-none cursor-pointer">
                <option value="default">Sort</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="hidden sm:flex bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                <button onClick={() => setViewMode('grid')} title="Grid view"
                  className={`p-2.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  style={viewMode === 'grid' ? { background: cfg.accentHex } : {}}>
                  <Layers className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} title="List view"
                  className={`p-2.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  style={viewMode === 'list' ? { background: cfg.accentHex } : {}}>
                  <Package className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <FilterSidebar 
              filters={sidebarFilters}
              onFilterChange={setSidebarFilters}
              availableBrands={availableBrands}
              showCategoryFilter={false} // Hiding category since we are already in one
              isOpen={isMobileFilterOpen}
              onClose={() => setIsMobileFilterOpen(false)}
            />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {displayProducts.length === 0 ? (
              <EmptyState cfg={cfg} onBackToHome={onBackToHome} subCategoryFilter={activeSubCat} />
            ) : (
              <>
                {/* Render Function for Product List */}
                {(() => {
                  const renderProductGrid = (productList, isTop) => {
                    if (productList.length === 0) return null;
                    return viewMode === 'grid' ? (
                      <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 ${!isTop ? 'mt-8' : ''}`}>
                        {productList.map(product => (
                          <div key={product.id} className="relative group">
                            {product.discount && (
                              <div className="absolute top-2 left-2 z-10 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md"
                                style={{ background: cfg.accentHex }}>
                                {product.discount}% OFF
                              </div>
                            )}
                            <ProductCard product={product} onAddToCart={onAddToCart} onProductClick={onProductClick}
                              isWishlisted={wishlistItems.some(i => i.id === product.id)} onToggleWishlist={onToggleWishlist} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`space-y-3 ${!isTop ? 'mt-8' : ''}`}>
                        {productList.map(product => (
                          <div key={product.id} onClick={() => onProductClick?.(product)}
                            className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group items-center">
                            <div className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={product.image} alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80'; }} />
                              {product.discount && (
                                <span className="absolute top-1 left-1 text-[9px] text-white font-black px-1.5 py-0.5 rounded-full"
                                  style={{ background: cfg.accentHex }}>{product.discount}% OFF</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-sm">{product.name}</h3>
                              {product.rating && (
                                <div className="flex items-center gap-1 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                                </div>
                              )}
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-gray-900">{formatINR(product.price)}</span>
                                {product.originalPrice && <span className="text-sm text-gray-400 line-through">{formatINR(product.originalPrice)}</span>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                                className="flex items-center gap-1.5 text-white text-xs font-black px-4 py-2 rounded-xl hover:scale-105 transition-all cursor-pointer"
                                style={{ background: `linear-gradient(135deg, ${cfg.accentHex}, ${cfg.accentHex}cc)` }}>
                                <ShoppingCart className="w-3.5 h-3.5" /> Add
                              </button>
                              <button onClick={e => { e.stopPropagation(); onToggleWishlist?.(product); }}
                                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                                  wishlistItems.some(i => i.id === product.id)
                                    ? 'bg-red-50 border-red-200 text-red-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-red-500'
                                }`}>
                                <Heart className={`w-3.5 h-3.5 ${wishlistItems.some(i => i.id === product.id) ? 'fill-red-500' : ''}`} />
                                {wishlistItems.some(i => i.id === product.id) ? 'Saved' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  };

                  const topProducts = displayProducts.slice(0, 8);
                  const bottomProducts = displayProducts.slice(8);

                  return (
                    <>
                      {renderProductGrid(topProducts, true)}

                      {/* Video Spotlights In-Between */}
                      {videos.length > 0 && (
                        <div id="cat-videos" className="my-10 relative overflow-hidden">
                          <h2 className="text-2xl font-black text-gray-900 mb-6">Featured Videos</h2>
                          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {videos.map(vid => (
                              <VideoCard 
                                key={vid.id} 
                                video={{
                                  ...vid, 
                                  category: categoryKey, 
                                  thumbnail: vid.thumbnail || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'
                                }} 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {renderProductGrid(bottomProducts, false)}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7 — BOTTOM TRUST STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="mt-16">
        <div className={`bg-gradient-to-br ${cfg.heroGradient} rounded-3xl p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: cfg.accentHex }} />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[['100%', 'Authentic Products'], ['30 Days', 'Easy Returns'], ['24/7', 'Customer Support']].map(([val, lbl]) => (
              <div key={lbl}>
                <div className={`text-3xl font-black ${cfg.highlightColor} mb-1`}>{val}</div>
                <div className="text-white/60 text-sm font-semibold">{lbl}</div>
              </div>
            ))}
          </div>
          <div className="relative flex justify-center mt-8">
            <button onClick={onBackToHome}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
