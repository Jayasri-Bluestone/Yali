import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, ShieldCheck, Share2, Tag, Truck } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { ProductCard } from './ProductCard';

export function ProductDetailsPage({ 
  allProducts, 
  onAddToCart, 
  wishlistItems, 
  onToggleWishlist 
}) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');

  const product = useMemo(() => allProducts.find(p => p.id === Number(productId)), [allProducts, productId]);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#0066cc] text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some(i => i.id === product.id);

  // Derived related products (same category, excluding this one)
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 5);
  }, [allProducts, product]);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-4 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Breadcrumb / Back Button */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <span className="capitalize">{product.category.replace('-', ' ')}</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row">
            
            {/* Left: Image Gallery (Sticky) */}
            <div className="md:w-1/2 p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 relative">
              {discountPercent && (
                <div className="absolute top-10 left-10 z-10 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  {discountPercent}% OFF
                </div>
              )}
              {product.badge && (
                <div className="absolute top-10 right-10 z-10 bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  {product.badge}
                </div>
              )}
              
              <div className="sticky top-24 aspect-square rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'; }}
                />
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="md:w-1/2 p-6 md:p-12">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                  {product.category.replace('-', ' ')}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                {product.rating && (
                  <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <span className="text-sm font-bold text-green-700">{product.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                  </div>
                )}
                {product.isAssured || (product.rating >= 4) && (
                  <div className="flex items-center gap-1 text-sm font-bold text-[#2874f0] italic">
                    <ShieldCheck className="w-5 h-5" /> Y-Assured
                  </div>
                )}
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-black text-gray-900">{formatINR(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-400 font-medium line-through decoration-2">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => onAddToCart(product)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button 
                  onClick={() => onToggleWishlist(product)}
                  className={`flex items-center justify-center gap-2 font-black py-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isWishlisted 
                      ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} /> 
                  {isWishlisted ? 'Saved' : 'Wishlist'}
                </button>
              </div>

              <div className="flex items-center gap-6 py-5 border-y border-gray-100 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Free Delivery</div>
                    <div className="text-xs text-gray-500">Orders over ₹500</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Best Price</div>
                    <div className="text-xs text-gray-500">Guaranteed</div>
                  </div>
                </div>
              </div>

              {/* Product Info Tabs */}
              <div>
                <div className="flex gap-6 border-b border-gray-200 mb-6">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
                      activeTab === 'description' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Description
                  </button>
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
                      activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Details
                  </button>
                </div>
                
                <div className="text-gray-600 text-sm leading-relaxed prose max-w-none">
                  {activeTab === 'description' ? (
                    <p>{product.description || 'No description available for this product.'}</p>
                  ) : (
                    <ul className="space-y-2">
                      <li className="flex"><span className="w-32 font-semibold text-gray-900">Category:</span> <span className="capitalize">{product.category.replace('-', ' ')}</span></li>
                      <li className="flex"><span className="w-32 font-semibold text-gray-900">Stock:</span> <span>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</span></li>
                      {product.vendor_id && <li className="flex"><span className="w-32 font-semibold text-gray-900">Vendor ID:</span> <span>{product.vendor_id}</span></li>}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RELATED PRODUCTS
        ══════════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900">Related Products</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.map(relProduct => (
                <div key={relProduct.id} className="relative group">
                  {relProduct.discount && (
                    <div className="absolute top-2 left-2 z-10 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md bg-indigo-500">
                      {relProduct.discount}% OFF
                    </div>
                  )}
                  <ProductCard 
                    product={relProduct} 
                    onAddToCart={onAddToCart} 
                    onProductClick={(p) => navigate(`/product/${p.id}`)}
                    isWishlisted={wishlistItems.some(i => i.id === relProduct.id)} 
                    onToggleWishlist={onToggleWishlist} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
