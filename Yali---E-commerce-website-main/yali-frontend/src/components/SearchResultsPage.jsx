import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Package, ArrowLeft, Filter, ChevronDown, Check, Star, ShieldCheck, X, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-3 border border-gray-100 flex flex-col h-full animate-pulse shadow-sm">
    <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl mb-3"></div>
    <div className="flex-1 px-1">
      <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-4"></div>
      <div className="h-5 bg-gray-200 rounded-md w-1/3 mb-3"></div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="h-8 bg-gray-100 rounded-xl w-1/2"></div>
        <div className="h-8 bg-gray-100 rounded-xl w-10"></div>
      </div>
    </div>
  </div>
);

const SkeletonListCard = () => (
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm animate-pulse w-full">
    <div className="w-28 h-28 sm:w-40 sm:h-40 bg-gray-100 rounded-2xl flex-shrink-0"></div>
    <div className="flex-1 py-2">
      <div className="flex gap-2 mb-2"><div className="h-4 bg-gray-200 rounded w-16"></div><div className="h-4 bg-gray-200 rounded w-12"></div></div>
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
    </div>
  </div>
);
import { formatINR } from '../utils/currency';

// Themed Color Flow Logic for Banners
function getThemeForCategory(query) {
  if (!query) return 'default';
  const q = query.toLowerCase();
  
  if (q.includes('propert') || q.includes('land') || q.includes('real') || q.includes('estate') || q.includes('plot')) return 'red';
  if (q.includes('vehic') || q.includes('wheel') || q.includes('auto') || q.includes('car') || q.includes('bike')) return 'blue';
  if (q.includes('organic') || q.includes('veg') || q.includes('fruit') || q.includes('grocer') || q.includes('plant')) return 'emerald';
  if (q.includes('dry') || q.includes('nut') || q.includes('spice') || q.includes('masala')) return 'orange';
  if (q.includes('dress') || q.includes('fashion') || q.includes('cloth') || q.includes('apparel') || q.includes('wear')) return 'purple';
  
  return 'default';
}

const THEMES = {
  'red': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-red-950', 
    border: 'border-red-900/50',
    titleText: 'text-white',
    subText: 'text-red-200/80',
    backBtn: 'text-red-400 hover:text-red-300',
    badge: 'bg-red-900/50 text-red-300 border-red-800'
  },
  'green': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-green-950', 
    border: 'border-green-900/50',
    titleText: 'text-white',
    subText: 'text-green-200/80',
    backBtn: 'text-green-400 hover:text-green-300',
    badge: 'bg-green-900/50 text-green-300 border-green-800'
  },
  'emerald': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-emerald-950', 
    border: 'border-emerald-900/50',
    titleText: 'text-white',
    subText: 'text-emerald-200/80',
    backBtn: 'text-emerald-400 hover:text-emerald-300',
    badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-800'
  },
  'blue': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-blue-950', 
    border: 'border-blue-900/50',
    titleText: 'text-white',
    subText: 'text-blue-200/80',
    backBtn: 'text-blue-400 hover:text-blue-300',
    badge: 'bg-blue-900/50 text-blue-300 border-blue-800'
  },
  'orange': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-orange-950', 
    border: 'border-orange-900/50',
    titleText: 'text-white',
    subText: 'text-orange-200/80',
    backBtn: 'text-orange-400 hover:text-orange-300',
    badge: 'bg-orange-900/50 text-orange-300 border-orange-800'
  },
  'purple': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-purple-950', 
    border: 'border-purple-900/50',
    titleText: 'text-white',
    subText: 'text-purple-200/80',
    backBtn: 'text-purple-400 hover:text-purple-300',
    badge: 'bg-purple-900/50 text-purple-300 border-purple-800'
  },
  'default': { 
    bg: 'bg-gray-900 bg-gradient-to-br from-gray-900 to-[#083366]/40', 
    border: 'border-gray-800',
    titleText: 'text-white',
    subText: 'text-gray-300',
    backBtn: 'text-gray-400 hover:text-white',
    badge: 'bg-gray-800 text-gray-300 border-gray-700'
  }
};

export function SearchResultsPage({
  products,
  onAddToCart,
  wishlistItems,
  onToggleWishlist
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const stateColor = location.state?.bannerColor;
  const stateTitle = location.state?.title;
  const stateSubTags = location.state?.subTags || [];

  const searchQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category');
  
  const [filters, setFilters] = useState({
    categories: categoryQuery ? [categoryQuery] : [],
    brands: [],
    priceMin: '',
    priceMax: '',
    ratings: [],
    discounts: [],
    assured: false
  });
  
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync/Reset filters when URL parameters change (e.g. clicking categories from MegaCategories / mock section)
  useEffect(() => {
    setFilters({
      categories: categoryQuery ? [categoryQuery] : [],
      brands: [],
      priceMin: '',
      priceMax: '',
      ratings: [],
      discounts: [],
      assured: false
    });
  }, [categoryQuery, searchQuery]);

  useEffect(() => {
    // Simulate network latency for skeleton loader only on main query/category changes
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryQuery]);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Initial text search filter
  const textFiltered = useMemo(() => {
    let base = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = products.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) || 
        p.category?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q)
      );
    }
    // If we have a categoryQuery from URL and NO search query, pre-filter by category
    if (!searchQuery.trim() && categoryQuery) {
      const normalize = (str) => (str || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      const qCat = normalize(categoryQuery);
      const sTags = stateSubTags.map(normalize);
      
      base = base.filter(p => {
        const pCat = normalize(p.category);
        const pSub = normalize(p.sub_category);
        const pSub2 = normalize(p.subcategory);
        
        const checkMatch = (target) => {
          if (!target) return false;
          if (pCat === target || pSub === target || pSub2 === target) return true;
          if (pCat && (pCat.includes(target) || target.includes(pCat))) return true;
          if (pSub && (pSub.includes(target) || target.includes(pSub))) return true;
          if (pSub2 && (pSub2.includes(target) || target.includes(pSub2))) return true;
          
          // Cross-aliases for mismatched mock data
          if (target === 'realestate' && (pCat === 'properties' || pCat === 'land' || pCat === 'realestate')) return true;
          if (target === 'automobiles' && (pCat.includes('bike') || pCat.includes('car') || pCat.includes('vehicle') || pCat.includes('auto'))) return true;
          if (target === 'organicproducts' && pCat.includes('organic')) return true;
          
          return false;
        };

        const matchesMain = checkMatch(qCat);
        const matchesSub = sTags.some(tag => checkMatch(tag));
        
        return matchesMain || matchesSub;
      });
    }
    return base;
  }, [products, searchQuery, categoryQuery, stateSubTags]);

  // Extract available categories and brands
  const availableCategories = useMemo(() => {
    const cats = new Set();
    textFiltered.forEach(p => {
      if (p.category) cats.add(p.category);
      if (p.sub_category) cats.add(p.sub_category);
      if (p.subcategory) cats.add(p.subcategory);
    });
    return Array.from(cats);
  }, [textFiltered]);

  const availableBrands = useMemo(() => {
    const brands = new Set();
    textFiltered.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).filter(Boolean);
  }, [textFiltered]);

  // 2. Apply Filters
  const fullyFiltered = useMemo(() => {
    return textFiltered.filter(p => {
      if (filters.categories?.length > 0 && !searchQuery.trim() && !categoryQuery) {
        // If we only selected via filters, check it
        const matchesCategory = filters.categories.includes(p.category);
        const matchesSubcategory = filters.categories.includes(p.sub_category) || filters.categories.includes(p.subcategory);
        if (!matchesCategory && !matchesSubcategory) return false;
      }
      
      if (filters.brands?.length > 0 && !filters.brands.includes(p.brand)) return false;
      
      const price = parseFloat(p.price);
      if (filters.priceMin && price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && price > parseFloat(filters.priceMax)) return false;

      if (filters.ratings?.length > 0) {
        const minRatingSelected = Math.min(...filters.ratings);
        if ((p.rating || 0) < minRatingSelected) return false;
      }

      if (filters.discounts?.length > 0) {
        const minDiscountSelected = Math.min(...filters.discounts);
        if ((p.discount || 0) < minDiscountSelected) return false;
      }

      if (filters.assured) {
        const isAssured = p.isAssured || (p.rating >= 4);
        if (!isAssured) return false;
      }

      return true;
    });
  }, [textFiltered, filters, searchQuery, categoryQuery]);

  // 3. Sort
  const displayProducts = useMemo(() => {
    const sorted = [...fullyFiltered];
    if (sortBy === 'price-asc') sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    else if (sortBy === 'price-desc') sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    else if (sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);
    return sorted;
  }, [fullyFiltered, sortBy]);

  const handleCheckboxChange = (group, value) => {
    const current = filters[group] || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setFilters({ ...filters, [group]: updated });
  };

  const clearFilters = () => {
    setFilters({ categories: [], brands: [], priceMin: '', priceMax: '', ratings: [], discounts: [], assured: false });
    setActiveDropdown(null);
  };

  const getActiveFilterCount = () => {
    let count = filters.categories.length + filters.brands.length + filters.ratings.length + filters.discounts.length;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.assured) count++;
    return count;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, searchQuery, categoryQuery]);

  const activeFiltersList = useMemo(() => {
    const list = [
      ...filters.categories.map(c => ({ type: 'categories', label: c, value: c })),
      ...filters.brands.map(b => ({ type: 'brands', label: b, value: b })),
      ...filters.ratings.map(r => ({ type: 'ratings', label: `${r}+ Stars`, value: r })),
      ...filters.discounts.map(d => ({ type: 'discounts', label: `${d}%+ Off`, value: d })),
    ];
    if (filters.priceMin || filters.priceMax) {
      list.push({ 
        type: 'price', 
        label: `₹${filters.priceMin || '0'} - ₹${filters.priceMax || 'Max'}`,
        value: 'price'
      });
    }
    if (filters.assured) {
      list.push({ type: 'assured', label: 'YALI Assured', value: true });
    }
    return list;
  }, [filters]);

  const removeFilter = (filter) => {
    if (filter.type === 'price') {
      setFilters({ ...filters, priceMin: '', priceMax: '' });
    } else if (filter.type === 'assured') {
      setFilters({ ...filters, assured: false });
    } else {
      handleCheckboxChange(filter.type, filter.value);
    }
  };

  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const paginatedProducts = displayProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pageTitle = stateTitle 
    ? stateTitle 
    : (searchQuery 
      ? `Results for "${searchQuery}"` 
      : (categoryQuery ? `${categoryQuery.replace(/-/g, ' ')}` : 'All Collection'));

  const activeThemeKey = getThemeForCategory(searchQuery || categoryQuery);
  const theme = THEMES[activeThemeKey];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 font-sans animate-fade-in">
      
      {/* Premium Hero Header (Themed) */}
      <div 
        className={`pt-10 pb-16 px-6 md:px-12 relative overflow-hidden border-b ${!stateColor ? theme.bg : ''} ${!stateColor ? theme.border : ''}`}
        style={stateColor ? { 
          backgroundColor: '#111827', 
          backgroundImage: `linear-gradient(to bottom right, #111827, ${stateColor}40)`,
          borderColor: `${stateColor}40`
        } : {}}
      >
        {/* Subtle background effects */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col mb-6">
            {/* Breadcrumbs */}
            <div className={`flex items-center gap-2 text-xs md:text-sm font-semibold mb-4 ${stateColor ? 'text-gray-400' : theme.subText}`}>
              <button onClick={() => navigate('/')} className={`hover:text-white transition-colors cursor-pointer`}>Home</button>
              <ChevronRight className="w-3 h-3 opacity-50" />
              {categoryQuery ? (
                <>
                  <button onClick={() => navigate(`/search?category=${categoryQuery}`)} className="hover:text-white transition-colors cursor-pointer capitalize">
                    {categoryQuery.replace(/-/g, ' ')}
                  </button>
                  {(searchQuery || stateTitle) && (
                    <>
                      <ChevronRight className="w-3 h-3 opacity-50" />
                      <span className="text-white capitalize truncate max-w-[200px]">{searchQuery ? `"${searchQuery}"` : stateTitle}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-white capitalize truncate max-w-[200px]">{searchQuery ? `"${searchQuery}"` : 'All Products'}</span>
              )}
            </div>

            <button 
              onClick={() => navigate(-1)}
              className={`group flex items-center gap-2 text-sm font-bold transition-colors cursor-pointer w-max ${stateColor ? 'text-gray-400 hover:text-white' : theme.backBtn}`}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Back
            </button>
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-black tracking-tight mb-4 capitalize leading-tight ${stateColor ? 'text-white' : theme.titleText}`}>
            {pageTitle}
          </h1>
          
        
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        
        {/* Unified Control Bar (Glassmorphism) */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 mb-4 flex flex-col xl:flex-row gap-4 items-center justify-between" ref={dropdownRef}>
          
          {/* Mobile Filter Button */}
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="xl:hidden w-full mb-4 px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm font-bold text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-[#0066cc]" />
            Advanced Filters 
            {getActiveFilterCount() > 0 && (
              <span className="bg-[#0066cc] text-white rounded-full px-2 py-0.5 text-[10px] ml-1">{getActiveFilterCount()}</span>
            )}
          </button>

          {/* Desktop Filters */}
          <div className="hidden xl:flex items-center gap-2 w-auto overflow-visible pb-0">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 mr-2 shrink-0">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-700">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0066cc] text-white text-[10px] font-bold flex items-center justify-center ml-1">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>

            {/* Price Dropdown */}
            <div className="relative shrink-0">
              <button onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${activeDropdown === 'price' || filters.priceMin || filters.priceMax ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
                Price <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Min ₹" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]" 
                      value={filters.priceMin} onChange={e => setFilters({...filters, priceMin: e.target.value})} />
                    <span className="text-gray-400 font-medium">to</span>
                    <input type="number" placeholder="Max ₹" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                      value={filters.priceMax} onChange={e => setFilters({...filters, priceMax: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            {/* Brand Dropdown */}
            {availableBrands.length > 0 && (
              <div className="relative shrink-0">
                <button onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${activeDropdown === 'brand' || filters.brands.length > 0 ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
                  Brand {filters.brands.length > 0 && `(${filters.brands.length})`} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'brand' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {availableBrands.map(b => (
                      <label key={b} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${filters.brands.includes(b) ? 'bg-[#0066cc] border-[#0066cc]' : 'border-gray-300 bg-white'}`}>
                          {filters.brands.includes(b) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{b}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rating Dropdown */}
            <div className="relative shrink-0">
              <button onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${activeDropdown === 'rating' || filters.ratings.length > 0 ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
                Rating <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'rating' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'rating' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {[4, 3, 2, 1].map(star => (
                    <label key={star} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${filters.ratings.includes(star) ? 'bg-[#0066cc] border-[#0066cc]' : 'border-gray-300 bg-white'}`}>
                        {filters.ratings.includes(star) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-700">{star}</span>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500 font-medium">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Assured Toggle */}
            <button 
              onClick={() => setFilters({...filters, assured: !filters.assured})}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${filters.assured ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <ShieldCheck className={`w-4 h-4 ${filters.assured ? 'text-blue-600' : 'text-gray-400'}`} />
              YALI Assured
            </button>

            {getActiveFilterCount() > 0 && (
              <button onClick={clearFilters} className="shrink-0 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Sort & View Controls */}
          <div className="flex items-center gap-3 w-full xl:w-auto xl:border-l xl:pl-4 border-gray-200 shrink-0">
            <div className="relative w-full xl:w-auto">
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none w-full xl:w-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066cc] cursor-pointer"
              >
                <option value="default">Sort by Relevance</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="hidden sm:flex bg-gray-100 rounded-xl p-1 border border-gray-200 shrink-0">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <Package className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFiltersList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-sm font-semibold text-gray-500 mr-1">Active Filters:</span>
            {activeFiltersList.map((filter, idx) => (
              <span key={`${filter.type}-${idx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-700">
                {filter.label}
                <button 
                  onClick={() => removeFilter(filter)} 
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <X className="w-3 h-3 text-blue-700" />
                </button>
              </span>
            ))}
            <button 
              onClick={clearFilters}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline ml-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Products Grid/List */}
        <div className="min-w-0">
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 mb-10">
                {Array.from({length: 10}).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="space-y-4 max-w-5xl mx-auto mb-10">
                {Array.from({length: 5}).map((_, i) => <SkeletonListCard key={i} />)}
              </div>
            )
          ) : displayProducts.length === 0 ? (
            <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-16 text-center max-w-2xl mx-auto mt-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">No matching items found</h3>
              <p className="text-gray-500 text-base font-medium mb-8">
                We couldn't find any products matching your exact filters. Try tweaking your criteria or clear filters to see more results.
              </p>
              <button 
                onClick={clearFilters}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 mb-10">
                {paginatedProducts.map(product => (
                  <div key={product.id} className="relative group">
                  {/* Floating Discount Tag */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 z-10 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg bg-red-500/90 backdrop-blur-sm">
                      {product.discount}% OFF
                    </div>
                  )}
                  {/* Premium Product Card Container */}
                  <div className="h-full transform transition-all duration-300 group-hover:-translate-y-1">
                    <ProductCard 
                      product={product} 
                      onAddToCart={onAddToCart} 
                      onProductClick={(p) => navigate(`/product/${p.id}`)}
                      isWishlisted={wishlistItems.some(i => i.id === product.id)} 
                      onToggleWishlist={onToggleWishlist} 
                    />
                  </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 mb-12">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <div className="flex items-center justify-center min-w-[120px]">
                    <span className="text-sm font-bold text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-4 max-w-5xl mx-auto mb-10">
                {paginatedProducts.map(product => (
                  <div key={product.id} onClick={() => navigate(`/product/${product.id}`)}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all cursor-pointer group sm:items-center">
                  
                  <div className="flex gap-4 sm:gap-6 flex-1 w-full">
                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80'; }} />
                    </div>
                    <div className="flex-1 min-w-0 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        {product.brand && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-md">
                            {product.brand}
                          </span>
                        )}
                        {product.rating >= 4 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#008c00] px-1.5 py-0.5 rounded-md">
                            {product.rating} <Star className="w-2.5 h-2.5 fill-white" />
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-gray-900 line-clamp-2 mb-1 group-hover:text-[#0066cc] transition-colors">{product.name}</h3>
                      {product.category && (
                        <span className="text-sm font-semibold text-gray-500 mb-3 block capitalize">{product.category.replace(/-/g, ' ')}</span>
                      )}
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{formatINR(product.price)}</span>
                        {product.originalPrice && <span className="text-sm text-gray-400 font-medium line-through decoration-gray-300">{formatINR(product.originalPrice)}</span>}
                        {product.discount > 0 && <span className="text-xs text-red-500 font-black px-2 py-1 bg-red-50 rounded-md">{product.discount}% off</span>}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0 px-2 sm:px-0">
                    <button onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                      className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-gray-900/20 active:scale-95">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 mb-12">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <div className="flex items-center justify-center min-w-[120px]">
                  <span className="text-sm font-bold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
          )}
        </div>
      </div>
      
      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden flex flex-col justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative bg-white w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-900" />
                <h2 className="text-xl font-black text-gray-900">Filters</h2>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-[#0066cc] text-white rounded-full px-2 py-0.5 text-[10px] font-bold ml-1">{getActiveFilterCount()}</span>
                )}
              </div>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              {/* Price Filter */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">Price Range</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Min Price (₹)</label>
                    <input type="number" placeholder="Min" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066cc]" 
                      value={filters.priceMin} onChange={e => setFilters({...filters, priceMin: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Max Price (₹)</label>
                    <input type="number" placeholder="Max" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                      value={filters.priceMax} onChange={e => setFilters({...filters, priceMax: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Brands Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Brands</h3>
                  <div className="space-y-3">
                    {availableBrands.map(b => (
                      <label key={b} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent has-[:checked]:border-[#0066cc] has-[:checked]:bg-blue-50/50 cursor-pointer transition-colors">
                        <span className="text-sm font-semibold text-gray-800">{b}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${filters.brands.includes(b) ? 'bg-[#0066cc] border-[#0066cc]' : 'border-gray-300 bg-white'}`}>
                          {filters.brands.includes(b) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={filters.brands.includes(b)} onChange={() => {
                          const newBrands = filters.brands.includes(b) ? filters.brands.filter(x => x !== b) : [...filters.brands, b];
                          setFilters({...filters, brands: newBrands});
                        }} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">Minimum Rating</h3>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map(star => (
                    <label key={star} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent has-[:checked]:border-[#0066cc] has-[:checked]:bg-blue-50/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-800">{star}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-gray-500">& Up</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${filters.ratings.includes(star) ? 'bg-[#0066cc] border-[#0066cc]' : 'border-gray-300 bg-white'}`}>
                        {filters.ratings.includes(star) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={filters.ratings.includes(star)} onChange={() => {
                        const newRatings = filters.ratings.includes(star) ? filters.ratings.filter(x => x !== star) : [...filters.ratings, star];
                        setFilters({...filters, ratings: newRatings});
                      }} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Assured */}
              <div>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent has-[:checked]:border-[#0066cc] has-[:checked]:bg-blue-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${filters.assured ? 'text-[#0066cc]' : 'text-gray-400'}`} />
                    <span className="text-sm font-bold text-gray-900">YALI Assured Only</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${filters.assured ? 'bg-[#0066cc]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.assured ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <input type="checkbox" className="hidden" checked={filters.assured} onChange={() => setFilters({...filters, assured: !filters.assured})} />
                </label>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3 bg-white">
              <button 
                onClick={clearFilters}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-[2] py-3.5 bg-[#0066cc] text-white font-bold text-sm rounded-xl hover:bg-[#0052a3] transition-colors shadow-lg shadow-blue-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
