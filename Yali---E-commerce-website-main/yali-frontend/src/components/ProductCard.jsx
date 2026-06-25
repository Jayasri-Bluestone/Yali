import { Star, Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../utils/currency';

export function ProductCard({ product, onAddToCart, onProductClick, isWishlisted, onToggleWishlist, isNew }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onProductClick?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100/80 overflow-hidden group cursor-pointer flex flex-col h-full relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 p-4">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges - Top Left */}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5 z-10">
          {isNew && (
            <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
              New In
            </span>
          )}
          
          {product.badge && (
            <span className="bg-[#0066cc] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Top Right Controls (Wishlist) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          className={`absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-20 ${isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0'}`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Overlay Add to Cart button (Appears on hover) */}
        <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white/90 via-white/50 to-transparent flex flex-col justify-end transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!product.cta_action || product.cta_action === 'buy_now') {
                onAddToCart(product);
              } else {
                onProductClick?.(product);
              }
            }}
            className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl transition-transform active:scale-95"
          >
            {(!product.cta_action || product.cta_action === 'buy_now') ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            ) : (
              <>
                View Details
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        {/* Brand / Category Line */}
        <div className="flex items-center justify-between mb-2">
          {product.brand ? (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {product.brand}
            </span>
          ) : (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {product.category?.replace(/-/g, ' ') || 'YALI'}
            </span>
          )}
          
          {/* Subtle Rating */}
          {(product.rating > 0) && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-3 group-hover:text-[#0066cc] transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[11px] font-semibold text-gray-400 line-through mb-0.5">
                {formatINR(product.originalPrice)}
              </span>
            )}
            <span className="text-lg font-black text-gray-900 tracking-tight">
              {formatINR(product.price)}
            </span>
          </div>
          
          {product.discount > 0 && (
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
              -{product.discount}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
