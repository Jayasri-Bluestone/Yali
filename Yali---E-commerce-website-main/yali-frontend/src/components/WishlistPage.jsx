import { X, Trash2, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../utils/currency';

export function WishlistPage({
  items,
  onRemoveItem,
  onAddToCart
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-black text-gray-900">Your Wishlist</h1>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {items.length} Items
            </span>
          </div>
        </div>
        {/* Wishlist Items List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[50vh]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="w-24 h-24 text-gray-200 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-8 max-w-sm">Save items you like here to purchase them later.</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors bg-gray-50/50 hover:shadow-md group">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 text-lg hover:text-[#0066cc] cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                          {item.name}
                        </h3>
                        <span className="text-xl font-black text-[#0066cc]">
                          {formatINR(item.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                        {/* Quick Add to Cart */}
                        <button
                          onClick={() => {
                            onAddToCart(item);
                            onRemoveItem(item); // optionally remove from wishlist after adding to cart
                          }}
                          className="flex-1 py-3 bg-[#0066cc] text-white rounded-xl text-sm font-bold hover:bg-[#0052a3] transition-colors flex justify-center items-center gap-2 cursor-pointer"
                        >
                        </button>

                        {/* Remove from Wishlist */}
                        <button
                          onClick={() => onRemoveItem(item)}
                          className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer border border-red-100"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>


  );
}
