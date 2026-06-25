import { ShoppingCart, Search, User, Menu, Heart, ShieldAlert, Store, LogOut, Package, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import { API_URL } from '../config';

export function Header({
  cartCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  onMobileMenuClick,
  onSearch,
  currentView = 'store',
  onViewChange,
  onAccountClick,
  isLoggedIn,
  userName,
  userRole
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
  const [predictions, setPredictions] = useState({ products: [], categories: [] });
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLocalSearch(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (localSearch.length >= 2) {
      fetch(`${API_URL}/search/predict?q=${encodeURIComponent(localSearch)}`)
        .then(res => res.json())
        .then(data => {
          setPredictions(data);
          setShowPredictions(true);
        })
        .catch(err => console.error('Prediction fetch error:', err));
    } else {
      setPredictions({ products: [], categories: [] });
    }
  }, [localSearch]);

  const totalItems = predictions.categories.length + predictions.products.length;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (selectedIndex < predictions.categories.length) {
          const cat = predictions.categories[selectedIndex];
          navigate(`/category/${cat.value}`);
        } else {
          const prod = predictions.products[selectedIndex - predictions.categories.length];
          navigate(`/product/${prod.id}`);
        }
        setShowPredictions(false);
      } else {
        if (localSearch.trim()) {
          navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
          setShowPredictions(false);
        }
      }
    } else if (e.key === 'Escape') {
      setShowPredictions(false);
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#031d59] to-[#004dc9] border-b-0 shadow-md">
      {/* Main Header */}
      <div className="max-w-[1400px] mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 md:gap-8">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-[#34982a] font-black text-xl italic tracking-tighter">Y</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-wide">
                YALI
              </span>
            </Link>
          </div>

          {/* Search Bar (Full width on top bar) */}
          <div className="w-full md:flex-1 order-last md:order-none relative max-w-2xl mx-0 md:mx-4" ref={searchContainerRef}>
            <div className="relative flex items-center w-full border border-white/20 rounded-md overflow-hidden bg-white/10 shadow-sm hover:border-white/40 focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white transition-all">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={localSearch}
                onFocus={() => setShowPredictions(true)}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSelectedIndex(-1);
                  setShowPredictions(true);
                  onSearch?.(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 sm:py-2.5 text-white placeholder-white/50 bg-transparent focus:outline-none text-sm"
              />
              <div className="hidden sm:flex items-center px-3 border-l border-white/20 h-full cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-white/80 text-xs font-medium mr-1">All Categories</span>
                <ChevronDown className="w-3 h-3 text-white/80" />
              </div>
              <button
                onClick={() => localSearch.trim() && navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`)}
                className="bg-[#34982a] hover:bg-[#2c8123] text-white px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-center transition-colors h-full"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Prediction Dropdown */}
            {showPredictions && localSearch.trim() && (predictions.categories.length > 0 || predictions.products.length > 0) && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col">
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
                            <p className="text-xs text-[#083366] font-bold">{formatINR(p.price)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">

            {/* Wishlist Button */}
            <button onClick={onWishlistClick} className="relative flex flex-col items-center justify-center group cursor-pointer">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white transition-colors" />
              <span className="hidden lg:block text-[10px] font-medium text-white/60 mt-0.5 group-hover:text-white">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#34982a] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button onClick={onCartClick} className="relative flex flex-col items-center justify-center group cursor-pointer">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white transition-colors" />
              <span className="hidden lg:block text-[10px] font-medium text-white/60 mt-0.5 group-hover:text-white">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#34982a] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Button */}
            <button onClick={onAccountClick} className="flex flex-col items-center justify-center group cursor-pointer ml-1 md:ml-2 md:border-l border-white/20 md:pl-6">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white transition-colors" />
              <span className="hidden lg:block text-[10px] font-medium text-white/60 mt-0.5 group-hover:text-white">
                {isLoggedIn ? userName || 'My Account' : 'Sign In'}
              </span>
            </button>

            {/* Admin Switcher */}
            {isLoggedIn && (userRole === 'admin' || userRole === 'vendor') && (
              <button
                onClick={() => onViewChange(currentView === 'store' ? 'admin' : 'store')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg font-semibold transition-colors border border-white/20 text-xs sm:text-sm ml-2"
              >
                {currentView === 'store' ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden xl:inline">Admin Dashboard</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span className="hidden xl:inline">View Store</span>
                  </>
                )}
              </button>
            )}

          </div>

        </div>
      </div>


    </header>
  );
}
