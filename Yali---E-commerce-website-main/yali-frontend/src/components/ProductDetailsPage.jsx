import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, ShieldCheck, Share2, Tag, Truck, MapPin, RefreshCcw, CheckCircle, Clock, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { API_URL } from '../config';
import { ProductCard } from './ProductCard';
import { useToast } from '../context/ToastContext';

export function ProductDetailsPage({ 
  allProducts,
  onAddToCart,
  onBuyNow,
  wishlistItems = [],
  onToggleWishlist 
}) {
  const { productId } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(null);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', media: [] });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const token = localStorage.getItem('yali_token');
  const userStr = localStorage.getItem('yali_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const product = useMemo(() => allProducts.find(p => p.id === Number(productId)), [allProducts, productId]);

  const productImages = useMemo(() => {
    if (!product) return [];
    let extra = [];
    if (product.images) {
      try { extra = JSON.parse(product.images); } catch(e) {}
    }
    return [product.image, ...extra].filter(Boolean).filter(img => {
      if (typeof img !== 'string') return false;
      // Filter out broken base64 prefixes (missing comma/data)
      if (img.startsWith('data:')) return img.includes(',');
      // Filter out broken base64 payloads (looks like a path but has no extension, typical base64 starts with /9j/)
      if (img.startsWith('/9j/') || (img.startsWith('/') && !img.includes('.'))) return false;
      return true;
    });
  }, [product]);

  const currentImage = selectedImage || (productImages.length > 0 ? productImages[0] : product?.image);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (productImages.length <= 1) return;
    const currentIndex = productImages.indexOf(currentImage);
    const newIndex = currentIndex <= 0 ? productImages.length - 1 : currentIndex - 1;
    setSelectedImage(productImages[newIndex]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (productImages.length <= 1) return;
    const currentIndex = productImages.indexOf(currentImage);
    const newIndex = currentIndex === productImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(productImages[newIndex]);
  };

  useEffect(() => {
    if (product) {
      fetchReviews();
      setSelectedImage(null);
      setActiveTab('description');
    }
  }, [product]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_URL}/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!token) return showToast('Please login to upload media', 'error');
    
    setIsUploadingMedia(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const type = file.type.startsWith('video') ? 'video' : 'image';
      
      setReviewForm(prev => ({ 
        ...prev, 
        media: [...prev.media, { url: base64Url, type }] 
      }));
      setIsUploadingMedia(false);
      e.target.value = '';
    };
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
      setIsUploadingMedia(false);
      e.target.value = '';
    };
    
    reader.readAsDataURL(file);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return showToast('Please login to submit a review', 'error');
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('SERVER ERROR RESPONSE:', res.status, errorText);
        let errorMsg = 'Failed to submit';
        try {
          const data = JSON.parse(errorText);
          errorMsg = data.error || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      
      showToast('Review submitted successfully!', 'success');
      setReviewForm({ rating: 5, comment: '', media: [] });
      fetchReviews();
    } catch(err) {
      showToast(err.message, 'error');
      console.error('Review submit caught error:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const checkDelivery = () => {
    if (pincode.length === 6 && !isNaN(pincode)) {
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(deliveryDate.getDate() + (product?.delivery_days || 3));
      setDeliveryInfo({
        status: 'success',
        message: `Free delivery by ${deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}`
      });
    } else {
      setDeliveryInfo({
        status: 'error',
        message: 'Please enter a valid 6-digit PIN code'
      });
    }
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 5);
  }, [allProducts, product]);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#0066cc] text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some(i => i.id === product.id);

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
            
            {/* Left: Image Gallery & Details */}
            <div className="md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-white relative flex flex-col gap-8">
              
              {/* Image Gallery */}
              <div className="flex flex-col md:flex-row gap-4">
              
              {/* Mobile Thumbnails */}
              <div className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x">
                {productImages.map((img, idx) => (
                  <button
                    key={`mob-thumb-${idx}`}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 shrink-0 snap-start rounded-xl border-2 overflow-hidden bg-gray-50 flex items-center justify-center p-1 transition-all ${currentImage === img ? 'border-indigo-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>

              {/* Desktop Thumbnails */}
              <div className="hidden md:flex flex-col gap-3 w-20 shrink-0 h-fit">
                {productImages.map((img, idx) => (
                  <button
                    key={`desk-thumb-${idx}`}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-xl border-2 overflow-hidden bg-gray-50 flex items-center justify-center p-1 transition-all ${currentImage === img ? 'border-indigo-600 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 min-w-0 aspect-[4/3] md:aspect-auto md:min-h-[400px] md:max-h-[500px] rounded-2xl bg-white overflow-hidden shadow-sm p-4 relative group flex items-center justify-center border border-gray-200">
                {/* Badges Overlay Container */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {discountPercent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] md:text-xs font-black px-2.5 py-1 md:px-3 md:py-1 rounded-full shadow-md">
                      {discountPercent}% OFF
                    </div>
                  )}
                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] md:text-xs font-black px-2.5 py-1 md:px-3 md:py-1 rounded-full shadow-md">
                      {product.badge}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist?.(product);
                  }}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
                </button>
                
                {/* Slider Controls */}
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 md:left-4 z-20 bg-white/80 backdrop-blur hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 md:right-4 z-20 bg-white/80 backdrop-blur hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Image */}
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain mix-blend-multiply transition-opacity duration-300"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'; }}
                />

                {/* Dots Indicator */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {productImages.map((img, idx) => (
                      <button
                        key={`dot-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(img);
                        }}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          currentImage === img ? 'bg-indigo-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Title & Description */}
            <div className="border-t border-gray-100 pt-8 mt-4">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>
              <div className="text-gray-600 text-sm leading-relaxed prose max-w-none">
                <p>{product.description || 'No description available for this product.'}</p>
              </div>
            </div>

            {/* Item Details */}
            <div className="border-t border-gray-100 pt-8 mt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Item Details</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex"><span className="w-32 font-semibold text-gray-900">Category:</span> <span className="capitalize">{product.category.replace('-', ' ')}</span></li>
                <li className="flex"><span className="w-32 font-semibold text-gray-900">Stock:</span> <span>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</span></li>
                {product.vendor_id && <li className="flex"><span className="w-32 font-semibold text-gray-900">Vendor ID:</span> <span>{product.vendor_id}</span></li>}
              </ul>
            </div>
            </div>

            {/* Right: Product Details */}
            <div className="md:w-1/2 p-6 md:p-12">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                  {product.category.replace('-', ' ')}
                </span>
              </div>
              


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

              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Deliver to
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter Delivery Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={checkDelivery}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Check
                  </button>
                </div>
                {deliveryInfo && (
                  <p className={`mt-2 text-xs font-semibold flex items-center gap-1 ${deliveryInfo.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {deliveryInfo.status === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                    {deliveryInfo.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => onBuyNow(product)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Buy Now
                </button>
                <button 
                  onClick={() => onAddToCart(product)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-5 border-y border-gray-100 mb-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <RefreshCcw className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{product.return_policy ? product.return_policy.split(' ')[0] + ' ' + product.return_policy.split(' ')[1] : '7 Days'}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">{product.return_policy ? product.return_policy.split(' ').slice(2).join(' ') : 'Replacement'}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Free Delivery</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">YALI Assured</div>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Secure</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Transaction</div>
                  </div>
                </div>
              </div>



              {/* Reviews Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Reviews</h3>
                {/* Review Form */}
                {token ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3">Write a Review</h4>
                    <form onSubmit={submitReview} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="p-1 focus:outline-none cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${reviewForm.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Comment</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          rows="3"
                          placeholder="What did you like or dislike?"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Attach Photos/Videos</label>
                        <div className="flex flex-wrap gap-3">
                          {reviewForm.media.map((item, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                              {item.type === 'video' ? (
                                <video src={item.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={item.url} alt="upload" className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => setReviewForm(p => ({ ...p, media: p.media.filter((_, i) => i !== idx) }))}
                                className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow hover:bg-gray-100 cursor-pointer"
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          ))}
                          <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                            {isUploadingMedia ? (
                              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <ImagePlus className="w-5 h-5 text-gray-400" />
                            )}
                            <input 
                              type="file" 
                              accept="image/*,video/*" 
                              className="hidden" 
                              onChange={handleFileUpload} 
                              disabled={isUploadingMedia} 
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview || isUploadingMedia}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-indigo-50 p-4 rounded-xl text-center mb-6">
                    <p className="text-sm text-indigo-800 font-semibold mb-2">Login to write a review</p>
                    <button onClick={() => navigate('/login')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold cursor-pointer">Login</button>
                  </div>
                )}

                {/* Reviews List */}
                {loadingReviews ? (
                  <p className="text-gray-500 text-center py-4">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {review.author_name ? review.author_name[0].toUpperCase() : 'U'}
                          </div>
                          <span className="font-bold text-gray-900">{review.author_name || 'User'}</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      {review.media && review.media.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {review.media.map((item, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                              {item.type === 'video' ? (
                                <video src={item.url} controls className="w-full h-full object-cover" />
                              ) : (
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                  <img src={item.url} alt="Review media" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
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
