import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { API_URL } from '../config';

const CATEGORY_THEMES = {
  'properties-land': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-green-950', 
    border: 'border-green-900/50',
    titleText: 'text-white',
    subText: 'text-green-200/80',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-900/30',
    iconBorder: 'border-green-500/30',
    backBtn: 'text-green-400 hover:text-green-300'
  },
  'properties': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-green-950', 
    border: 'border-green-900/50',
    titleText: 'text-white',
    subText: 'text-green-200/80',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-900/30',
    iconBorder: 'border-green-500/30',
    backBtn: 'text-green-400 hover:text-green-300'
  },
  'vehicles-two-four-wheelers': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-blue-950', 
    border: 'border-blue-900/50',
    titleText: 'text-white',
    subText: 'text-blue-200/80',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-900/30',
    iconBorder: 'border-blue-500/30',
    backBtn: 'text-blue-400 hover:text-blue-300'
  },
  'organic-products': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-emerald-950', 
    border: 'border-emerald-900/50',
    titleText: 'text-white',
    subText: 'text-emerald-200/80',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-900/30',
    iconBorder: 'border-emerald-500/30',
    backBtn: 'text-emerald-400 hover:text-emerald-300'
  },
  'dry-fruits': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-orange-950', 
    border: 'border-orange-900/50',
    titleText: 'text-white',
    subText: 'text-orange-200/80',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-900/30',
    iconBorder: 'border-orange-500/30',
    backBtn: 'text-orange-400 hover:text-orange-300'
  },
  'dresses': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-purple-950', 
    border: 'border-purple-900/50',
    titleText: 'text-white',
    subText: 'text-purple-200/80',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-900/30',
    iconBorder: 'border-purple-500/30',
    backBtn: 'text-purple-400 hover:text-purple-300'
  },
  'fashion': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-purple-950', 
    border: 'border-purple-900/50',
    titleText: 'text-white',
    subText: 'text-purple-200/80',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-900/30',
    iconBorder: 'border-purple-500/30',
    backBtn: 'text-purple-400 hover:text-purple-300'
  },
  'default': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-[#083366]/40', 
    border: 'border-gray-800',
    titleText: 'text-white',
    subText: 'text-gray-300',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-900/30',
    iconBorder: 'border-blue-500/30',
    backBtn: 'text-gray-400 hover:text-white'
  }
};

export function CategoryPage({
  categoryKey, onBackToHome, onAddToCart, onProductClick, wishlistItems, onToggleWishlist
}) {
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTags, setFilterTags] = useState([]);

  // Sidebar Filters State
  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    rating: 0,
    tags: [],
    discount: false,
    inStock: false
  });
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products?category=${categoryKey}`)
        ]);
        
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        const currentCat = catData.find(c => c.value === categoryKey);
        setCategoryInfo(currentCat || {
          label: categoryKey,
          icon: 'ShoppingBag'
        });
        
        setProducts(prodData || []);
        
        // Extract unique tags
        const allTags = new Set();
        (prodData || []).forEach(p => {
          if (p.tags) {
            let tagsArray = [];
            try { tagsArray = JSON.parse(p.tags); } catch(e) { tagsArray = []; }
            tagsArray.forEach(t => allTags.add(t));
          }
        });
        setFilterTags(Array.from(allTags));
      } catch (error) {
        console.error('Error fetching category page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [categoryKey]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      
      const productRating = product.average_rating || 0;
      if (filters.rating > 0 && productRating < filters.rating) return false;
      
      if (filters.inStock && product.stock <= 0) return false;
      
      const productDiscount = Math.round(((product.mrp - product.price) / product.mrp) * 100) || 0;
      if (filters.discount && productDiscount < 10) return false;

      if (filters.tags.length > 0) {
        let pTags = [];
        try { pTags = JSON.parse(product.tags || '[]'); } catch(e) {}
        const hasTag = filters.tags.some(tag => pTags.includes(tag));
        if (!hasTag) return false;
      }
      
      return true;
    });
  }, [products, filters]);

  if (loading) {
    return <div className="py-32 flex justify-center text-gray-500 font-bold">Loading Category...</div>;
  }

  const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES['default'];
  const IconComponent = categoryInfo?.icon ? LucideIcons[categoryInfo.icon] : LucideIcons.ShoppingBag;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Category Hero matched to colour flow */}
      <div className={`relative pt-10 pb-16 overflow-hidden border-b shadow-sm ${theme.bg} ${theme.border}`}>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
        <div className="max-w-[1600px] mx-auto px-4 relative z-10">
          <button 
            onClick={onBackToHome}
            className={`flex items-center gap-2 mb-6 transition-colors text-sm font-bold ${theme.backBtn}`}
          >
            <LucideIcons.ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 mt-4">
            {/* Circle Icon Container matching the design */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm border-2 ${theme.iconBg} ${theme.iconBorder}`}>
              {IconComponent && <IconComponent className={`w-8 h-8 ${theme.iconColor}`} strokeWidth={2.5} />}
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-2 capitalize ${theme.titleText}`}>
                {categoryInfo?.label || categoryKey.replace(/-/g, ' ')}
              </h1>
              <p className={`text-lg font-bold ${theme.subText}`}>All your needs, in one trusted platform.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 mt-8 flex gap-8 relative items-start">
        {/* Sidebar Filter */}
        <aside className="w-72 flex-shrink-0 hidden lg:block sticky top-24">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            availableTags={filterTags}
            accentColor={extractedColor}
            hideTags={filterTags.length === 0}
          />
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span className="text-2xl" style={{ color: extractedColor }}>{filteredProducts.length}</span> Products Found
            </h2>
            <button 
              className="lg:hidden flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-lg"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <LucideIcons.Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onClick={() => onProductClick(product)}
                  isWishlisted={wishlistItems.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <LucideIcons.Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-sm mb-6">Try adjusting your filters or search for something else.</p>
              <button 
                onClick={() => setFilters({ priceRange: [0, 50000000], rating: 0, tags: [], discount: false, inStock: false })}
                className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
