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
import { API_URL } from './config';
import { AdminLogin } from './components/admin/AdminLogin';
import { StaticPage } from './components/StaticPage';
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
  Heart
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
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${iconColor || 'bg-gradient-to-br from-[#0066cc] to-[#10b981]'}`}>
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

      {/* ── 2. TRUST STRIP (Amazon-style scrolling ticker) ── */}
      <div className="mt-5 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="animate-marquee py-3 px-2">
          {[...trustItems, ...trustItems].map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap border-r border-gray-100 last:border-0">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                <t.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900">{t.label}</span>
                <span className="text-xs text-gray-400 ml-1.5">{t.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. SHOP BY CATEGORY ── */}
      <section className="mt-10">
        <SectionHeader icon={Sparkles} iconColor="bg-gradient-to-br from-violet-500 to-purple-400" title="Shop by Category" subtitle="Find what you're looking for" />
        <div className="grid grid-cols-5 gap-3">
          {brandCards.map((bc) => (
            <button
              key={bc.cat}
              onClick={() => onCategoryClick(bc.cat)}
              className={`group flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${bc.gradient} text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
            >
              <span className="text-3xl">{bc.emoji}</span>
              <span className="text-xs font-black text-center leading-tight">{bc.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 4. FLASH DEALS (Flipkart-style with live countdown) ── */}
      <section className="mt-10">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#0066cc] via-[#0080ff] to-[#10b981] p-5 mb-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Flash Deals</h2>
                <p className="text-white/70 text-xs font-medium">Limited time · Unbeatable prices</p>
              </div>
            </div>
            {/* Live countdown */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Ends in</span>
              {[{ v: countdown.h, l: 'HRS' }, { v: countdown.m, l: 'MIN' }, { v: countdown.s, l: 'SEC' }].map(({ v, l }, i) => (
                <div key={l} className="flex items-center gap-1">
                  {i > 0 && <span className="text-white/60 font-bold text-lg">:</span>}
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1.5 text-center min-w-[52px]">
                    <div className="text-xl font-black text-white tabular-nums">{pad(v)}</div>
                    <div className="text-[9px] text-white/60 font-bold tracking-widest">{l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ProductScrollRow products={flashDeals.length > 0 ? flashDeals : products.slice(0, 8)} wishlistItems={wishlistItems} onAddToCart={onAddToCart} onProductClick={onProductClick} onToggleWishlist={onToggleWishlist} />
      </section>

      {/* ── 5. DEAL OF THE DAY (Amazon-style hero deal) ── */}
      {products.length > 0 && (
        <section className="mt-10">
          <SectionHeader icon={Clock} iconColor="bg-gradient-to-br from-orange-500 to-red-400" title="Deal of the Day" subtitle="Handpicked offer · Refreshes daily" action="See all deals" onAction={() => { }} />
          <div className="flex flex-col md:flex-row gap-5 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Main deal product */}
            {(() => {
              const deal = products.find(p => p.discount > 0) || products[0];
              if (!deal) return null;
              return (
                <>
                  <div
                    onClick={() => onProductClick?.(deal)}
                    className="md:w-72 flex-shrink-0 relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 cursor-pointer group"
                  >
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-48 h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80'; }}
                    />
                    {deal.discount && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                        {deal.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full mb-3 w-fit">
                      <Flame className="w-3 h-3" /> Deal of the Day
                    </span>
                    <h3
                      onClick={() => onProductClick?.(deal)}
                      className="text-xl font-black text-gray-900 mb-2 cursor-pointer hover:text-[#0066cc] transition-colors line-clamp-2"
                    >{deal.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-black text-gray-900">{formatINR(deal.price)}</span>
                      {deal.originalPrice && <span className="text-base text-gray-400 line-through">{formatINR(deal.originalPrice)}</span>}
                    </div>
                    {deal.rating && (
                      <div className="flex items-center gap-1.5 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(deal.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 font-semibold">{deal.rating}</span>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => onAddToCart(deal)}
                        className="flex-1 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all text-sm cursor-pointer"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => onProductClick?.(deal)}
                        className="px-5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  {/* Side mini-deals */}
                  <div className="hidden lg:flex flex-col gap-0 border-l border-gray-100 divide-y divide-gray-100 w-64 flex-shrink-0">
                    {products.slice(1, 4).map(sp => (
                      <div
                        key={sp.id}
                        onClick={() => onProductClick?.(sp)}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <img src={sp.image} alt={sp.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&q=80'; }} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2">{sp.name}</p>
                          <p className="text-sm font-black text-[#0066cc]">{formatINR(sp.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* ── 6. VIDEO SHOWCASE (Meesho-style reels) ── */}
      <HomeVideoSection videos={videos} onCategoryClick={onCategoryClick} />

      {/* ── 7. TRENDING NOW (Flipkart horizontal scroll) ── */}
      <section className="mt-10">
        <SectionHeader
          icon={TrendingUp}
          iconColor="bg-gradient-to-br from-[#0066cc] to-cyan-400"
          title="Trending Now"
          subtitle="What everyone is buying"
          action="View all"
          onAction={() => navigate('/search')}
        />
        <ProductScrollRow products={trendingProducts} wishlistItems={wishlistItems} onAddToCart={onAddToCart} onProductClick={onProductClick} onToggleWishlist={onToggleWishlist} autoScroll={true} />
      </section>

      {/* ── 8. TOP PICKS FOR YOU (Amazon-style: 1 big + 4 small) ── */}
      {products.length >= 5 && (
        <section className="mt-10">
          <SectionHeader icon={Star} iconColor="bg-gradient-to-br from-amber-500 to-orange-400" title="Top Picks For You" subtitle="Curated just for you" action="See more" onAction={() => navigate('/search')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Big featured card */}
            {topPicksMain && (
              <div
                onClick={() => onProductClick?.(topPicksMain)}
                className="md:row-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-64 md:h-80 bg-gray-50 overflow-hidden">
                  <img
                    src={topPicksMain.image}
                    alt={topPicksMain.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'; }}
                  />
                  {topPicksMain.discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">{topPicksMain.discount}% OFF</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 line-clamp-2 mb-1">{topPicksMain.name}</p>
                  <p className="text-xl font-black text-[#0066cc]">{formatINR(topPicksMain.price)}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(topPicksMain); }}
                    className="mt-3 w-full bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white text-sm font-bold py-2.5 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  >Add to Cart</button>
                </div>
              </div>
            )}
            {/* 4 side cards */}
            {topPicksSide.map(p => (
              <div
                key={p.id}
                onClick={() => onProductClick?.(p)}
                className="flex gap-3 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group items-center"
              >
                <img
                  src={p.image} alt={p.name}
                  className="w-16 h-16 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&q=80'; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{p.name}</p>
                  <p className="text-base font-black text-[#0066cc] mt-0.5">{formatINR(p.price)}</p>
                  {p.discount && <p className="text-xs text-red-500 font-bold">{p.discount}% off</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 9. MID-PAGE PROMO BANNER (Meesho-style split) ── */}
      {promoCards.length > 0 && (
        <section className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoCards.map(promo => (
              <div
                key={promo.id}
                onClick={() => promo.link_url && onCategoryClick(promo.link_url)}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${promo.color_gradient || 'from-gray-500 to-gray-600'} p-7 cursor-pointer group hover:shadow-xl transition-shadow`}
                style={promo.image_url ? { backgroundImage: `url(${promo.image_url})`, backgroundSize: 'cover' } : {}}
              >
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
                {promo.icon && <span className="relative inline-block bg-white/25 text-white text-xs font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider">{promo.icon}</span>}
                <h3 className="relative text-2xl font-black text-white mb-1">{promo.title}</h3>
                {promo.subtitle && <p className="relative text-white/80 text-sm mb-4">{promo.subtitle}</p>}
                <span className="relative inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs font-black px-4 py-2 rounded-full group-hover:gap-2.5 transition-all">
                  Explore Now <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 10. BEST SELLERS (horizontal scroll) ── */}
      <section className="mt-10">
        <SectionHeader icon={Award} iconColor="bg-gradient-to-br from-[#10b981] to-teal-400" title="Best Sellers" subtitle="Most loved by our customers" action="View all" onAction={() => navigate('/search')} />
        <ProductScrollRow products={bestSellers.length > 0 ? bestSellers : products.slice(0, 8)} wishlistItems={wishlistItems} onAddToCart={onAddToCart} onProductClick={onProductClick} onToggleWishlist={onToggleWishlist} />
      </section>

      {/* ── 11. SHOP BY BUDGET (Meesho filter pills) ── */}
      <section className="mt-10">
        <SectionHeader icon={BadgePercent} iconColor="bg-gradient-to-br from-pink-500 to-rose-400" title="Shop by Budget" subtitle="Pick your price range" />
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {budgetRanges.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setBudgetFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all cursor-pointer ${budgetFilter === value
                  ? 'budget-pill-active shadow-md'
                  : 'border-gray-300 text-gray-600 bg-white hover:border-[#0066cc] hover:text-[#0066cc]'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        {budgetProducts.length > 0 ? (
          <ProductScrollRow products={budgetProducts.slice(0, 10)} wishlistItems={wishlistItems} onAddToCart={onAddToCart} onProductClick={onProductClick} onToggleWishlist={onToggleWishlist} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products in this budget range yet.</p>
          </div>
        )}
      </section>

      {/* ── 12. NEW ARRIVALS ── */}
      <section className="mt-10">
        <SectionHeader icon={Package} iconColor="bg-gradient-to-br from-violet-500 to-indigo-500" title="New Arrivals" subtitle="Just landed · Fresh picks" action="View all" onAction={() => navigate('/search')} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArrivals.slice(0, 8).map(p => (
            <div key={p.id}>
              <ProductCard
                product={p}
                onAddToCart={onAddToCart}
                onProductClick={onProductClick}
                isWishlisted={wishlistItems.some(item => item.id === p.id)}
                onToggleWishlist={onToggleWishlist}
                isNew={true}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 13. BRAND / CATEGORY SHOWCASE ── */}
      <section className="mt-10">
        <SectionHeader icon={Sparkles} iconColor="bg-gradient-to-br from-amber-500 to-orange-400" title="Explore by Category" subtitle="Dive deeper into each world" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {brandCards.map((bc) => (
            <button
              key={bc.cat}
              onClick={() => onCategoryClick(bc.cat)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bc.gradient} p-5 text-left cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md`}
            >
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <bc.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-black text-sm">{bc.label}</p>
              <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop now <ChevronRight className="w-3 h-3" />
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── 14. WHY SHOP WITH YALI (trust cards) ── */}
      <section className="mt-10 mb-4">
        <SectionHeader icon={Heart} iconColor="bg-gradient-to-br from-rose-500 to-pink-400" title="Why Shop with YALI?" subtitle="Trusted by thousands of happy customers" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustItems.map((t, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-12 h-12 bg-gradient-to-br ${t.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                <t.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">{t.label}</p>
              <p className="text-gray-500 text-xs">{t.sub}</p>
            </div>
          ))}
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
        <main className="max-w-7xl mx-auto px-4 py-6">
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
        </main>
      </div>

      <Footer />

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
