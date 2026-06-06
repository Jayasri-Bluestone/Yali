import { X, Star, ShoppingCart, Heart, Share2, Play, ChevronLeft, ChevronRight, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../utils/currency';

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart, isWishlisted, onToggleWishlist }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const gallery = product.gallery || [product.image];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  const totalReviewsCount = typeof product.reviews === 'number'
    ? product.reviews
    : (Array.isArray(product.reviews)
        ? product.reviews.length
        : (product.reviews_count || 0));

  if (!isOpen) return null;

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : (parseFloat(product.rating) || 5.0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-1">{product.name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image/Video */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {showVideo && product.videoUrl ? (
                  <div className="w-full h-full">
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      src={product.videoUrl}
                    />
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors"
                    >
                      Show Images
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageWithFallback
                      src={gallery[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((selectedImage - 1 + gallery.length) % gallery.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage((selectedImage + 1) % gallery.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {product.videoUrl && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Watch Video
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-5 gap-2">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setShowVideo(false);
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index && !showVideo ? 'border-[#0066cc]' : 'border-gray-200'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {product.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-900 ${
                      showVideo ? 'border-[#0066cc]' : 'border-gray-200'
                    }`}
                  >
                    <Play className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Price & Rating */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900">{formatINR(product.price)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">{formatINR(product.originalPrice)}</span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">({totalReviewsCount.toLocaleString()} reviews)</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {(product.stock || 50) > 10 ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-orange-600 font-medium">Only {product.stock || 5} left</span>
                  </>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Key Features:</h3>
                <ul className="space-y-2">
                  {(product.features || [
                    'Premium build quality',
                    'Latest technology',
                    '1-year warranty included',
                    'Free shipping available'
                  ]).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block font-semibold text-gray-900 mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      onAddToCart(product);
                    }
                    onClose();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded-xl font-semibold hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onToggleWishlist?.(product)}
                    className={`py-3 border-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isWishlisted
                        ? 'border-red-500 text-red-500 bg-red-50'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>
                  <button className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-[#0066cc] mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">Free Shipping</div>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#10b981] mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">Warranty</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-[#22d3ee] mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">Easy Returns</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200 p-4 md:p-6">
            {/* Tab Headers */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === 'description' ? 'text-[#0066cc]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
                {activeTab === 'description' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === 'specs' ? 'text-[#0066cc]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Specifications
                {activeTab === 'specs' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === 'reviews' ? 'text-[#0066cc]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({totalReviewsCount})
                {activeTab === 'reviews' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'Experience cutting-edge technology with this premium electronic device. Designed for performance and reliability, it delivers exceptional quality and user experience. Perfect for both professional and personal use.'}
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(product.specs || [
                  { label: 'Brand', value: 'Premium Tech' },
                  { label: 'Model', value: '2026 Edition' },
                  { label: 'Warranty', value: '1 Year' },
                  { label: 'Color', value: 'Multiple Options' }
                ]).map((spec, index) => (
                  <div key={index} className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-700">{spec.label}</span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{review.author}</span>
                            {review.verified && (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((img, idx) => (
                            <ImageWithFallback
                              key={idx}
                              src={img}
                              alt={`Review ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
