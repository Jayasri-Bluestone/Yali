import React from 'react';
import { HeroBanner } from '../HeroBanner';
import { HomeVideoSection } from '../HomeVideoSection';
import { Sparkles, TrendingUp, Tag, Zap, Star, Award, Gift, Shield, Clock, Flame, BadgePercent, Package, Heart, ChevronRight } from 'lucide-react';
import { formatINR } from '../../utils/currency';

// We map icon string names from db to lucide icons
const ICONS = { Sparkles, TrendingUp, Tag, Zap, Star, Award, Gift, Shield, Clock, Flame, BadgePercent, Package, Heart };

export function SectionHeader({ iconName, iconColor, title, subtitle, action, onAction }) {
  const Icon = ICONS[iconName] || Tag;
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {iconName && (
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
          className="flex items-center gap-1 text-sm font-semibold text-[#0066cc] hover:text-[#0052a3] transition-colors group cursor-pointer"
        >
          {action}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

// Pass ProductScrollRow, ProductCard down from parent if needed, or import them directly.
// For simplicity, we assume parent passes them or we import them if they are decoupled.
// Since App.jsx has ProductScrollRow defined inside it, we might need to extract ProductScrollRow to a separate file, or pass it as a prop.

export function DynamicSectionRenderer({ 
  section, 
  products, 
  videos, 
  banners,
  uiCards,
  wishlistItems, 
  onAddToCart, 
  onProductClick, 
  onToggleWishlist,
  onCategoryClick,
  ProductScrollRowComponent
}) {
  const content = section.content || {};

  switch (section.section_type) {
    case 'hero_banner':
      // The hero banner uses global banners. We could filter them based on category if needed.
      return <HeroBanner banners={banners} onCategoryClick={onCategoryClick} />;

    case 'trust_cards':
      // Uses uiCards where section='trust_card'
      const trustItems = uiCards.filter(c => c.section === 'trust_card').map(c => ({
        icon: ICONS[c.icon] || Tag, label: c.title, sub: c.subtitle, color: c.color_gradient || 'from-blue-500 to-cyan-400'
      }));
      return (
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
      );

    case 'categories_grid':
      const brandCards = uiCards.filter(c => c.section === 'category_card').map(c => ({
        label: c.title, gradient: c.color_gradient || 'from-blue-600 to-blue-400',
        icon: ICONS[c.icon] || Tag, cat: c.link_url, emoji: c.icon && [...c.icon].length <= 2 ? c.icon : '✨'
      }));
      return (
        <section className="mt-10">
          <SectionHeader iconName={content.icon || "Sparkles"} iconColor="bg-gradient-to-br from-violet-500 to-purple-400" title={section.title} subtitle={section.subtitle} />
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
      );

    case 'product_carousel':
    case 'trending_now':
    case 'best_sellers':
    case 'new_arrivals':
    case 'flash_deals':
      // Dynamic product filtering
      let displayProducts = [...products];
      if (content.filter === 'trending') {
        displayProducts.sort((a,b) => (b.rating||0) - (a.rating||0));
      } else if (content.filter === 'best_sellers') {
        displayProducts = displayProducts.filter(p => (p.reviews_count || 0) > 5 || p.rating >= 4);
      } else if (content.filter === 'flash_deals') {
        displayProducts = displayProducts.filter(p => p.stock > 0 && p.discount > 0);
      } else if (content.filter === 'latest') {
        displayProducts.reverse();
      }
      displayProducts = displayProducts.slice(0, content.limit || 8);

      return (
        <section className="mt-10">
          <SectionHeader iconName={content.icon || "TrendingUp"} iconColor={content.color || "bg-gradient-to-br from-[#0066cc] to-cyan-400"} title={section.title} subtitle={section.subtitle} />
          {ProductScrollRowComponent && (
            <ProductScrollRowComponent 
              products={displayProducts} 
              wishlistItems={wishlistItems} 
              onAddToCart={onAddToCart} 
              onProductClick={onProductClick} 
              onToggleWishlist={onToggleWishlist} 
              autoScroll={content.autoScroll || false} 
            />
          )}
        </section>
      );

    case 'video_showcase':
      return <HomeVideoSection videos={videos} onCategoryClick={onCategoryClick} />;

    case 'promo_banner':
      const promos = uiCards.filter(c => c.section === 'promo_card');
      if (promos.length === 0) return null;
      return (
        <section className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promos.map(promo => (
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
      );

    default:
      return null;
  }
}
