import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../utils/currency';

export function CartPage({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <ShoppingBag className="w-8 h-8 text-[#0066cc]" />
            <h1 className="text-3xl font-black text-gray-900">Your Cart</h1>
            <span className="bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {items.length} Items
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <ShoppingBag className="w-24 h-24 text-gray-300 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is feeling light</h2>
              <p className="text-gray-500 mb-8 max-w-sm">There is nothing in your cart. Let's add some items.</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors bg-gray-50/50">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {item.name}
                        </h3>
                        <span className="text-2xl font-black text-[#0066cc]">
                          {formatINR(item.price)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 sm:mt-0">
                        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="font-bold w-6 text-center text-lg">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors font-bold cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="bg-gray-50 p-6 sm:p-8 border-t border-gray-200">
              <div className="max-w-md ml-auto space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>GST (18%)</span>
                    <span>{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onProceedToCheckout(items)}
                  className="w-full py-4 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-black text-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-white transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
