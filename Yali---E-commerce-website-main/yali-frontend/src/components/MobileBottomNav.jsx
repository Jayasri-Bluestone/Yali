import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function MobileBottomNav({ cartCount, onCartClick, onAccountClick }) {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb">
      <div className="flex items-center justify-around">
        <Link 
          to="/" 
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${location.pathname === '/' ? 'text-[#10b981]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Home className={`w-6 h-6 mb-1 ${location.pathname === '/' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        <Link 
          to="/search" 
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${location.pathname.includes('/search') || location.pathname.includes('/category') ? 'text-[#10b981]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Search className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Categories</span>
        </Link>

        <button 
          onClick={onCartClick}
          className="flex flex-col items-center p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-900 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 mb-1" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Cart</span>
        </button>

        <button 
          onClick={onAccountClick}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${location.pathname.includes('/profile') || location.pathname.includes('/orders') ? 'text-[#10b981]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <User className={`w-6 h-6 mb-1 ${location.pathname.includes('/profile') ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-semibold">Account</span>
        </button>
      </div>
    </div>
  );
}
