import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Link, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryCard } from './components/CategoryCard';
import { ProductCard } from './components/ProductCard';
import { HomeVideoSection } from './components/HomeVideoSection';
import { CartPage } from './components/CartPage';
import { WishlistPage } from './components/WishlistPage';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CategoryPage } from './components/CategoryPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { resolveCategoryPage } from './components/categories/CategoryRouter';
import { formatINR } from './utils/currency';
import { CheckoutPage } from './components/CheckoutPage';
import { AuthModal } from './components/AuthModal';
import { WalletDisplay } from './components/WalletDisplay';
import { ProfilePage } from './components/ProfilePage';
import { InvoiceModal } from './components/InvoiceModal';
import { Footer } from './components/Footer';
import { MyOrdersPage } from './components/MyOrdersPage';
import { ScrollToTop } from './components/ScrollToTop';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PullToRefresh } from './components/PullToRefresh';
import { API_URL } from './config';
import { AdminLogin } from './components/admin/AdminLogin';
import { StaticPage } from './components/StaticPage';
import MegaCategories from './components/MegaCategories';
import {
  Home,
  Building2,
  Car,
  Bike,
  Leaf,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Tag,
  Zap,
  Star,
  Award,
  Gift,
  Shield,
  RotateCcw,
  Truck,
  CreditCard,
  ChevronRight,
  Clock,
  Flame,
  BadgePercent,
  Package,
  Heart,
  ShieldAlert,
  Headset
} from 'lucide-react';
import './styles/custom.css';
import { useToast } from './context/ToastContext';
import { DynamicSectionRenderer } from './components/sections/DynamicSectionRenderer';
import { CustomPage } from './components/CustomPage';



// ─────────────────────────────────────────────
// Live Countdown hook
// ─────────────────────────────────────────────
function useCountdown(targetHours = 11) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const end = new Date();
    end.setHours(end.getHours() + targetHours, 0, 0, 0);
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHours]);
  return time;
}

// ─────────────────────────────────────────────
// Section Header helper
// ─────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconColor, title, subtitle, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${iconColor || 'bg-[#1873e8]'}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-sm font-semibold text-[#0066cc] hover:text-[#0052a3] transition-colors group"
        >
          {action}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Horizontal scroll product row
// ─────────────────────────────────────────────
export function ProductScrollRow({ products, wishlistItems, onAddToCart, onProductClick, onToggleWishlist, cardWidth = 'w-48 sm:w-56', autoScroll = false }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;

    const el = scrollRef.current;
    let timer;
    let isPaused = false;

    const startScroll = () => {
      timer = setInterval(() => {
        if (isPaused) return;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const child = el.firstElementChild;
          const scrollAmount = child ? child.clientWidth + 16 : 300; // 16px matches gap-4 (1rem)
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }, 3000);
    };

    startScroll();

    const pause = () => isPaused = true;
    const play = () => isPaused = false;

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', play);
    el.addEventListener('touchstart', pause);
    el.addEventListener('touchend', play);

    return () => {
      clearInterval(timer);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', play);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', play);
    };
  }, [autoScroll]);

  if (!products || products.length === 0) return (
    <p className="text-gray-400 text-sm py-6 text-center">No products available right now.</p>
  );
  return (
    <div className="product-scroll-row" ref={scrollRef}>
      {products.map((product) => (
        <div key={product.id} className={`${cardWidth} flex-shrink-0`}>
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
            isWishlisted={wishlistItems.some(item => item.id === product.id)}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Category Page Wrapper
// ─────────────────────────────────────────────
function CategoryPageWrapper({ products, videos, subCategories, onAddToCart, wishlistItems, onToggleWishlist }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const ResolvedPage = resolveCategoryPage(categoryId);

  return (
    <ResolvedPage
      categoryKey={categoryId}
      onBackToHome={() => navigate('/')}
      products={products}
      onAddToCart={onAddToCart}
      onProductClick={(product) => navigate(`/product/${product.id}`)}
      wishlistItems={wishlistItems}
      onToggleWishlist={onToggleWishlist}
      videos={videos}
    />
  );
}

// ─────────────────────────────────────────────
// HOME PAGE SECTIONS — mega component
// ─────────────────────────────────────────────
function HomePageSections({
  banners, products, videos, categories, uiCards,
  wishlistItems, onCategoryClick, onAddToCart, onProductClick, onToggleWishlist
}) {
  const navigate = useNavigate();
  const countdown = useCountdown(11);
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [dynamicSections, setDynamicSections] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/page-sections/home`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicSections(data);
        setIsLoadingSections(false);
      })
      .catch(err => {
        console.error('Failed to fetch home layout', err);
        setIsLoadingSections(false);
      });
  }, []);

  const budgetRanges = [
    { label: 'All', value: 'all' },
    { label: 'Under ₹500', value: 'under20' },
    { label: '₹500 – ₹1,500', value: '20-50' },
    { label: '₹1,500 – ₹3,000', value: '50-100' },
    { label: '₹3,000 – ₹6,000', value: '100-200' },
    { label: '₹6,000+', value: 'above200' },
  ];

  const budgetProducts = products.filter(p => {
    const pr = parseFloat(p.price);
    if (budgetFilter === 'all') return true;
    if (budgetFilter === 'under20') return pr < 20;
    if (budgetFilter === '20-50') return pr >= 20 && pr < 50;
    if (budgetFilter === '50-100') return pr >= 50 && pr < 100;
    if (budgetFilter === '100-200') return pr >= 100 && pr < 200;
    if (budgetFilter === 'above200') return pr >= 200;
    return true;
  });

  const flashDeals = products.filter(p => p.stock > 0 && p.discount > 0).slice(0, 8);
  const trendingProducts = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const bestSellers = products.filter(p => (p.reviews_count || (Array.isArray(p.reviews) ? p.reviews.length : 0)) > 5 || p.rating >= 4).slice(0, 8);
  const newArrivals = [...products].reverse().slice(0, 8);
  const topPicksMain = products.slice(0, 1)[0];
  const topPicksSide = products.slice(1, 5);

  const IconMap = {
    Building2, Home, Car, Bike, Leaf, ShoppingBag, Sparkles, TrendingUp, Tag, Zap, Star, Award, Gift, Shield, RotateCcw, Truck, CreditCard, Clock, Flame, BadgePercent, Package, Heart
  };

  const brandCards = uiCards.filter(c => c.section === 'category_card').map(c => ({
    label: c.title,
    gradient: c.color_gradient || 'from-blue-600 to-blue-400',
    icon: IconMap[c.icon] || Tag,
    cat: c.link_url,
    emoji: c.icon && [...c.icon].length <= 2 ? c.icon : '✨' // Use icon string if it is an emoji, otherwise generic sparkle
  }));

  const trustItems = uiCards.filter(c => c.section === 'trust_card').map(c => ({
    icon: IconMap[c.icon] || Tag,
    label: c.title,
    sub: c.subtitle,
    color: c.color_gradient || 'from-blue-500 to-cyan-400'
  }));

  const promoCards = uiCards.filter(c => c.section === 'promo_card');

  const pad = (n) => String(n).padStart(2, '0');

  if (!isLoadingSections && dynamicSections.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        {dynamicSections.map(sec => (
          <DynamicSectionRenderer
            key={sec.id}
            section={sec}
            products={products}
            videos={videos}
            banners={banners}
            uiCards={uiCards}
            wishlistItems={wishlistItems}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onCategoryClick={onCategoryClick}
            ProductScrollRowComponent={ProductScrollRow}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── 1. HERO BANNER ── */}
      <HeroBanner banners={banners} onCategoryClick={onCategoryClick} />

      {/* ── 2. MEGA CATEGORIES ── */}
      <MegaCategories />

      {/* ── 4. FLASH DEALS (Big Sale Is Live!) ── */}
      <section className="mt-12 max-w-[1400px] mx-auto px-4">
        <div className="rounded-[2rem] overflow-hidden bg-[#083366] p-6 md:p-10 mb-6 shadow-xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 z-10 relative">
            
            {/* Left Content */}
            <div className="flex-1 text-white">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#70A83B] text-white font-bold text-[10px] md:text-xs mb-4 shadow-sm tracking-wider uppercase">
                Limited Time Offer
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">Big Sale Is Live!</h2>
              <p className="text-white/90 text-sm md:text-base font-medium mb-6 max-w-sm">
                Don't miss out on exclusive deals & huge discounts.
              </p>
              <button className="bg-white text-[#083366] hover:bg-gray-100 font-bold py-2.5 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                Shop Now
              </button>
            </div>

            {/* Middle: Countdown Timer */}
            <div className="flex items-center gap-3">
              {[{ v: countdown.d || 2, l: 'Days' }, { v: countdown.h, l: 'Hours' }, { v: countdown.m, l: 'Mins' }, { v: countdown.s, l: 'Secs' }].map(({ v, l }) => (
                <div key={l} className="bg-white rounded-xl w-16 h-16 md:w-20 md:h-24 flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                  <span className="text-xl md:text-4xl font-black text-[#083366] tabular-nums leading-none mb-1">{pad(v)}</span>
                  <span className="text-[10px] md:text-xs text-gray-500 font-bold">{l}</span>
                </div>
              ))}
            </div>

            {/* Right: Circular Badge */}
            <div className="hidden lg:flex items-center justify-center ml-8 pr-8">
              <div className="w-40 h-40 rounded-full border-4 border-[#70A83B] flex flex-col items-center justify-center bg-[#70A83B] shadow-2xl">
                <span className="text-white font-bold text-sm tracking-widest mb-[-5px]">UP TO</span>
                <span className="text-white font-black text-6xl leading-none drop-shadow-sm">50%</span>
                <span className="text-white font-bold text-xl tracking-widest mt-[-2px]">OFF</span>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-b border-gray-100 mb-8">
          <div className="flex items-center gap-3 justify-center md:justify-start group cursor-pointer">
            <div className="p-2 rounded-lg transition-colors">
              <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-[#70A83B]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm md:text-base font-black text-[#0B2347]">Trusted & Secure</p>
              <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">100% safe and secure platform.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 justify-center md:justify-start group cursor-pointer">
            <div className="p-2 rounded-lg transition-colors">
              <Headset className="w-6 h-6 md:w-8 md:h-8 text-[#1873e8]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm md:text-base font-black text-[#0B2347]">24/7 Support</p>
              <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">We are here to help you anytime.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 justify-center md:justify-start group cursor-pointer">
            <div className="p-2 rounded-lg transition-colors">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-[#ea580c]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm md:text-base font-black text-[#0B2347]">Best Quality</p>
              <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">Quality products and services you can trust.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 justify-center md:justify-start group cursor-pointer">
            <div className="p-2 rounded-lg transition-colors">
              <Tag className="w-6 h-6 md:w-8 md:h-8 text-[#8b5cf6]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm md:text-base font-black text-[#0B2347]">Great Deals</p>
              <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">Best prices and exciting offers every day.</p>
            </div>
          </div>
        </div>
      </section>







    </>
  );
}

export default function App() {

  const { showToast } = useToast();

  // View Routing via React Router
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yali_token') || '');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Wallet State
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);

  // Cart & Orders
  const [cartItems, setCartItems] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);

  const navigate = useNavigate();

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([]);

  // -------------------------------------------------------------
  // Location Tracking
  // -------------------------------------------------------------
  useEffect(() => {
    const trackLocation = async () => {
      if (sessionStorage.getItem('locationPrompted')) return;

      sessionStorage.setItem('locationPrompted', 'true');

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let city = '';
            let country = '';

            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                city = geoData.address?.city || geoData.address?.town || geoData.address?.village || '';
                country = geoData.address?.country || '';
              }
            } catch (err) {
              console.warn('Reverse geocoding failed', err);
            }

            let sessionId = sessionStorage.getItem('visitor_session_id');
            if (!sessionId) {
              sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
              sessionStorage.setItem('visitor_session_id', sessionId);
            }

            try {
              await fetch(`${API_URL}/locations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, latitude, longitude, city, country })
              });
            } catch (err) {
              console.error('Failed to save location', err);
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
          }
        );
      }
    };

    const timer = setTimeout(trackLocation, 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchCartItems = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.map(item => ({ ...item, id: item.product_id, cart_item_id: item.id })));
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
    }
  };

  const fetchWishlistItems = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.map(item => ({ ...item, id: item.product_id, wishlist_item_id: item.id })));
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCartItems();
      fetchWishlistItems();
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [token]);

  // Invoice
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Lifted States loaded from Backend
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [banners, setBanners] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uiCards, setUiCards] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Load categories
  const fetchCategories = async () => {
    try {
      const allQuery = userData?.role === 'admin' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/categories${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  // Load sub-categories
  const fetchSubCategories = async () => {
    try {
      const allQuery = userData?.role === 'admin' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/sub-categories${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setSubCategories(data);
      }
    } catch (e) {
      console.error('Failed to load sub-categories', e);
    }
  };

  // 1. Initial Data Fetching
  const fetchProducts = async () => {
    try {
      const allQuery = userData?.role === 'admin' || userData?.role === 'vendor' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/products${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    }
  };

  const fetchBanners = async () => {
    try {
      const allQuery = userData?.role === 'admin' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/banners${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (e) {
      console.error('Failed to load banners', e);
    }
  };

  const fetchCoupons = async () => {
    try {
      const allQuery = userData?.role === 'admin' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/coupons${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error('Failed to load coupons', e);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  };

  const fetchUsers = async () => {
    if (!token || userData?.role !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to load users list', e);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/wallet/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWalletTransactions(data);
      }
    } catch (e) {
      console.error('Failed to load wallet transactions', e);
    }
  };

  const fetchVideos = async () => {
    try {
      const allQuery = userData?.role === 'admin' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/videos${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (e) {
      console.error('Failed to load videos', e);
    }
  };

  const fetchUiCards = async () => {
    try {
      const allQuery = userData?.role === 'admin' ? '?all=true' : '';
      const res = await fetch(`${API_URL}/ui-cards${allQuery}`);
      if (res.ok) {
        const data = await res.json();
        setUiCards(data);
      }
    } catch (e) {
      console.error('Failed to load ui cards', e);
    }
  };

  // Load baseline catalog states
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
    fetchBanners();
    fetchCoupons();
    fetchVideos();
    fetchUiCards();
  }, [userData?.role]); // Re-fetch when auth state changes so admins get 'all=true'

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
        setIsLoggedIn(true);
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (e) {
      console.error('Session verify failed', e);
      handleLogout();
    }
  };

  // Fetch session specific states on login/token change
  useEffect(() => {
    fetchUserData();
  }, [token]);

  // Load orders and transactions when user details change
  useEffect(() => {
    if (isLoggedIn && userData) {
      fetchOrders();
      fetchTransactions();
      if (userData.role === 'admin') {
        fetchUsers();
      }
    }
  }, [isLoggedIn, userData?.role]);

  const handleLogout = () => {
    localStorage.removeItem('yali_token');
    setToken('');
    setIsLoggedIn(false);
    setUserData(null);
    setOrders([]);
    setUsers([]);
    setWalletTransactions([]);
    setCartItems([]);
    setWishlistItems([]);
    setActiveCategory('all');
    navigate('/');
    showToast('Logged out successfully', 'info');
  };



  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      showToast('Please login to add items to cart', 'info');
      setIsAuthOpen(true);
      return;
    }

    if (userData?.status === 'disabled') {
      showToast('Your account is currently disabled. Please contact support.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          selected_variant: product.selectedVariant ? JSON.stringify(product.selectedVariant) : null
        })
      });
      if (res.ok) {
        showToast(`Added "${product.name.substring(0, 30)}..." to cart!`, 'success');
        fetchCartItems();
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (err) {
      showToast('Error adding to cart', 'error');
    }
  };

  const handleBuyNow = async (product) => {
    if (!isLoggedIn) {
      showToast('Please login to continue purchase', 'info');
      setIsAuthOpen(true);
      return;
    }

    if (userData?.status === 'disabled') {
      showToast('Your account is currently disabled. Please contact support.', 'error');
      return;
    }

    setCheckoutItems([{ ...product, quantity: 1 }]);
    navigate('/checkout');
  };

  const handleToggleWishlist = async (product) => {
    if (!isLoggedIn) {
      showToast('Please login to add items to wishlist', 'info');
      setIsAuthOpen(true);
      return;
    }

    if (userData?.status === 'disabled') {
      showToast('Your account is currently disabled. Please contact support.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === 'added') {
          showToast(`Added "${product.name.substring(0, 30)}..." to wishlist!`, 'success');
        } else {
          showToast(`Removed "${product.name.substring(0, 30)}..." from wishlist`, 'info');
        }
        fetchWishlistItems();
      }
    } catch (err) {
      showToast('Error updating wishlist', 'error');
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const cartItem = cartItems.find(item => item.id === productId);
    if (cartItem && cartItem.cart_item_id) {
      await fetch(`${API_URL}/cart/${cartItem.cart_item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity })
      });
      fetchCartItems();
    } else {
      setCartItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)));
    }
  };

  const handleRemoveItem = async (productId) => {
    const cartItem = cartItems.find(item => item.id === productId);
    if (cartItem && cartItem.cart_item_id) {
      await fetch(`${API_URL}/cart/${cartItem.cart_item_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCartItems();
    } else {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      showToast('Please login to proceed to checkout', 'info');
      setIsAuthOpen(true);
      return;
    }
    navigate('/checkout');
  };

  const handlePaymentSuccess = async (enrichedOrder) => {
    // 1. Save placed order details in state for the modal receipt
    setLastOrder(enrichedOrder);
    setCartItems([]);
    navigate('/');

    // Clear cart on backend
    try {
      await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear cart on server:', err);
    }

    // 2. Fetch updated profile (wallet deduction is completed server-side)
    const refreshProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
        }
      } catch (e) {
        console.error(e);
      }
    };
    refreshProfile();

    // 3. Refresh user history
    fetchOrders();
    fetchTransactions();

    // 4. Show Invoice
    setTimeout(() => {
      setShowInvoice(true);
    }, 500);
  };

  const handleAuthSuccess = (newUserData, authToken) => {
    localStorage.setItem('yali_token', authToken);
    setToken(authToken);
    setUserData(newUserData);
    setIsLoggedIn(true);
  };

  const handleAddMoneyToWallet = async (amount) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/wallet/add-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deposit money');

      setUserData(prev => ({ ...prev, wallet: data.newBalance }));
      showToast(`Successfully added ₹${amount} to your wallet!`, 'success');

      fetchTransactions();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleAccountClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      setIsAuthOpen(true);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const hasAdminAccess = userData?.role === 'admin' || userData?.role === 'vendor';

  if (isAdminRoute) {
    if (isLoggedIn && !hasAdminAccess) {
      return <Navigate to="/" replace />;
    }

    return !isLoggedIn ? (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <AdminLogin
          onSuccess={handleAuthSuccess}
          onGoBack={() => navigate('/')}
        />
      </div>
    ) : (
      <AdminDashboard
        products={products}
        setProducts={setProducts}
        orders={orders}
        setOrders={setOrders}
        users={users}
        setUsers={setUsers}
        coupons={coupons}
        setCoupons={setCoupons}
        banners={banners}
        setBanners={setBanners}
        onViewChange={() => navigate('/')}
        userData={userData}
        refreshProducts={fetchProducts}
        refreshBanners={fetchBanners}
        refreshCoupons={fetchCoupons}
        refreshOrders={fetchOrders}
        refreshUsers={fetchUsers}
        videos={videos}
        refreshVideos={fetchVideos}
        token={token}
        categoriesList={categories}
        refreshCategories={fetchCategories}
        uiCards={uiCards}
        refreshUiCards={fetchUiCards}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <ScrollToTop />
      <div>
        <Header
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          onCartClick={() => {
            if (!isLoggedIn) {
              showToast('Please login to view cart', 'info');
              setIsAuthOpen(true);
            } else {
              navigate('/cart');
            }
          }}
          onAccountClick={handleAccountClick}
          isLoggedIn={isLoggedIn}
          userName={userData?.name}
          userRole={userData?.role}
          currentView={'store'}
          onViewChange={() => navigate('/admin')}
          wishlistCount={wishlistItems.length}
          onWishlistClick={() => {
            if (!isLoggedIn) {
              showToast('Please login to view wishlist', 'info');
              setIsAuthOpen(true);
            } else {
              navigate('/wishlist');
            }
          }}
          onLogoutClick={handleLogout}
          products={products}
          categoriesList={categories}
        />

        {/* Store view routes */}
        <main className={`${location.pathname === '/' ? 'w-full' : 'max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6'}`}>
          <PullToRefresh>
            {(() => {
              const activeProducts = products.filter(p => p.status === 'active');
              const activeBanners = banners.filter(b => b.status === 'active');
              const activeCategories = categories.filter(c => c.status === 'active');
              const activeVideos = videos.filter(v => v.status === 'active');
              const activeUiCards = uiCards.filter(c => c.status === 'active');

              return (
                <Routes>
                  <Route path="/" element={
                    <HomePageSections
                      banners={activeBanners}
                      products={activeProducts}
                      videos={activeVideos}
                      categories={activeCategories}
                      uiCards={activeUiCards}
                      wishlistItems={wishlistItems}
                      onCategoryClick={(cat) => navigate(`/category/${cat}`)}
                      onAddToCart={handleAddToCart}
                      onProductClick={(product) => navigate(`/product/${product.id}`)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  } />
                  <Route path="/search" element={
                    <SearchResultsPage
                      products={activeProducts}
                      onAddToCart={handleAddToCart}
                      wishlistItems={wishlistItems}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  } />
                  <Route path="/category/:categoryId" element={
                    <CategoryPageWrapper
                      products={activeProducts}
                      videos={activeVideos}
                      subCategories={subCategories}
                      onAddToCart={handleAddToCart}
                      wishlistItems={wishlistItems}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  } />
                  <Route path="/product/:productId" element={
                    <ProductDetailsPage
                      allProducts={activeProducts}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      wishlistItems={wishlistItems}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  } />
                  <Route path="/cart" element={
                    <CartPage
                      items={cartItems}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      onRefreshCart={fetchCartItems}
                      onProceedToCheckout={() => {
                        setCheckoutItems(cartItems.filter(item => item.status !== 'saved'));
                        navigate('/checkout');
                      }}
                    />
                  } />
                  <Route path="/wishlist" element={
                    <WishlistPage
                      items={wishlistItems}
                      onRemoveItem={(item) => handleToggleWishlist(item)}
                      onAddToCart={handleAddToCart}
                    />
                  } />
                  <Route path="/checkout" element={
                    <CheckoutPage
                      items={checkoutItems.length > 0 ? checkoutItems : cartItems}
                      onPaymentSuccess={handlePaymentSuccess}
                      coupons={coupons}
                      token={token}
                      user={userData}
                    />
                  } />
                  <Route path="/profile" element={
                    <ProfilePage
                      user={userData}
                      orders={orders}
                      transactions={walletTransactions}
                      onAddMoney={handleAddMoneyToWallet}
                      onLogout={handleLogout}
                    />
                  } />
                  <Route path="/orders" element={
                    <MyOrdersPage
                      orders={orders}
                      token={token}
                      refreshOrders={fetchOrders}
                      refreshUserData={fetchUserData}
                      API_URL={API_URL}
                    />
                  } />
                  <Route path="/page/:slug" element={<StaticPage />} />
                  <Route path="/p/:pageId" element={
                    <CustomPage
                      products={activeProducts}
                      videos={activeVideos}
                      banners={activeBanners}
                      uiCards={activeUiCards}
                      wishlistItems={wishlistItems}
                      onAddToCart={handleAddToCart}
                      onProductClick={(product) => navigate(`/product/${product.id}`)}
                      onToggleWishlist={handleToggleWishlist}
                      ProductScrollRowComponent={ProductScrollRow}
                    />
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              );
            })()}
          </PullToRefresh>
        </main>
      </div>

      <Footer />

      <MobileBottomNav
        cartCount={cartItems.length}
        onCartClick={() => navigate('/cart')}
        onAccountClick={handleAccountClick}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <WalletDisplay
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={userData?.wallet || 0}
        onAddMoney={handleAddMoneyToWallet}
        transactions={walletTransactions}
      />

      {lastOrder && (
        <InvoiceModal
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          items={lastOrder.items}
          orderId={lastOrder.orderId}
          orderDate={lastOrder.orderDate}
          customerName={lastOrder.customerName}
          customerEmail={lastOrder.customerEmail}
          address={lastOrder.address}
          paymentMethod={lastOrder.paymentMethod}
          subtotal={lastOrder.subtotal}
          tax={lastOrder.tax}
          shipping={lastOrder.shipping}
          discount={lastOrder.discount}
          total={lastOrder.total}
        />
      )}
    </div>
  );
}
