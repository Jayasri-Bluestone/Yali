import { ShoppingCart, Search, User, Menu, Heart, ShieldAlert, Store, LogOut, Package, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { formatINR } from '../utils/currency';

export function Header({
  cartCount,
  onCartClick,
  onAccountClick,
  isLoggedIn,
  userName,
  userRole,
  currentView,
  onViewChange,
  wishlistCount = 0,
  onWishlistClick,
  activeCategory = 'all',
  onCategoryClick,
  onLogoutClick,
  searchQuery = '',
  onSearch,
  products = [],
  categoriesList = []
}) {
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || searchQuery;
  const [localSearch, setLocalSearch] = useState(searchQ);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const predictions = useMemo(() => {
    if (!localSearch.trim()) return { categories: [], products: [] };
    const q = localSearch.toLowerCase().trim();

    const matchedCats = categoriesList.filter(c => 
      c.label.toLowerCase().includes(q) || (c.value && c.value.toLowerCase().includes(q))
    ).slice(0, 2);

    const matchedProds = products.filter(p => {
      const haystack = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
      let singularQ = q;
      if (q.endsWith('s')) singularQ = q.slice(0, -1);
      return haystack.includes(q) || haystack.includes(singularQ);
    }).slice(0, 5);

    return { categories: matchedCats, products: matchedProds };
  }, [localSearch, products, categoriesList]);

  const handleAccountClick = () => {
    if (onAccountClick) {
      onAccountClick();
    }
  };

  const handleKeyDown = (e) => {
    const totalItems = predictions.categories.length + predictions.products.length;

    if (!showPredictions || totalItems === 0) {
      if (e.key === 'Enter' && localSearch.trim()) {
        navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
        setShowPredictions(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === -1) {
        if (localSearch.trim()) {
          navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
          setShowPredictions(false);
        }
      } else {
        const isCat = selectedIndex < predictions.categories.length;
        if (isCat) {
          const cat = predictions.categories[selectedIndex];
          navigate(`/category/${cat.value}`);
        } else {
          const prod = predictions.products[selectedIndex - predictions.categories.length];
          navigate(`/product/${prod.id}`);
        }
        setShowPredictions(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#22d3ee] via-[#0066cc] to-[#10b981] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2 sm:gap-0">
          <div>Free shipping on orders over $50</div>
          <div className="flex gap-4 items-center">
            <span className="text-xs text-cyan-100 hidden md:inline">Role: <span className="font-bold text-white capitalize">{userRole || 'Guest'}</span></span>
            <button className="hover:underline">Customer Service</button>
            <button className="hover:underline hidden sm:block">Track Order</button>
            <button className="hover:underline hidden sm:block">Help</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#22d3ee] via-[#0066cc] to-[#10b981] rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#0066cc] to-[#10b981] bg-clip-text text-transparent">
                YALI
              </span>
            </Link>
          </div>

          {/* Right Actions (Always visible, responsive padding) */}
          <div className="flex items-center gap-1 sm:gap-4 md:order-last">
            {/* Admin Switcher */}
            {isLoggedIn && (userRole === 'admin' || userRole === 'vendor') && (
              <button
                onClick={() => onViewChange(currentView === 'store' ? 'admin' : 'store')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold transition-colors border border-purple-200 text-xs sm:text-sm"
              >
                {currentView === 'store' ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span className="hidden lg:inline">Admin Dashboard</span>
                    <span className="lg:hidden">Admin</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 text-purple-600" />
                    <span className="hidden lg:inline">View Store</span>
                    <span className="lg:hidden">Store</span>
                  </>
                )}
              </button>
            )}

            {/* Account Button */}
            <button
              onClick={handleAccountClick}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              <span className="hidden md:inline font-medium text-gray-700 text-sm">
                {isLoggedIn ? userName || 'Account' : 'Login'}
              </span>
            </button>

            {currentView === 'store' && (
              <>
                {/* Orders Button (Hidden on very small screens) */}
                {isLoggedIn && (
                  <button
                    onClick={() => navigate('/orders')}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block cursor-pointer"
                    title="My Orders"
                  >
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </button>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={onWishlistClick}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block cursor-pointer"
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#10b981] text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart Button */}
                <button
                  onClick={onCartClick}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#0066cc] text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Search Bar (Full width on mobile, flex-1 on desktop) */}
          <div className="w-full md:flex-1 md:max-w-2xl order-last md:order-none relative" ref={searchContainerRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, categories..."
                value={localSearch}
                onFocus={() => setShowPredictions(true)}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSelectedIndex(-1);
                  setShowPredictions(true);
                  onSearch?.(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 sm:py-2.5 pl-10 sm:pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent text-sm sm:text-base"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>

            {/* Prediction Dropdown */}
            {showPredictions && localSearch.trim() && (predictions.categories.length > 0 || predictions.products.length > 0) && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col">
                {predictions.categories.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <div className="text-[10px] font-black uppercase text-gray-400 px-3 mb-1">Categories</div>
                    {predictions.categories.map((c, idx) => (
                      <div
                        key={`cat-${c.value}`}
                        onClick={() => {
                          navigate(`/category/${c.value}`);
                          setShowPredictions(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-800">{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {predictions.products.length > 0 && (
                  <div className="p-2">
                    <div className="text-[10px] font-black uppercase text-gray-400 px-3 mb-1">Products</div>
                    {predictions.products.map((p, idx) => {
                      const absoluteIdx = predictions.categories.length + idx;
                      return (
                        <div
                          key={`prod-${p.id}`}
                          onClick={() => {
                            navigate(`/product/${p.id}`);
                            setShowPredictions(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedIndex === absoluteIdx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&q=80'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h4>
                            <p className="text-xs text-[#0066cc] font-bold">{formatINR(p.price)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation - Only show if in storefront view */}
      {currentView === 'store' && (
        <nav className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide text-sm sm:text-base">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${location.pathname === '/' ? 'bg-gray-100 text-[#0066cc] font-bold' : 'text-gray-700'}`}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="inline">All Categories</span>
              </Link>
              <Link
                to="/category/real-estate"
                className={`px-3 py-1.5 sm:py-2 hover:text-[#0066cc] transition-colors whitespace-nowrap cursor-pointer ${location.pathname.includes('real-estate') ? 'text-[#0066cc] font-bold border-b-2 border-[#0066cc]' : 'text-gray-700'}`}
              >
                Real Estate
              </Link>
              <Link
                to="/category/properties"
                className={`px-3 py-1.5 sm:py-2 hover:text-[#0066cc] transition-colors whitespace-nowrap cursor-pointer ${location.pathname.includes('properties') ? 'text-[#0066cc] font-bold border-b-2 border-[#0066cc]' : 'text-gray-700'}`}
              >
                Properties
              </Link>
              <Link
                to="/category/bike-accessories"
                className={`px-3 py-1.5 sm:py-2 hover:text-[#0066cc] transition-colors whitespace-nowrap cursor-pointer ${location.pathname.includes('bike-accessories') ? 'text-[#0066cc] font-bold border-b-2 border-[#0066cc]' : 'text-gray-700'}`}
              >
                Bike Accessories
              </Link>
              <Link
                to="/category/car-accessories"
                className={`px-3 py-1.5 sm:py-2 hover:text-[#0066cc] transition-colors whitespace-nowrap cursor-pointer ${location.pathname.includes('car-accessories') ? 'text-[#0066cc] font-bold border-b-2 border-[#0066cc]' : 'text-gray-700'}`}
              >
                Car Accessories
              </Link>
              <Link
                to="/category/organic-groceries"
                className={`px-3 py-1.5 sm:py-2 hover:text-[#0066cc] transition-colors whitespace-nowrap cursor-pointer ${location.pathname.includes('organic-groceries') ? 'text-[#0066cc] font-bold border-b-2 border-[#0066cc]' : 'text-gray-700'}`}
              >
                Organic Groceries
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
