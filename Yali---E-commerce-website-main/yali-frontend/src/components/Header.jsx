import { ShoppingCart, Search, User, Menu, Heart, ShieldAlert, Store, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';

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
  onSearch
}) {
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || searchQuery;
  const [localSearch, setLocalSearch] = useState(searchQ);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAccountClick = () => {
    if (onAccountClick) {
      onAccountClick();
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && localSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
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
          <div className="w-full md:flex-1 md:max-w-2xl order-last md:order-none">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onSearch?.(e.target.value);
                }}
                onKeyDown={handleSearchSubmit}
                className="w-full px-4 py-2 sm:py-2.5 pl-10 sm:pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent text-sm sm:text-base"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
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
